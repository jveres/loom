// morph(from, to) — patch a live DOM subtree to match a freshly built one,
// preserving node identity wherever the shapes align. Identity is what keeps
// expensive state alive across re-renders: iframe documents, playing media,
// canvas contents, scroll positions, CSS animations.
//
// Matching is positional by node type and tag, with an optional `key` hook
// that matches elements by a stable key (e.g. a data attribute) before
// position — the same idea as list()'s keyed reconcile, applied to a whole
// subtree. Reordered keyed children move via the shared LIS positioner
// (positionOrdered), so a matched iframe survives even a far reorder — with
// the minimum number of atomic moves.
//
// Scope: morph is for STATIC trees (server-rendered HTML, builders with no
// event handlers or reactive bindings). It syncs attributes, text, and form
// values; it does not transplant event listeners or loom effects from the
// new tree — nodes adopted from `to` keep theirs, matched nodes keep their
// original ones. Like list()/each(), a duplicate key (in either tree) throws.

import { positionOrdered } from "./place.js";

export interface MorphOptions {
  /**
   * Stable identity for an element (return null for unkeyed). Keyed
   * elements match across positions; an element never matches a different
   * key positionally.
   */
  key?: (el: Element) => string | null;
  /**
   * Elements the morph must not touch — the hook for enhancer-injected
   * nodes (streaming cursors, copy buttons, post-render highlighting). A
   * matched element returning true is left exactly as-is (no attribute,
   * text, or children sync); an unmatched one is kept instead of removed,
   * with managed siblings ordered around it.
   */
  skip?: (el: Element) => boolean;
}

export function morph(
  from: Element,
  to: Element,
  options: MorphOptions = {},
): Element {
  if (options.skip?.(from)) return from;
  if (from.tagName !== to.tagName) {
    from.replaceWith(to);
    return to;
  }
  syncAttributes(from, to);
  syncFormState(from, to);
  morphChildren(from, to, options);
  return from;
}

function syncAttributes(from: Element, to: Element): void {
  // Backwards index walk is removal-safe on the live NamedNodeMap — no snapshot allocations
  // (this runs for every matched element on every morph).
  const fromAttrs = from.attributes;
  for (let i = fromAttrs.length - 1; i >= 0; i--) {
    const name = (fromAttrs[i] as Attr).name;
    if (!to.hasAttribute(name)) from.removeAttribute(name);
  }
  const toAttrs = to.attributes;
  for (let i = 0; i < toAttrs.length; i++) {
    const attr = toAttrs[i] as Attr;
    if (from.getAttribute(attr.name) !== attr.value) {
      from.setAttribute(attr.name, attr.value);
    }
  }
}

// Live form state is a property, not an attribute. Never fight the user:
// the focused element keeps whatever they are typing, and a checked-write is
// also skipped while any radio of the same group is focused — the browser's
// group exclusivity would otherwise uncheck the focused radio through a write
// to its sibling. Selects are synced per-option (the `selected` property, as
// each option is morphed) rather than via `.value`, which cannot express a
// multi-select and cannot pick options that only exist in the new tree.
function syncFormState(from: Element, to: Element): void {
  // Almost every element is none of these — one string compare bails before the
  // activeElement read and the instanceof chain.
  const name = from.nodeName;
  if (name !== "INPUT" && name !== "TEXTAREA" && name !== "OPTION") return;
  if (from.ownerDocument.activeElement === from) return;
  if (from instanceof HTMLInputElement && to instanceof HTMLInputElement) {
    if (from.value !== to.value) from.value = to.value;
    if (from.checked !== to.checked && !radioGroupFocused(from)) {
      from.checked = to.checked;
    }
  } else if (
    from instanceof HTMLTextAreaElement &&
    to instanceof HTMLTextAreaElement
  ) {
    if (from.value !== to.value) from.value = to.value;
  } else if (
    from instanceof HTMLOptionElement &&
    to instanceof HTMLOptionElement
  ) {
    const select = from.closest("select");
    if (select === null || select.ownerDocument.activeElement !== select) {
      if (from.selected !== to.selected) from.selected = to.selected;
    }
  }
}

// Is the focused element a radio in the same name group (and form) as `input`?
function radioGroupFocused(input: HTMLInputElement): boolean {
  if (input.type !== "radio" || input.name === "") return false;
  const active = input.ownerDocument.activeElement;
  return (
    active instanceof HTMLInputElement &&
    active !== input &&
    active.type === "radio" &&
    active.name === input.name &&
    active.form === input.form
  );
}

const keyOf = (node: Node, options: MorphOptions): string | null =>
  options.key && node.nodeType === 1 ? options.key(node as Element) : null;

function morphChildren(
  from: Element,
  to: Element,
  options: MorphOptions,
): void {
  // Leaf fast paths: most nodes in a real tree have no children or a single
  // text child — both skip all of the matching scaffold below. (Elements are
  // excluded from the single-child path: they need key/skip handling.)
  const fromFirst = from.firstChild;
  const toFirst = to.firstChild;
  if (fromFirst === null && toFirst === null) return;
  if (
    fromFirst !== null &&
    toFirst !== null &&
    fromFirst.nextSibling === null &&
    toFirst.nextSibling === null &&
    fromFirst.nodeType !== 1 &&
    fromFirst.nodeType === toFirst.nodeType
  ) {
    if (fromFirst.nodeValue !== toFirst.nodeValue) {
      fromFirst.nodeValue = toFirst.nodeValue;
    }
    return;
  }

  const oldNodes = Array.from(from.childNodes);

  // Every old element's key is computed exactly once here; `keyedNodes` marks
  // them so the positional cursor can skip keyed nodes without re-keying.
  const keyed = new Map<string, Element>();
  const keyedNodes = new Set<Node>();
  if (options.key) {
    for (const node of oldNodes) {
      const key = keyOf(node, options);
      if (key !== null) {
        // Same contract as list()/each()'s reconcileKeyed: a duplicate key breaks matching, so it
        // throws instead of silently reassigning identity.
        if (keyed.has(key)) throw new Error(`Duplicate morph key "${key}".`);
        keyed.set(key, node as Element);
        keyedNodes.add(node);
      }
    }
  }

  const used = new Set<Node>();
  const seenNewKeys = options.key ? new Set<string>() : null;
  const result: Node[] = [];
  let cursor = 0;

  for (let next = toFirst; next !== null; next = next.nextSibling) {
    let match: Node | undefined;

    // Each new node's key is computed exactly once per pass.
    const key = keyOf(next, options);
    if (key !== null) {
      if (seenNewKeys !== null) {
        if (seenNewKeys.has(key))
          throw new Error(`Duplicate morph key "${key}".`);
        seenNewKeys.add(key);
      }
      const hit = keyed.get(key);
      // A key match still requires the same tag: morphing across tags would hit the recursive
      // replaceWith path whose replacement can't be threaded back into this walk — adopt instead.
      if (hit && !used.has(hit) && hit.tagName === (next as Element).tagName) {
        match = hit;
      }
      // A keyed new node never matches positionally, so no cursor work here.
    } else {
      // Skip used nodes AND keyed old nodes: a keyed node never matches positionally, and one
      // absent from the new tree would otherwise block every unkeyed sibling behind it.
      while (cursor < oldNodes.length) {
        const blocked = oldNodes[cursor] as Node;
        if (!used.has(blocked) && !keyedNodes.has(blocked)) break;
        cursor++;
      }
      const candidate = oldNodes[cursor];
      if (
        candidate &&
        candidate.nodeType === next.nodeType &&
        (candidate.nodeType !== 1 ||
          (candidate as Element).tagName === (next as Element).tagName)
      ) {
        match = candidate;
        cursor++;
      }
    }

    if (match) {
      used.add(match);
      if (match.nodeType === 1) {
        morph(match as Element, next as Element, options);
      } else if (match.nodeValue !== next.nodeValue) {
        match.nodeValue = next.nodeValue;
      }
      result.push(match);
    } else {
      result.push(next);
    }
  }

  for (const old of oldNodes) {
    if (used.has(old) || old.parentNode !== from) continue;
    if (old.nodeType === 1 && options.skip?.(old as Element)) continue;
    from.removeChild(old);
  }

  // Shared LIS positioner: minimal state-preserving moves, adopted nodes inserted in place.
  positionOrdered(from, result, null);
}

// morph(from, to) — patch a live DOM subtree to match a freshly built one,
// preserving node identity wherever the shapes align. Identity is what keeps
// expensive state alive across re-renders: iframe documents, playing media,
// canvas contents, scroll positions, CSS animations.
//
// Matching is positional by node type and tag, with an optional `key` hook
// that matches elements by a stable key (e.g. a data attribute) before
// position — the same idea as list()'s keyed reconcile, applied to a whole
// subtree. Reordered keyed children move via the atomic-move path
// (placeBefore), so a matched iframe survives even a reorder.
//
// Scope: morph is for STATIC trees (server-rendered HTML, builders with no
// event handlers or reactive bindings). It syncs attributes, text, and form
// values; it does not transplant event listeners or loom effects from the
// new tree — nodes adopted from `to` keep theirs, matched nodes keep their
// original ones. Like list()/each(), a duplicate key (in either tree) throws.

import { placeBefore } from "./place.js";

export interface MorphOptions {
  /**
   * Stable identity for an element (return null for unkeyed). Keyed
   * elements match across positions; an element never matches a different
   * key positionally.
   */
  key?: (el: Element) => string | null;
}

export function morph(
  from: Element,
  to: Element,
  options: MorphOptions = {},
): Element {
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
  for (const attr of Array.from(from.attributes)) {
    if (!to.hasAttribute(attr.name)) from.removeAttribute(attr.name);
  }
  for (const attr of Array.from(to.attributes)) {
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

function compatible(old: Node, next: Node, options: MorphOptions): boolean {
  if (old.nodeType !== next.nodeType) return false;
  if (old.nodeType === 1) {
    if ((old as Element).tagName !== (next as Element).tagName) return false;
    return keyOf(old, options) === keyOf(next, options);
  }
  return true;
}

function morphChildren(
  from: Element,
  to: Element,
  options: MorphOptions,
): void {
  const oldNodes = Array.from(from.childNodes);
  const newNodes = Array.from(to.childNodes);

  const keyed = new Map<string, Element>();
  if (options.key) {
    for (const node of oldNodes) {
      const key = keyOf(node, options);
      if (key !== null) {
        // Same contract as list()/each()'s reconcileKeyed: a duplicate key breaks matching, so it
        // throws instead of silently reassigning identity.
        if (keyed.has(key)) throw new Error(`Duplicate morph key "${key}".`);
        keyed.set(key, node as Element);
      }
    }
  }

  const used = new Set<Node>();
  const seenNewKeys = options.key ? new Set<string>() : null;
  const result: Node[] = [];
  let cursor = 0;

  for (const next of newNodes) {
    let match: Node | undefined;

    const key = keyOf(next, options);
    if (key !== null && seenNewKeys !== null) {
      if (seenNewKeys.has(key))
        throw new Error(`Duplicate morph key "${key}".`);
      seenNewKeys.add(key);
    }
    if (key !== null) {
      const hit = keyed.get(key);
      // A key match still requires the same tag: morphing across tags would hit the recursive
      // replaceWith path whose replacement can't be threaded back into this walk — adopt instead.
      if (hit && !used.has(hit) && hit.tagName === (next as Element).tagName) {
        match = hit;
      }
    }
    if (!match) {
      // Skip used nodes AND keyed old nodes: a keyed node never matches positionally, and one
      // absent from the new tree would otherwise block every unkeyed sibling behind it.
      while (cursor < oldNodes.length) {
        const blocked = oldNodes[cursor] as Node;
        if (!used.has(blocked) && keyOf(blocked, options) === null) break;
        cursor++;
      }
      const candidate = oldNodes[cursor];
      if (candidate && compatible(candidate, next, options)) {
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
    if (!used.has(old) && old.parentNode === from) from.removeChild(old);
  }

  // Place right-to-left so each node's successor is already in position;
  // in-parent moves take the state-preserving path.
  let ref: Node | null = null;
  for (let index = result.length - 1; index >= 0; index--) {
    const node = result[index] as Node;
    if (node.parentNode !== from || node.nextSibling !== ref) {
      placeBefore(from, node, ref);
    }
    ref = node;
  }
}

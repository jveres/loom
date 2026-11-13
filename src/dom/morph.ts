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
   * with managed siblings ordered around it — and it is TRANSPARENT to
   * positional matching, so the siblings after it still pair up with their
   * counterparts. Unkeyed protected siblings present in both trees match by
   * ordinal (and tag), preserving declarative controls without duplicate nodes.
   * A string is shorthand for a
   * selector match: `skip: "[data-chrome]"` ≡ `el => el.matches("[data-chrome]")`.
   */
  skip?: ((el: Element) => boolean) | string;
}

const EMPTY_OPTIONS: MorphOptions = {};

function shouldSkip(el: Element, skip: MorphOptions["skip"]): boolean {
  return skip === undefined
    ? false
    : typeof skip === "string"
      ? el.matches(skip)
      : skip(el);
}

export function morph(
  from: Element,
  to: Element,
  options: MorphOptions = EMPTY_OPTIONS,
): Element {
  if (from === to || shouldSkip(from, options.skip)) return from;
  if (from.tagName !== to.tagName) {
    from.replaceWith(to);
    return to;
  }
  syncAttributes(from, to);
  syncFormState(from, to);
  if (options.key === undefined && options.skip === undefined) {
    morphPositionalChildren(from, to);
  } else {
    reconcileChildren(from, to.childNodes, options);
  }
  return from;
}

function syncMatched(live: Node, next: Node, options?: MorphOptions): void {
  if (live.nodeType === 1) morph(live as Element, next as Element, options);
  else if (live.nodeValue !== next.nodeValue) live.nodeValue = next.nodeValue;
}

function sameShape(a: Node, b: Node): boolean {
  return (
    a.nodeType === b.nodeType &&
    (a.nodeType !== 1 || (a as Element).tagName === (b as Element).tagName)
  );
}

// Zero-allocation positional walk when neither `key` nor `skip` is active.
function morphPositionalChildren(from: Element, to: Element): void {
  let cur = from.firstChild;
  for (let next = to.firstChild, after: ChildNode | null; next; next = after) {
    after = next.nextSibling;
    if (cur && sameShape(cur, next)) {
      syncMatched(cur, next);
      cur = cur.nextSibling;
    } else {
      from.insertBefore(next, cur);
    }
  }
  while (cur) {
    const after = cur.nextSibling;
    from.removeChild(cur);
    cur = after;
  }
}

function syncAttributes(from: Element, to: Element): void {
  if (!from.hasAttributes() && !to.hasAttributes()) return;
  // Backwards index walk is removal-safe on the live NamedNodeMap — no snapshot allocations.
  const fromAttrs = from.attributes;
  for (let i = fromAttrs.length - 1; i >= 0; i--) {
    const { name } = fromAttrs[i] as Attr;
    if (!to.hasAttribute(name)) from.removeAttribute(name);
  }
  const toAttrs = to.attributes;
  for (let i = 0; i < toAttrs.length; i++) {
    const { name, value } = toAttrs[i] as Attr;
    if (from.getAttribute(name) !== value) from.setAttribute(name, value);
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
  // activeElement read. REALM-BLIND by design: `instanceof HTMLInputElement`
  // binds to ONE realm's constructors, and a morph may patch a document from
  // another realm (an editor shell morphing its canvas iframe) — the nodeName
  // pair already proves the shape, so the narrowing is a cast, never a brand
  // check.
  const name = from.nodeName;
  if (
    (name !== "INPUT" && name !== "TEXTAREA" && name !== "OPTION") ||
    to.nodeName !== name ||
    from.ownerDocument.activeElement === from
  )
    return;
  if (name === "OPTION") {
    const live = from as HTMLOptionElement;
    const next = to as HTMLOptionElement;
    const select = live.closest("select");
    if (select === null || select.ownerDocument.activeElement !== select) {
      if (live.selected !== next.selected) live.selected = next.selected;
    }
    return;
  }
  const live = from as HTMLInputElement;
  const next = to as HTMLInputElement;
  if (live.value !== next.value) live.value = next.value;
  if (
    name === "INPUT" &&
    live.checked !== next.checked &&
    !radioGroupFocused(live)
  ) {
    live.checked = next.checked;
  }
}

// Is the focused element a radio in the same name group (and form) as `input`?
function radioGroupFocused(input: HTMLInputElement): boolean {
  if (input.type !== "radio" || input.name === "") return false;
  const active = input.ownerDocument.activeElement;
  if (active === null || active === input || active.nodeName !== "INPUT")
    return false;
  const other = active as HTMLInputElement;
  return (
    other.type === "radio" &&
    other.name === input.name &&
    other.form === input.form
  );
}

const keyOf = (node: Node, options: MorphOptions): string | null =>
  options.key && node.nodeType === 1 ? options.key(node as Element) : null;

/**
 * Reconcile a child snapshot without constructing a temporary parent element.
 * Detached nodes are adopted; existing children in the snapshot are retained
 * without traversing or rewriting their subtrees. Returns the live nodes that
 * correspond to the snapshot, excluding unmatched protected children.
 *
 * Do not include a node more than once. The snapshot must not contain ancestors
 * of the parent. Key and skip behavior is shared with morph().
 */
export function morphChildren(
  from: Element,
  children: readonly Node[],
  options: MorphOptions = EMPTY_OPTIONS,
): Node[] {
  let retained: Set<Node> | undefined;
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as Node;
    if (child.parentNode === from) {
      retained ??= new Set();
      if (retained.has(child))
        throw new Error("Duplicate retained morph child.");
      retained.add(child);
    }
  }
  return reconcileChildren(from, children, options, retained);
}

function dupMorphKey(key: string): never {
  throw new Error(`Duplicate morph key "${key}".`);
}

function reconcileChildren(
  from: Element,
  children: ArrayLike<Node>,
  options: MorphOptions,
  retained?: ReadonlySet<Node>,
): Node[] {
  // Leaf fast paths: most nodes in a real tree have no children or a single
  // text child — both skip all of the matching scaffold below. (Elements are
  // excluded from the single-child path: they need key/skip handling.)
  const fromFirst = from.firstChild;
  if (!fromFirst && !children.length) return [];
  if (
    fromFirst &&
    !fromFirst.nextSibling &&
    children.length === 1 &&
    fromFirst.nodeType !== 1 &&
    fromFirst.nodeType === (children[0] as Node).nodeType
  ) {
    syncMatched(fromFirst, children[0] as Node);
    return [fromFirst];
  }

  const oldNodes = Array.from(from.childNodes);
  const keyed = options.key && new Map<string, Element>();
  const reserved = new Set<Node>(retained);
  if (keyed) {
    for (const node of oldNodes) {
      const key = keyOf(node, options);
      if (key !== null) {
        if (keyed.has(key)) dupMorphKey(key);
        keyed.set(key, node as Element);
        reserved.add(node);
      }
    }
  }

  let skippedNodes: Set<Node> | null = null;
  const unkeyedSkipped: Element[] = [];
  const skip = options.skip;
  if (skip !== undefined) {
    for (const node of oldNodes) {
      if (node.nodeType === 1 && shouldSkip(node as Element, skip)) {
        skippedNodes ??= new Set();
        skippedNodes.add(node);
        if (!reserved.has(node)) unkeyedSkipped.push(node as Element);
        reserved.add(node);
      }
    }
  }

  const used = new Set<Node>();
  const seenNewKeys = keyed && new Set<string>();
  const result: Node[] = [];
  let cursor = 0;
  let skippedCursor = 0;

  for (let index = 0; index < children.length; index++) {
    const next = children[index] as Node;
    let match: Node | undefined;

    const key = keyOf(next, options);
    const skipped =
      key === null &&
      skip !== undefined &&
      next.nodeType === 1 &&
      shouldSkip(next as Element, skip);
    const skippedMatch = skipped ? unkeyedSkipped[skippedCursor++] : undefined;
    if (key !== null && keyed && seenNewKeys) {
      if (seenNewKeys.has(key)) dupMorphKey(key);
      seenNewKeys.add(key);
      const hit = keyed.get(key);
      if (hit && !used.has(hit) && hit.tagName === (next as Element).tagName) {
        match = hit;
      }
    } else if (next.parentNode === from && !used.has(next)) {
      match = next;
    } else if (skipped) {
      if (
        skippedMatch?.tagName === (next as Element).tagName &&
        !used.has(skippedMatch)
      ) {
        match = skippedMatch;
      }
    } else {
      while (cursor < oldNodes.length) {
        const blocked = oldNodes[cursor] as Node;
        if (!used.has(blocked) && !reserved.has(blocked)) break;
        cursor++;
      }
      const candidate = oldNodes[cursor];
      if (candidate && sameShape(candidate, next)) {
        match = candidate;
        cursor++;
      }
    }

    if (match) {
      used.add(match);
      if (match !== next) syncMatched(match, next, options);
    }
    result.push(match ?? next);
  }

  for (const old of oldNodes) {
    if (!used.has(old) && !skippedNodes?.has(old) && old.parentNode === from) {
      from.removeChild(old);
    }
  }

  let ordered = result;
  if (skippedNodes !== null) {
    const before = new Map<Node | null, Node[]>();
    let anchor: Node | null = null;
    for (let index = oldNodes.length - 1; index >= 0; index--) {
      const old = oldNodes[index] as Node;
      if (used.has(old)) anchor = old;
      else if (skippedNodes.has(old)) {
        const group = before.get(anchor);
        if (group) group.push(old);
        else before.set(anchor, [old]);
      }
    }
    if (before.size > 0) {
      ordered = [];
      for (const node of result) {
        const group = before.get(node);
        if (group) ordered.push(...group.reverse());
        ordered.push(node);
      }
      const trailing = before.get(null);
      if (trailing) ordered.push(...trailing.reverse());
    }
  }
  positionOrdered(from, ordered, null);
  return result;
}

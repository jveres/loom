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
export declare function morph(from: Element, to: Element, options?: MorphOptions): Element;
/**
 * Reconcile a child snapshot without constructing a temporary parent element.
 * Detached nodes are adopted; existing children in the snapshot are retained
 * without traversing or rewriting their subtrees. Returns the live nodes that
 * correspond to the snapshot, excluding unmatched protected children.
 *
 * Do not include a node more than once. The snapshot must not contain ancestors
 * of the parent. Key and skip behavior is shared with morph().
 */
export declare function morphChildren(from: Element, children: readonly Node[], options?: MorphOptions): Node[];

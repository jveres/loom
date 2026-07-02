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
export declare function morph(from: Element, to: Element, options?: MorphOptions): Element;

export interface MorphOptions {
    /**
     * Stable identity for an element (return null for unkeyed). Keyed
     * elements match across positions; an element never matches a different
     * key positionally.
     */
    key?: (el: Element) => string | null;
}
export declare function morph(from: Element, to: Element, options?: MorphOptions): Element;

declare const htmlTypeBrand: unique symbol;
export interface Html {
    /** Nominal brand: trusted HTML values can only be constructed by this module. */
    readonly [htmlTypeBrand]: true;
    readonly value: string;
    toString(): string;
}
export type HtmlChild = Html | string | number | boolean | null | undefined | readonly HtmlChild[];
export declare function unsafeHtml(value: string): Html;
export declare function html(strings: TemplateStringsArray, ...values: readonly HtmlChild[]): Html;
export declare function renderToString(value: HtmlChild): string;
export declare function isHtml(value: unknown): value is Html;
/** Read one attribute off a rendered value's ROOT opening tag — the
 *  reader twin of serializeAttributes for a static tree a parent
 *  composes without parsing it: a builder stamp on a child root. Only
 *  the root's own tag is read (it closes before any child opens); a
 *  bare attribute reads ""; a missing one, or a value with no leading
 *  element tag, reads undefined. Quoted values are unescaped. A `>`
 *  inside a quoted attribute value of the root tag is not supported. */
export declare function attributeOf(value: Html | string, name: string): string | undefined;
/** SPLICE attributes into a rendered value's ROOT opening tag — the
 *  writer twin of attributeOf, for a parent stamping a child's static
 *  tree without parsing it. Values serialize by serializeAttributes'
 *  rules (nullish drops, "" renders =""). `merge` names attributes
 *  whose existing root value is JOINED instead of doubled (style with
 *  "; ", class with " ") — the new value lands after the old, so it
 *  wins the per-property cascade. Only the root's own tag is touched;
 *  the same contract as attributeOf: a rootless value throws, a `>`
 *  inside a quoted root attribute is unsupported, and a single-quoted
 *  existing attribute is not merged (its double-quoted spelling is
 *  the serializer's own). */
export declare function withRootAttributes(value: Html, attrs: Record<string, string | number | boolean | null | undefined>, options?: {
    readonly tag?: string;
    readonly merge?: Record<string, string>;
}): Html;
export { type SerializeAttributesOptions, serializeAttributes, } from "./attributes.js";
export { escapeAttribute, escapeText } from "./escape.js";

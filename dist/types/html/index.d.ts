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
export { type SerializeAttributesOptions, serializeAttributes, } from "./attributes.js";
export { escapeAttribute, escapeText } from "./escape.js";

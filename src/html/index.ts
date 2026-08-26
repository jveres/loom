import { escapeText } from "./escape.js";

const htmlMarker = Symbol.for("loom.html");
declare const htmlTypeBrand: unique symbol;

export interface Html {
  /** Nominal brand: trusted HTML values can only be constructed by this module. */
  readonly [htmlTypeBrand]: true;
  readonly value: string;
  toString(): string;
}

export type HtmlChild =
  | Html
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly HtmlChild[];

export function unsafeHtml(value: string): Html {
  // The one construction site for an Html value. `htmlMarker` is a runtime brand isHtml() checks
  // for; it can't be typed as a property (it's a `Symbol.for`, not a `unique symbol`), so this
  // single localized `as Html` is the trust boundary — mirrors the `brand()` seam in loom/dom.
  return {
    [htmlMarker]: true,
    value,
    toString: () => value,
  } as unknown as Html;
}

export function html(
  strings: TemplateStringsArray,
  ...values: readonly HtmlChild[]
): Html {
  let out = strings[0] ?? "";
  for (let index = 0; index < values.length; index++) {
    out += renderToString(values[index]);
    out += strings[index + 1] ?? "";
  }
  return unsafeHtml(out);
}

export function renderToString(value: HtmlChild): string {
  if (Array.isArray(value)) {
    let out = "";
    for (const child of value) out += renderToString(child);
    return out;
  }
  if (value == null || value === true || value === false) return "";
  if (isHtml(value)) return value.value;
  return escapeText(String(value));
}

export function isHtml(value: unknown): value is Html {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.hasOwn(value, htmlMarker) &&
    (value as { readonly [htmlMarker]?: unknown })[htmlMarker] === true &&
    typeof (value as { readonly value?: unknown }).value === "string" &&
    typeof (value as { readonly toString?: unknown }).toString === "function"
  );
}

/** Read one attribute off a rendered value's ROOT opening tag — the
 *  reader twin of serializeAttributes for a static tree a parent
 *  composes without parsing it: a builder stamp on a child root. Only
 *  the root's own tag is read (it closes before any child opens); a
 *  bare attribute reads ""; a missing one, or a value with no leading
 *  element tag, reads undefined. Quoted values are unescaped. A `>`
 *  inside a quoted attribute value of the root tag is not supported. */
export function attributeOf(
  value: Html | string,
  name: string,
): string | undefined {
  const html = typeof value === "string" ? value : value.value;
  if (!/^\s*<[a-zA-Z]/.test(html)) return undefined;
  const end = html.indexOf(">");
  if (end === -1) return undefined;
  const tag = html.slice(0, end);
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const valued = new RegExp(
    `\\s${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    "i",
  ).exec(tag);
  if (valued)
    return unescapeAttribute(valued[1] ?? valued[2] ?? valued[3] ?? "");
  return new RegExp(`\\s${escaped}(?=\\s|$)`, "i").test(tag) ? "" : undefined;
}

const unescapeAttribute = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

export {
  type SerializeAttributesOptions,
  serializeAttributes,
} from "./attributes.js";
export { escapeAttribute, escapeText } from "./escape.js";

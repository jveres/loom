import {
  type SerializeAttributesOptions,
  serializeAttributes,
} from "./attributes.js";
import { escapeText, unescapeAttribute } from "./escape.js";

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

function htmlToString(this: { readonly value: string }): string {
  return this.value;
}

export function unsafeHtml(value: string): Html {
  return {
    [htmlMarker]: true,
    value,
    toString: htmlToString,
  } as unknown as Html;
}

export function html(
  strings: TemplateStringsArray,
  ...values: readonly HtmlChild[]
): Html {
  let out = strings[0] ?? "";
  for (let index = 0; index < values.length; index++) {
    out += renderToString(values[index]) + (strings[index + 1] ?? "");
  }
  return unsafeHtml(out);
}

export function renderToString(value: HtmlChild): string {
  if (typeof value === "string") return escapeText(value);
  if (value == null || typeof value === "boolean") return "";
  if (Array.isArray(value)) {
    let out = "";
    for (let i = 0; i < value.length; i++) out += renderToString(value[i]);
    return out;
  }
  return isHtml(value) ? value.value : escapeText(`${value}`);
}

export function isHtml(value: unknown): value is Html {
  const candidate = value as
    | (Partial<Html> & { readonly [htmlMarker]?: unknown })
    | null;
  return !!(
    candidate &&
    typeof candidate === "object" &&
    candidate[htmlMarker] === true &&
    typeof candidate.value === "string" &&
    typeof candidate.toString === "function" &&
    Object.hasOwn(candidate, htmlMarker)
  );
}

const attrPattern = (name: string, tail: string): RegExp =>
  new RegExp(`\\s${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${tail}`, "i");

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
  const tag = rootOpenTag(typeof value === "string" ? value : value.value);
  if (!tag) return undefined;
  const valued = attrPattern(
    name,
    `\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
  ).exec(tag);
  return valued
    ? unescapeAttribute(valued[1] ?? valued[2] ?? valued[3] ?? "")
    : attrPattern(name, "(?=\\s|$)").test(tag)
      ? ""
      : undefined;
}

// The root element's opening tag up to (not including) its `>`, or undefined when the markup does
// not start with an element tag.
function rootOpenTag(html: string): string | undefined {
  const end = /^\s*<[a-zA-Z]/.test(html) ? html.indexOf(">") : -1;
  return end < 0 ? undefined : html.slice(0, end);
}

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
export function withRootAttributes(
  value: Html,
  attrs: Record<string, string | number | boolean | null | undefined>,
  options: {
    readonly tag?: string;
    readonly merge?: Record<string, string>;
  } = {},
): Html {
  let openTag = rootOpenTag(value.value);
  if (!openTag) {
    throw new Error("withRootAttributes: the value has no root element tag.");
  }
  const rest = value.value.slice(openTag.length);
  const out: Record<string, unknown> = {};
  for (const [name, raw] of Object.entries(attrs)) {
    const joiner = options.merge?.[name];
    if (joiner != null && raw != null && raw !== false) {
      // Same case-insensitive name match as attributeOf; the joined value re-serializes through
      // the one attribute rule (name check, URL filter, escaping).
      const existing = attrPattern(name, '="([^"]*)"').exec(openTag);
      if (existing) {
        const joined = `${unescapeAttribute(existing[1] ?? "")}${joiner}${raw === true ? "" : raw}`;
        openTag = openTag.replace(existing[0], () =>
          serializeAttributes({ [name]: joined }),
        );
        continue;
      }
    }
    out[name] = raw;
  }
  return unsafeHtml(`${openTag}${serializeAttributes(out, options)}${rest}`);
}

export { escapeAttribute, escapeText } from "./escape.js";
export { type SerializeAttributesOptions, serializeAttributes };

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

export {
  type SerializeAttributesOptions,
  serializeAttributes,
} from "./attributes.js";
export { escapeAttribute, escapeText } from "./escape.js";

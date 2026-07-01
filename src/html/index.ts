const htmlMarker = Symbol.for("loom.html");

export interface Html {
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
  } as Html;
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
    htmlMarker in value &&
    typeof (value as { readonly value?: unknown }).value === "string"
  );
}

// The characters escapeText replaces. The map below is typed by this union, so the compiler enforces
// that every one has an entity — keep this union and the regex character class in sync (both list
// the same five characters) and a missing mapping becomes a type error rather than a silent hole.
type EntityChar = "&" | "<" | ">" | '"' | "'";
const ENTITIES: Readonly<Record<EntityChar, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeText(value: string): string {
  // The regex matches only EntityChar, so the cast is a guarded narrowing (and indexing a finite-key
  // record yields string, never undefined) — no `as string` on a possibly-missing lookup.
  return value.replace(/[&<>"']/g, (char) => ENTITIES[char as EntityChar]);
}

// Quoted-attribute escaping needs the same entities as text content (escaping
// `&"'<>` is a safe superset), so this is an intentional alias kept as distinct
// public API to document call-site intent.
export function escapeAttribute(value: string): string {
  return escapeText(value);
}

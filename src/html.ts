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

export function raw(value: string): Html {
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
  return raw(out);
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

export function escapeText(value: string): string {
  return value.replace(/[&<>"']/g, escapeChar);
}

// Quoted-attribute escaping needs the same entities as text content (escaping
// `&"'<>` is a safe superset), so this is an intentional alias kept as distinct
// public API to document call-site intent.
export function escapeAttribute(value: string): string {
  return escapeText(value);
}

function escapeChar(char: string): string {
  switch (char) {
    case "&":
      return "&amp;";
    case "<":
      return "&lt;";
    case ">":
      return "&gt;";
    case '"':
      return "&quot;";
    case "'":
      return "&#39;";
    default:
      return char;
  }
}

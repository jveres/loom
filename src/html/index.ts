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

// SSR collection of css() tokens. While renderHtml(fn) runs, the JSX class serializer routes each
// css() rule here (deduped by rule text); renderHtml returns the markup plus the collected <style>
// body. The collector is render-scoped so concurrent renders don't bleed.
let cssCollector: Set<string> | null = null;

/** Record a css() token's rule for the current renderHtml() pass (no-op outside one). */
export function collectCss(cssText: string): void {
  cssCollector?.add(cssText);
}

/**
 * Render to a static HTML string and collect the css() rules used while rendering. Returns the
 * markup and a `<style>`-ready stylesheet (wrapped in `@layer loom`, so it composes with the page's
 * own CSS). Emit them together, e.g. `\`<style>${css}</style>${html}\``.
 */
export function renderHtml(render: () => HtmlChild): {
  html: string;
  css: string;
} {
  const previous = cssCollector;
  const collector = new Set<string>();
  cssCollector = collector;
  try {
    // HTML JSX evaluates eagerly, so class serialization collects as `render()` builds the tree.
    const html = renderToString(render());
    const css = collector.size
      ? `@layer loom{${[...collector].join("")}}`
      : "";
    return { html, css };
  } finally {
    cssCollector = previous;
  }
}

// Keep this map's keys in sync with the character class in escapeText's regex.
const ENTITIES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeText(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ENTITIES[char] as string);
}

// Quoted-attribute escaping needs the same entities as text content (escaping
// `&"'<>` is a safe superset), so this is an intentional alias kept as distinct
// public API to document call-site intent.
export function escapeAttribute(value: string): string {
  return escapeText(value);
}

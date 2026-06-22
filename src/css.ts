// Scoped CSS tokens for Loom. `css` returns a CssClass — a generated class name plus the single
// (natively-nested) rule that styles it. The token is *branded* via the global symbol registry
// (Symbol.for) so the DOM and HTML renderers recognise it inside a `class` prop without importing
// this module — keeping the dependency arrow pointing inward (renderers don't depend on the styling
// addon). css() itself is pure (no DOM, SSR-safe): the DOM renderer injects the rule once on first
// render; the HTML renderer collects it for the page's <style>.
//
// Authoring: bare declarations style the class itself; `&` is the class for relative selectors
// (`&:hover`, `&[aria-pressed="true"]`, `& .child`); a nested @media scopes under it. Relies on
// native CSS nesting (Baseline 2024).
//
//   const card = css`
//     padding: 12px;
//     &:hover { border-color: var(--accent); }
//   `;
//   <article class={[card, { selected }]} />;

/** Brand for a css() token, shared by value (not by import) via the global symbol registry. */
export const CSS_CLASS: unique symbol = Symbol.for("loom.css");

export interface CssClass {
  readonly [CSS_CLASS]: true;
  /** Generated class name — also what `toString()` and template interpolation yield. */
  readonly className: string;
  /** The full rule `.className { … }`, injected by the DOM renderer / collected by the HTML one. */
  readonly cssText: string;
  toString(): string;
}

// djb2 over the rule body, base36 — short, and a different body maps to a different class while an
// identical body returns the same cached token (so a block injects/collects exactly once).
function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}

const cache = new Map<string, CssClass>(); // rule body -> token

export function css(
  strings: TemplateStringsArray,
  ...values: ReadonlyArray<string | number | CssClass>
): CssClass {
  const body = String.raw({ raw: strings }, ...values).trim();
  const cached = cache.get(body);
  if (cached !== undefined) return cached;
  const className = `loom-${hash(body)}`;
  const token: CssClass = {
    [CSS_CLASS]: true,
    className,
    cssText: `.${className}{${body}}`,
    toString: () => className,
  };
  cache.set(body, token);
  return token;
}

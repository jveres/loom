// The attribute serializer — one rule for what an attribute NAME may be,
// which VALUES render (nullish and false drop, `true` is bare, aria-*
// keeps "false"), which drop by design (`key`, `on*` handlers SSR cannot
// attach, prototype keys), and which URL schemes are refused. The JSX
// runtime renders through it; `serializeAttributes` is the same rule for
// hand-built markup (a highlighter's token spans, a static tag builder),
// so a second copy of the name pattern never drifts.
import { cssPropName } from "../jsx-props.js";
import { escapeAttribute } from "./escape.js";

const safeAttrNamePattern = /^[A-Za-z_:][A-Za-z0-9:._-]*$/;

const safeCssPropPattern =
  /^(-{2}[A-Za-z][A-Za-z0-9-]*|-?[A-Za-z][A-Za-z0-9-]*)$/;

const unsafeUrlPattern =
  /^(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i;

// Browsers strip ASCII tab/newline/CR from anywhere in a URL and trim leading C0 controls/spaces
// before resolving the scheme, so `jav\tascript:` or `\x01javascript:` parse as `javascript:`. The
// scheme filter (used below) must test against the same normalized form or those tricks smuggle a
// dangerous scheme past it, so we strip this whole range first — matching C0 controls here is
// deliberate, not the mistake the lint guards against.
// biome-ignore lint/suspicious/noControlCharactersInRegex: see above — intentional.
const urlControlChars = /[\u0000-\u0020]/g;

const urlAttrs = new Set([
  "href",
  "src",
  "action",
  "formaction",
  "cite",
  "data",
  "poster",
]);

// A silently-dropped attribute is invisible in the rendered string, so the dev runtime (jsxDEV)
// warns for the two drops that almost always mean a bug — a malformed attribute name and a
// dangerous URL scheme that got stripped. The by-design drops (nullish/false values, reserved
// keys, `on*` handlers that SSR can't attach) stay silent to avoid noise on legitimate markup.
function warnDropped(tag: string, name: string, reason: string): void {
  console.warn(`[loom/html] dropped <${tag}> attribute "${name}": ${reason}`);
}

export function renderAttribute(
  tag: string,
  name: string,
  value: unknown,
  dev: boolean,
): string {
  if (
    value == null ||
    name === "key" ||
    name === "__proto__" ||
    name === "constructor" ||
    name === "prototype"
  ) {
    return "";
  }

  let attrName = name;
  let attrValue = value;
  if (attrName === "className") attrName = "class";
  if (attrName === "htmlFor") attrName = "for";
  if (attrName.startsWith("on")) return "";

  // DOM JSX treats function-valued props as reactive reads. SSR has no reactive lifetime, but it
  // must produce the same initial markup, so evaluate each read exactly once.
  if (typeof attrValue === "function") attrValue = attrValue();
  if (attrValue == null || (attrValue === false && !isAriaAttr(attrName))) {
    return "";
  }
  if (!safeAttrNamePattern.test(attrName)) {
    if (dev) warnDropped(tag, name, "not a valid HTML attribute name");
    return "";
  }

  if (attrName === "class") attrValue = normalizeClass(attrValue);
  if (attrName === "style" && attrValue && typeof attrValue === "object") {
    attrValue = serializeStyle(attrValue as Record<string, unknown>);
  }

  if (attrValue === true) return ` ${attrName}`;

  const stringValue = String(attrValue);
  if (
    isUrlAttr(attrName) &&
    unsafeUrlPattern.test(stringValue.replace(urlControlChars, ""))
  ) {
    if (dev) warnDropped(tag, name, "unsafe URL scheme");
    return "";
  }

  return ` ${attrName}="${escapeAttribute(stringValue)}"`;
}

function normalizeClass(value: unknown): string {
  if (typeof value === "function") return normalizeClass(value());
  if (Array.isArray(value)) {
    const parts: string[] = [];
    for (const item of value) {
      if (!item) continue;
      const normalized = normalizeClass(item);
      if (normalized) parts.push(normalized);
    }
    return parts.join(" ");
  }
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) =>
        Boolean(typeof enabled === "function" ? enabled() : enabled),
      )
      .map(([name]) => name)
      .join(" ");
  }
  return String(value);
}

function serializeStyle(value: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [name, rawValue] of Object.entries(value)) {
    const resolved = typeof rawValue === "function" ? rawValue() : rawValue;
    if (resolved == null || !safeCssPropPattern.test(name)) continue;

    const cssValue = String(resolved).replace(/["<>{};]/g, "");
    // Test the scheme guard against a control-char-stripped copy, same as the URL-attribute path —
    // otherwise `jav\tascript:` slips through here too (lower risk, since CSS url() schemes don't
    // execute in modern browsers, but the evasion shape is identical).
    const scheme = cssValue.replace(urlControlChars, "");
    if (/expression\(/i.test(scheme) || /^\s*javascript:/i.test(scheme)) {
      continue;
    }

    parts.push(`${cssPropName(name)}:${cssValue}`);
  }
  return parts.join(";");
}

function isAriaAttr(name: string): boolean {
  return name.startsWith("aria-");
}

function isUrlAttr(name: string): boolean {
  return (
    urlAttrs.has(name) ||
    /:(href|src|action|formaction|cite|data|poster)$/.test(name)
  );
}

export interface SerializeAttributesOptions {
  /** Warn (console) for the two drops that almost always mean a bug —
   *  a malformed name, an unsafe URL scheme. */
  readonly dev?: boolean;
  /** The tag named in those warnings. */
  readonly tag?: string;
}

/** Serialize an attribute bag with the JSX runtime's rule: each rendered
 *  attribute joins with a LEADING space (` a="1" b`) so the result drops
 *  straight after a tag name; an all-dropped bag is "". */
export function serializeAttributes(
  attrs: Record<string, unknown>,
  options: SerializeAttributesOptions = {},
): string {
  let out = "";
  const tag = options.tag ?? "element";
  for (const name in attrs) {
    if (!Object.hasOwn(attrs, name)) continue;
    out += renderAttribute(tag, name, attrs[name], options.dev === true);
  }
  return out;
}

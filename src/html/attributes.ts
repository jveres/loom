// The attribute serializer — one rule for what an attribute NAME may be,
// which VALUES render (nullish and false drop, `true` is bare, aria-*
// keeps "false"), which drop by design (`key`, `on*` handlers SSR cannot
// attach, prototype keys), and which URL schemes are refused. The JSX
// runtime renders through it; `serializeAttributes` is the same rule for
// hand-built markup (a highlighter's token spans, a static tag builder),
// so a second copy of the name pattern never drifts.
import { cssPropName, isAriaAttr } from "../jsx-props.js";
import { escapeText } from "./escape.js";

const safeAttrNamePattern = /^[A-Za-z_:][A-Za-z0-9:._-]*$/;
const safeCssPropPattern = /^(?:--|-?)[A-Za-z][A-Za-z0-9-]*$/;
const styleStripAll = /["<>{};]/g;

const unsafeUrlPattern =
  /^(?:(?:java|vb)script:|data:(?:text\/(?:html|xml)|application\/xhtml\+xml|image\/svg))/i;

// Browsers strip ASCII tab/newline/CR from anywhere in a URL and trim leading C0 controls/spaces
// before resolving the scheme, so `jav\tascript:` or `\x01javascript:` parse as `javascript:`.
// biome-ignore lint/suspicious/noControlCharactersInRegex: intentional C0/space strip for URL scheme check.
const urlControlChars = /[\u0000-\u0020]/g;

const urlAttrPattern =
  /^(?:[^:]+:)?(?:href|src|action|formaction|cite|data|poster)$/;

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
    name === "prototype" ||
    name.startsWith("on")
  ) {
    return "";
  }

  const attrName =
    name === "className" ? "class" : name === "htmlFor" ? "for" : name;
  let attrValue = typeof value === "function" ? value() : value;
  if (attrValue == null || (attrValue === false && !isAriaAttr(attrName))) {
    return "";
  }
  if (!safeAttrNamePattern.test(attrName)) {
    if (dev) warnDropped(tag, name, "not a valid HTML attribute name");
    return "";
  }

  if (attrName === "class" && typeof attrValue !== "string") {
    attrValue = normalizeClass(attrValue);
  } else if (
    attrName === "style" &&
    attrValue &&
    typeof attrValue === "object"
  ) {
    attrValue = serializeStyle(attrValue);
  }

  if (attrValue === true) return ` ${attrName}`;

  const stringValue =
    typeof attrValue === "string" ? attrValue : `${attrValue}`;
  if (
    stringValue.includes(":") &&
    urlAttrPattern.test(attrName) &&
    unsafeUrlPattern.test(stringValue.replace(urlControlChars, ""))
  ) {
    if (dev) warnDropped(tag, name, "unsafe URL scheme");
    return "";
  }

  return ` ${attrName}="${escapeText(stringValue)}"`;
}

function normalizeClass(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "function") return normalizeClass(value());
  let out = "";
  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = item && normalizeClass(item);
      if (normalized) out = out ? `${out} ${normalized}` : normalized;
    }
    return out;
  }
  if (value && typeof value === "object") {
    for (const key in value) {
      const raw =
        Object.hasOwn(value, key) && (value as Record<string, unknown>)[key];
      if (typeof raw === "function" ? raw() : raw) {
        out = out ? `${out} ${key}` : key;
      }
    }
    return out;
  }
  return `${value}`;
}

// Mirrors the DOM runtime's style prop: arrays apply in order, a string replaces the whole inline
// style so far, and a map adds declarations.
function serializeStyle(value: unknown, out = ""): string {
  if (Array.isArray(value)) {
    for (const item of value) out = serializeStyle(item, out);
    return out;
  }
  if (!value) return out;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    for (const name in value) {
      if (!Object.hasOwn(value, name)) continue;
      let resolved = (value as Record<string, unknown>)[name];
      if (typeof resolved === "function") resolved = resolved();
      if (resolved == null || !safeCssPropPattern.test(name)) continue;
      const cssValue =
        typeof resolved === "number"
          ? `${resolved}`
          : `${resolved}`.replace(styleStripAll, "");
      if (
        (cssValue.includes("(") || cssValue.includes(":")) &&
        /expression\(|^\s*javascript:/i.test(
          cssValue.replace(urlControlChars, ""),
        )
      )
        continue;
      out = `${out ? `${out};` : ""}${cssPropName(name)}:${cssValue}`;
    }
  }
  return out;
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
  options?: SerializeAttributesOptions,
): string {
  let out = "";
  const tag = options?.tag ?? "element";
  const dev = options?.dev === true;
  for (const name in attrs) {
    if (!Object.hasOwn(attrs, name)) continue;
    out += renderAttribute(tag, name, attrs[name], dev);
  }
  return out;
}

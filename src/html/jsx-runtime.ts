import { propsWithoutKey } from "../jsx-props.js";
import {
  escapeAttribute,
  type Html,
  type HtmlChild,
  renderToString,
  unsafeHtml,
} from "./index.js";

export type { JSX } from "./jsx-types.js";

type Component<P extends object> = (props: P) => HtmlChild;
type JsxProps =
  | (Record<string, unknown> & { readonly children?: HtmlChild })
  | null
  | undefined;
type JsxType = string | Component<object>;

const safeTagNamePattern = /^[A-Za-z][A-Za-z0-9:._-]*$/;
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

const voidElements = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export function jsx(type: string, props: JsxProps, key?: string | number): Html;
export function jsx<P extends object>(
  type: Component<P>,
  props: P | null,
  key?: string | number,
): Html;
export function jsx(
  type: JsxType,
  props: JsxProps,
  _key?: string | number,
): Html {
  return createJsx(type, props, false);
}

export const jsxs: typeof jsx = jsx;

export function Fragment(
  props: { readonly children?: HtmlChild } | null,
): Html {
  return unsafeHtml(renderToString(props?.children));
}

export function jsxDEV(
  type: JsxType,
  props: JsxProps,
  _key?: string | number,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): Html {
  return createJsx(type, props, true);
}

function createJsx(type: JsxType, props: JsxProps, dev: boolean): Html {
  if (typeof type === "function") {
    return unsafeHtml(renderToString(type(propsWithoutKey(props))));
  }

  return renderElement(type, props, dev);
}

function renderElement(type: string, props: JsxProps, dev: boolean): Html {
  if (!safeTagNamePattern.test(type)) {
    throw new Error(`Invalid HTML tag name "${type}".`);
  }

  let out = `<${type}`;
  let children: HtmlChild;
  if (props) {
    for (const name in props) {
      if (!Object.hasOwn(props, name)) continue;
      if (name === "children") {
        children = props[name] as HtmlChild;
        continue;
      }
      out += renderAttribute(type, name, props[name], dev);
    }
  }
  out += ">";

  if (!voidElements.has(type)) {
    out += renderToString(children);
    out += `</${type}>`;
  }

  return unsafeHtml(out);
}

// A silently-dropped attribute is invisible in the rendered string, so the dev runtime (jsxDEV)
// warns for the two drops that almost always mean a bug — a malformed attribute name and a
// dangerous URL scheme that got stripped. The by-design drops (nullish/false values, reserved
// keys, `on*` handlers that SSR can't attach) stay silent to avoid noise on legitimate markup.
function warnDropped(tag: string, name: string, reason: string): void {
  console.warn(`[loom/html] dropped <${tag}> attribute "${name}": ${reason}`);
}

function renderAttribute(
  tag: string,
  name: string,
  value: unknown,
  dev: boolean,
): string {
  if (
    value == null ||
    value === false ||
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
      .filter(([, enabled]) => Boolean(enabled))
      .map(([name]) => name)
      .join(" ");
  }
  return String(value);
}

function serializeStyle(value: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [name, rawValue] of Object.entries(value)) {
    if (rawValue == null || !safeCssPropPattern.test(name)) continue;

    const cssValue = String(rawValue).replace(/["<>{};]/g, "");
    // Test the scheme guard against a control-char-stripped copy, same as the URL-attribute path —
    // otherwise `jav\tascript:` slips through here too (lower risk, since CSS url() schemes don't
    // execute in modern browsers, but the evasion shape is identical).
    const scheme = cssValue.replace(urlControlChars, "");
    if (/expression\(/i.test(scheme) || /^\s*javascript:/i.test(scheme)) {
      continue;
    }

    parts.push(`${cssName(name)}:${cssValue}`);
  }
  return parts.join(";");
}

function cssName(name: string): string {
  if (name.startsWith("--")) return name;
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function isUrlAttr(name: string): boolean {
  return (
    urlAttrs.has(name) ||
    /:(href|src|action|formaction|cite|data|poster)$/.test(name)
  );
}

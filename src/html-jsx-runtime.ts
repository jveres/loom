import {
  escapeAttribute,
  type Html,
  type HtmlChild,
  raw,
  renderToString,
} from "./html.js";

export type { JSX } from "./html-jsx-types.js";

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
  /^(?:\s*)(?:javascript:|vbscript:|data:text\/html|data:text\/xml|data:application\/xhtml\+xml|data:image\/svg)/i;

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
  return createJsx(type, props);
}

export const jsxs: typeof jsx = jsx;

export function Fragment(
  props: { readonly children?: HtmlChild } | null,
): Html {
  return raw(renderToString(props?.children));
}

export function jsxDEV(
  type: JsxType,
  props: JsxProps,
  _key?: string | number,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): Html {
  return createJsx(type, props);
}

function createJsx(type: JsxType, props: JsxProps): Html {
  if (typeof type === "function") {
    return raw(renderToString(type(propsWithoutKey(props) as object)));
  }

  return renderElement(type, props);
}

function renderElement(type: string, props: JsxProps): Html {
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
      out += renderAttribute(name, props[name]);
    }
  }
  out += ">";

  if (!voidElements.has(type)) {
    out += renderToString(children);
    out += `</${type}>`;
  }

  return raw(out);
}

function renderAttribute(name: string, value: unknown): string {
  if (
    value == null ||
    value === false ||
    name === "children" ||
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
  if (!safeAttrNamePattern.test(attrName)) return "";

  if (attrName === "class") attrValue = normalizeClass(attrValue);
  if (attrName === "style" && attrValue && typeof attrValue === "object") {
    attrValue = serializeStyle(attrValue as Record<string, unknown>);
  }

  if (attrValue === true) return ` ${attrName}`;

  const stringValue = String(attrValue);
  if (isUrlAttr(attrName) && unsafeUrlPattern.test(stringValue)) return "";

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
    if (/expression\(/i.test(cssValue) || /^\s*javascript:/i.test(cssValue)) {
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

function propsWithoutKey(props: JsxProps): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  if (props) {
    for (const name in props) {
      if (!Object.hasOwn(props, name) || name === "key") continue;
      next[name] = props[name];
    }
  }
  return next;
}

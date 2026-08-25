import { propsWithoutKey } from "../jsx-props.js";
import { renderAttribute } from "./attributes.js";
import {
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

// Children VERBATIM, exactly like the DOM runtime's Fragment: a
// fragment is a grouping, not an element, and both runtimes must agree
// at runtime. Eagerly serializing to one branded Html made a fragment
// ROOT indistinguishable from a single element — a consumer enforcing
// a one-root contract (block stamping) then silently mis-stamped
// static output while the DOM runtime threw (parity break).
export function Fragment(
  props: { readonly children?: HtmlChild } | null,
): HtmlChild {
  return props?.children ?? [];
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

import { propsWithoutKey } from "../jsx-props.js";
import { type Child, h, type Props } from "./index.js";

export type { JSX } from "./jsx-types.js";

type Component<P extends object> = (props: P) => Child;
type JsxProps = (Props & { readonly children?: Child }) | null | undefined;
type JsxType = string | Component<object>;

export function jsx<K extends keyof HTMLElementTagNameMap>(
  type: K,
  props: JsxProps,
  key?: string | number,
): HTMLElementTagNameMap[K];
export function jsx<K extends keyof SVGElementTagNameMap>(
  type: K,
  props: JsxProps,
  key?: string | number,
): SVGElementTagNameMap[K];
export function jsx<P extends object>(
  type: Component<P>,
  props: P | null,
  key?: string | number,
): Child;
export function jsx(
  type: JsxType,
  props: JsxProps,
  _key?: string | number,
): Child {
  return createJsx(type, props);
}

export const jsxs: typeof jsx = jsx;

export function Fragment(props: { readonly children?: Child } | null): Child {
  return props?.children ?? [];
}

export function jsxDEV(
  type: JsxType,
  props: JsxProps,
  _key?: string | number,
  _isStaticChildren?: boolean,
  _source?: unknown,
  _self?: unknown,
): Child {
  return createJsx(type, props);
}

function createJsx(type: JsxType, props: JsxProps): Child {
  if (typeof type === "function") {
    return type(propsWithoutKey(props));
  }

  return createIntrinsicElement(type, props);
}

function createIntrinsicElement(type: string, props: JsxProps): Element {
  if (!props) return h(type);

  // Common case: applyProps skips `children` itself, so the props object passes through untouched.
  // Only `htmlFor` (renamed to `for`) and a spread-in `key` (stripped) force a copy.
  if (!("htmlFor" in props) && !("key" in props)) {
    return h(type, props, props.children);
  }

  const elementProps: Props & { for?: unknown } = {};
  for (const name in props) {
    if (!Object.hasOwn(props, name) || name === "children" || name === "key") {
      continue;
    }
    if (name === "htmlFor") elementProps.for = props[name];
    else elementProps[name] = props[name];
  }

  return h(type, elementProps, props.children);
}

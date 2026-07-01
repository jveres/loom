import { type Child, type Props } from "./index.js";
export type { JSX } from "./jsx-types.js";
type Component<P extends object> = (props: P) => Child;
type JsxProps = (Props & {
    readonly children?: Child;
}) | null | undefined;
type JsxType = string | Component<object>;
export declare function jsx<K extends keyof HTMLElementTagNameMap>(type: K, props: JsxProps, key?: string | number): HTMLElementTagNameMap[K];
export declare function jsx<K extends keyof SVGElementTagNameMap>(type: K, props: JsxProps, key?: string | number): SVGElementTagNameMap[K];
export declare function jsx<P extends object>(type: Component<P>, props: P | null, key?: string | number): Child;
export declare const jsxs: typeof jsx;
export declare function Fragment(props: {
    readonly children?: Child;
} | null): Child;
export declare function jsxDEV(type: JsxType, props: JsxProps, _key?: string | number, _isStaticChildren?: boolean, _source?: unknown, _self?: unknown): Child;

import { type Html, type HtmlChild } from "./index.js";
export type { JSX } from "./jsx-types.js";
type Component<P extends object> = (props: P) => HtmlChild;
type JsxProps = (Record<string, unknown> & {
    readonly children?: HtmlChild;
}) | null | undefined;
type JsxType = string | Component<object>;
export declare function jsx(type: string, props: JsxProps, key?: string | number): Html;
export declare function jsx<P extends object>(type: Component<P>, props: P | null, key?: string | number): Html;
export declare const jsxs: typeof jsx;
export declare function Fragment(props: {
    readonly children?: HtmlChild;
} | null): HtmlChild;
export declare function jsxDEV(type: JsxType, props: JsxProps, _key?: string | number, _isStaticChildren?: boolean, _source?: unknown, _self?: unknown): Html;

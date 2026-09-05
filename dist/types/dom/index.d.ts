import { type CleanupEffectFn, type EffectFn, type EffectOptions, type Read, type State, type Stop } from "../loom.js";
import { type EachOptions, type ListOptions } from "./keyed-reconcile.js";
export type { EachOptions, ListOptions, ListUpdate, } from "./keyed-reconcile.js";
export type Child = Node | Read<unknown> | DynamicChild | string | number | boolean | null | undefined | readonly Child[];
declare const BINDING: unique symbol;
export type DynamicChild = {
    readonly [BINDING]: "dynamic";
};
type ClassProp = string | ClassMap | null | undefined | readonly ClassProp[];
type ClassMap = Record<string, unknown>;
type StyleMap = Record<string, unknown>;
type StyleProp = string | StyleMap | null | undefined | readonly StyleProp[];
type StyledElement = Element & ElementCSSInlineStyle;
export type ElementProps = Record<string, unknown> & {
    class?: ClassProp;
    className?: ClassProp;
    key?: string | number;
    style?: StyleProp;
    ontap?: never;
    onTap?: never;
    onDoublePress?: never;
    ondoublepress?: never;
};
declare const SVG_TAG_LIST: readonly ["svg", "g", "defs", "symbol", "use", "switch", "foreignObject", "image", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "textPath", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "pattern", "marker", "filter", "feGaussianBlur", "feOffset", "feBlend", "feColorMatrix", "feComposite", "feFlood", "feMerge", "feMergeNode", "feMorphology", "feDropShadow", "feImage", "feTile", "feTurbulence", "feDisplacementMap"];
export type SvgTagName = (typeof SVG_TAG_LIST)[number];
/**
 * Parse a static, single-root HTML fragment once and return a cheap deep-clone
 * factory. A standard HTML tag gives the clone its precise element type;
 * custom-element and other tag names safely fall back to Element. Dynamic
 * values deliberately are not accepted: clone the skeleton, then bind or
 * assign its dynamic fields. This keeps repeated views on the browser's
 * optimized native clone path and makes the trust boundary explicit.
 */
export declare function template<K extends keyof HTMLElementTagNameMap>(rootTag: K): (strings: TemplateStringsArray, ...values: readonly unknown[]) => () => HTMLElementTagNameMap[K];
export declare function template(rootTag: string): (strings: TemplateStringsArray, ...values: readonly unknown[]) => () => Element;
export declare function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: ElementProps | null, children?: Child): HTMLElementTagNameMap[K];
export declare function h<K extends keyof SVGElementTagNameMap>(tag: K, props?: ElementProps | null, children?: Child): SVGElementTagNameMap[K];
export declare function h(tag: string, props?: ElementProps | null, children?: Child): Element;
/** Replace a node's children while preserving Loom ownership. Incoming
 *  descendants are moved aside first. After native replacement succeeds,
 *  every outgoing subtree is disposed; disposal failures are rethrown only
 *  after all outgoing resources have been given a chance to stop. A staging
 *  or native failure restores supplied nodes and disposes newly staged
 *  reactive children before it is rethrown. */
export declare function replaceChildren(parent: Node & ParentNode, ...children: readonly Child[]): void;
/**
 * Create an explicitly SVG-namespaced element. Use this for names shared with HTML (`a`, `title`,
 * `script`, and `style`), whose namespace cannot be inferred from an already-evaluated JSX child.
 */
export declare function svgElement<K extends keyof SVGElementTagNameMap>(tag: K, props?: ElementProps | null, children?: Child): SVGElementTagNameMap[K];
export declare function svgElement(tag: string, props?: ElementProps | null, children?: Child): SVGElement;
export declare function text(read: Read<unknown>, options?: EffectOptions): Text;
/** Options for a node-owned reactive binding. */
export interface BindingOptions extends EffectOptions {
    readonly signal?: AbortSignal;
}
/** Bind an attribute to a tracked read; nullish/false removes it. */
export declare function bindAttr(el: Element, name: string, read: Read<unknown>, options?: BindingOptions): Stop;
/** Bind one class token to the truthiness of a tracked read. */
export declare function bindClass(el: Element, name: string, read: Read<unknown>, options?: BindingOptions): Stop;
/** Bind an inline style property to a tracked read. */
export declare function bindStyle(el: StyledElement, name: string, read: Read<unknown>, options?: BindingOptions): Stop;
export declare function list<T>(container: Element, read: State<readonly T[]> | Read<readonly T[]>, options: ListOptions<NoInfer<T>>): Stop;
/**
 * Conditional subtree, keyed on the truthiness of `cond`. Renders `render()` while truthy and the
 * optional `fallback()` while falsy, rebuilding **only when the truthiness flips** — so a `cond` whose
 * value changes while staying truthy does not tear down and recreate the subtree (read live state with
 * your own bindings inside `render` for that). The returned value is a child: place it in JSX or
 * `h()`, e.g. `{when(open, () => <Panel />)}`. Removing the subtree disposes its effects.
 */
export declare function when(cond: Read<unknown>, render: () => Child, fallback?: () => Child): Child;
/**
 * Multi-way subtree, keyed on `selector()`. Builds `cases[String(selector())]` (or `fallback` when no
 * case matches), rebuilding **only when the selected key changes**. The switch/case companion to
 * {@link when}: `{match(tab, { info: () => <Info />, graph: () => <Graph /> })}`. Place the result as a
 * child of a Loom element.
 */
export declare function match(selector: Read<string | number>, cases: Readonly<Record<string, () => Child>>, fallback?: () => Child): Child;
/**
 * Inline keyed list. Reconciles `items()` against an anchor — the `list()` companion for when you want
 * a keyed list as a child expression rather than against a container: `{each(rows, r => <Row />, r =>
 * r.id)}`. `render(item, key)` must return a single Element (its owned effects are disposed when the
 * item leaves); `key(item)` identifies it across updates so existing rows are moved, not rebuilt. Like
 * `list()`, it reorders by key and throws on a duplicate key. Place the result as a child of a Loom
 * element.
 */
export declare function each<T>(items: State<readonly T[]> | Read<readonly T[]>, render: (item: NoInfer<T>, key: string) => Element, key: (item: NoInfer<T>) => string | number, options?: EachOptions<NoInfer<T>>): Child;
/** Install a tracked DOM effect with node ownership and explicit early teardown. */
export declare function bind(node: Node, fn: CleanupEffectFn, options?: BindingOptions): Stop;
export declare function bind(node: Node, fn: EffectFn, options?: BindingOptions): Stop;
export { type BindValueOptions, bindValue } from "./bind-value.js";
export { keyedChild } from "./keyed-child.js";
export { type MorphOptions, morph, morphChildren } from "./morph.js";
export { type OnMountOptions, onMount } from "./on-mount.js";
export { dispose, onUnmount, pause, type ResourceGroup, remove, resourceGroup, resume, } from "./ownership.js";

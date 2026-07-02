import { type EffectOptions, type Read, type State, type Stop } from "../loom.js";
export type Child = Node | Read<unknown> | DynamicChild | string | number | boolean | null | undefined | readonly Child[];
declare const BINDING: unique symbol;
export type AttrBinding = {
    readonly [BINDING]: "attr";
};
export type ClassBinding = {
    readonly [BINDING]: "class";
};
export type StyleBinding = {
    readonly [BINDING]: "style";
};
export type DynamicChild = {
    readonly [BINDING]: "dynamic";
};
type ClassProp = string | ClassBinding | ClassMap | null | undefined | readonly ClassProp[];
type ClassMap = Record<string, unknown>;
type StyleMap = Record<string, unknown>;
type StyleProp = string | StyleMap | StyleBinding | null | undefined | readonly StyleProp[];
export type Props = Record<string, unknown> & {
    class?: ClassProp;
    className?: ClassProp;
    key?: string | number;
    style?: StyleProp;
};
export interface ListOptions<T> {
    readonly key: (item: T) => string | number;
    readonly render: (item: T, key: string) => Element;
    readonly reorder?: Read<boolean>;
}
export declare function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props | null, children?: Child): HTMLElementTagNameMap[K];
export declare function h<K extends keyof SVGElementTagNameMap>(tag: K, props?: Props | null, children?: Child): SVGElementTagNameMap[K];
export declare function h(tag: string, props?: Props | null, children?: Child): Element;
export declare function text(read: Read<unknown>, options?: EffectOptions): Text;
export declare function attr(name: string, read: Read<unknown>): AttrBinding;
export declare function classed(name: string, read: Read<unknown>): ClassBinding;
export declare function style(name: string, read: Read<unknown>): StyleBinding;
export declare function list<T>(container: Element, read: Read<readonly T[]>, options: ListOptions<T>): Stop;
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
export declare function each<T>(items: State<readonly T[]> | Read<readonly T[]>, render: (item: NoInfer<T>, key: string) => Element, key: (item: NoInfer<T>) => string | number): Child;
export declare function dispose(root: Node): void;
export declare function remove(node: Node): void;
/**
 * Bind a robust tap handler. Unlike `click`, this is not dropped by iOS Safari when the DOM mutates
 * mid-gesture, because it is built from raw pointer events rather than a hit-test-synthesized click.
 * `handler` fires on pointerup when the release is the same pointer as the press and within
 * {@link TAP_SLOP} px of it (so a drag or scroll does not trigger it). Use the `ontap` JSX prop,
 * which routes here; this export is for imperative call sites (e.g. the inspector).
 */
export declare function tap(node: Element, handler: (event: PointerEvent) => void): void;
/**
 * Bind a reactive attribute on an existing element: `read()` re-runs as its dependencies change,
 * and the attribute updates only when the resulting value actually differs (nullish/false removes
 * it, true sets it empty — same coercion as a JSX attribute). The imperative sibling of `attr()`
 * for call sites that hold the element directly; `options` relabels the binding or marks it
 * `internal` (tooling built on loom — e.g. the inspector — binds without self-reporting).
 */
export declare function bindAttr(node: Element, name: string, read: Read<unknown>, options?: EffectOptions): void;
export { type MorphOptions, morph } from "./morph.js";

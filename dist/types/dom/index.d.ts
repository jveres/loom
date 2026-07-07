import { type CleanupEffectFn, type EffectFn, type EffectOptions, type Read, type State, type Stop } from "../loom.js";
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
export type ElementProps = Record<string, unknown> & {
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
declare const SVG_TAG_LIST: readonly ["svg", "g", "defs", "symbol", "use", "switch", "foreignObject", "image", "path", "rect", "circle", "ellipse", "line", "polyline", "polygon", "text", "tspan", "textPath", "linearGradient", "radialGradient", "stop", "clipPath", "mask", "pattern", "marker", "filter", "feGaussianBlur", "feOffset", "feBlend", "feColorMatrix", "feComposite", "feFlood", "feMerge", "feMergeNode", "feMorphology", "feDropShadow", "feImage", "feTile", "feTurbulence", "feDisplacementMap"];
export type SvgTagName = (typeof SVG_TAG_LIST)[number];
export declare function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: ElementProps | null, children?: Child): HTMLElementTagNameMap[K];
export declare function h<K extends keyof SVGElementTagNameMap>(tag: K, props?: ElementProps | null, children?: Child): SVGElementTagNameMap[K];
export declare function h(tag: string, props?: ElementProps | null, children?: Child): Element;
export declare function text(read: Read<unknown>, options?: EffectOptions): Text;
/**
 * The attribute as a signal — direction by first argument and arity:
 * `attr(name, read)` returns a JSX descriptor; `attr(el, name)` returns a reactive
 * `Read<string | null>` of the attribute's current value; `attr(el, name, read, options?)` binds
 * `read()` to the attribute, node-owned. Writes coerce like JSX attributes (nullish/false removes,
 * true sets empty). `options` relabels the binding or marks it `internal`.
 */
export declare function attr(name: string, read: Read<unknown>): AttrBinding;
export declare function attr(el: Element, name: string): Read<string | null>;
export declare function attr(el: Element, name: string, read: Read<unknown>, options?: EffectOptions): void;
/**
 * A class as a boolean signal — direction by first argument and arity:
 * `classed(name, read)` returns a JSX descriptor; `classed(el, name)` returns a reactive
 * `Read<boolean>` of the class's presence; `classed(el, name, read, options?)` toggles the class
 * from `read()`, node-owned.
 */
export declare function classed(name: string, read: Read<unknown>): ClassBinding;
export declare function classed(el: Element, name: string): Read<boolean>;
export declare function classed(el: Element, name: string, read: Read<unknown>, options?: EffectOptions): void;
/**
 * An inline style property as a signal — direction by first argument and arity:
 * `style(name, read)` returns a JSX descriptor; `style(el, prop)` returns a reactive
 * `Read<string>` of the inline value (empty string when unset); `style(el, prop, read, options?)`
 * binds `read()` to the property, node-owned. Property names accept camelCase or kebab-case.
 */
export declare function style(name: string, read: Read<unknown>): StyleBinding;
export declare function style(el: Element, prop: string): Read<string>;
export declare function style(el: Element, prop: string, read: Read<unknown>, options?: EffectOptions): void;
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
/**
 * Suspend every node-owned reactive binding in a subtree: bindings stay subscribed but do not run
 * while paused; resume() delivers one catch-up run to anything that changed. Pause nests. Only
 * effect-backed disposers suspend (a manual onUnmount(fn) teardown has nothing to pause).
 */
export declare function pause(root: Node): void;
export declare function resume(root: Node): void;
export declare function dispose(root: Node): void;
export declare function remove(node: Node): void;
/**
 * Bind a robust tap handler. Unlike `click`, this is not dropped by iOS Safari when the DOM mutates
 * mid-gesture, because it is built from raw pointer events rather than a hit-test-synthesized click.
 * `handler` fires on pointerup when the release is the same pointer as the press and within
 * {@link TAP_SLOP} px of it (so a drag or scroll does not trigger it). Use the `ontap` JSX prop,
 * which routes here; this export is for imperative call sites (e.g. the inspector).
 */
export declare function onTap(node: Element, handler: (event: PointerEvent) => void): void;
/**
 * Attach a disposer to a node's Loom lifecycle: it runs when the node is torn down the Loom way —
 * `remove()`, `dispose()`, or an ancestor slot/list swapping it out. The `onunmount` JSX prop is
 * this function as a prop — one concept, two syntaxes — for kit components that create their own
 * effects/listeners for an element they build. (This is ownership; `effect`'s `target` option is
 * inspector attribution only.)
 */
export declare function onUnmount(node: Node, stop: Stop): void;
/**
 * Reactive DOM state that dies with this node: an `effect(fn)` that is target-attributed to the
 * node (inspector hover/highlight) and disposed with it (`remove()`, `dispose()`, a keyed row
 * leaving). The one-call form of `onUnmount(el, effect(fn, { target: el }))` — the dominant idiom
 * of kit code. Returns the stop for rare early manual disposal; options merge over the target
 * default, so `{ target: other }` can re-attribute.
 */
export declare function bind(node: Node, fn: CleanupEffectFn, options?: EffectOptions): Stop;
export declare function bind(node: Node, fn: EffectFn, options?: EffectOptions): Stop;
export { connected } from "./connected.js";
export { type MorphOptions, morph } from "./morph.js";
export { type IntersectionCallback, type IntersectionOptions, observeIntersection, } from "./observe-intersection.js";
export { type MutationsCallback, observeMutation, } from "./observe-mutation.js";
export { observeSize, type SizeCallback } from "./observe-size.js";
export { onMount } from "./on-mount.js";
export { type PersistedOptions, persisted } from "./persisted.js";

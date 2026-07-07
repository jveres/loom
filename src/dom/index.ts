import { cssPropName } from "../jsx-props.js";
import {
  type CleanupEffectFn,
  type EffectFn,
  type EffectOptions,
  effect,
  type Read,
  type State,
  type Stop,
  untrack,
} from "../loom.js";
import { attrRead, classRead, styleRead } from "./attr-of.js";
import { onMount } from "./onmount.js";
import { positionOrdered } from "./place.js";

export type Child =
  | Node
  | Read<unknown>
  | DynamicChild
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly Child[];

// Opaque handles returned by the binding/slot factories (`attr`/`classed`/`style` and
// `when`/`match`/`each`). Their runtime shape is an internal detail — callers only receive one to
// hand straight back into JSX or `h()` — so the public types are branded with a private symbol and
// expose no structure. Build them with the factories; never hand-construct. `DynamicChild` is also a
// member of {@link Child}.
declare const BINDING: unique symbol;
export type AttrBinding = { readonly [BINDING]: "attr" };
export type ClassBinding = { readonly [BINDING]: "class" };
export type StyleBinding = { readonly [BINDING]: "style" };
export type DynamicChild = { readonly [BINDING]: "dynamic" };

// The real shapes behind those handles, private to this module.
interface PropBinding {
  readonly kind: "attr" | "class" | "style";
  readonly name: string;
  readonly read: Read<unknown>;
}
interface SlotDescriptor {
  readonly __loomDynamic: true;
  readonly mount: (anchor: Comment) => Stop;
}

// The one trust boundary between a descriptor's real shape and its opaque public handle. Phantom
// brands have no runtime form, so this reinterpret can't be checked — it's a single `as` from `object`
// (not a double cast), kept here so no other call site reaches across the seam.
const brand = <T extends object>(descriptor: object): T => descriptor as T;

type ClassProp =
  | string
  | ClassBinding
  | ClassMap
  | null
  | undefined
  | readonly ClassProp[];
type ClassMap = Record<string, unknown>;
type StyleMap = Record<string, unknown>;
type StyleProp =
  | string
  | StyleMap
  | StyleBinding
  | null
  | undefined
  | readonly StyleProp[];

// An element with an inline `style` — both HTMLElement and SVGElement satisfy this, so style
// bindings state it rather than a false HTMLElement claim (a truly style-less Element would throw).
type StyledElement = Element & ElementCSSInlineStyle;

// Deliberately open: the typed props below (class/style/key) are for editor help and reactive-value
// handling, but the `Record<string, unknown>` index accepts any attribute name/value. Loom is a thin
// layer over setAttribute, so applyProps validates and applies at runtime rather than the type
// enforcing an exhaustive per-element attribute model; a typo'd attribute is set as-is, not rejected.
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

type OwnedEffect = Stop | Stop[];

const ownedEffects = new WeakMap<Node, OwnedEffect>();

const SVG_NS = "http://www.w3.org/2000/svg";
// SVG-only tag names — elements that must be created in the SVG namespace. Tags shared with
// HTML (a, title, script, style) are intentionally omitted so they keep rendering as HTML;
// the descendants of an <svg> are created namespaced because each SVG tag is listed here.
// Single source of truth: the JSX IntrinsicElements SVG keys derive from this list (SvgTagName),
// so the types can never offer an SVG tag the runtime would create in the wrong namespace.
const SVG_TAG_LIST = [
  "svg",
  "g",
  "defs",
  "symbol",
  "use",
  "switch",
  "foreignObject",
  "image",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textPath",
  "linearGradient",
  "radialGradient",
  "stop",
  "clipPath",
  "mask",
  "pattern",
  "marker",
  "filter",
  "feGaussianBlur",
  "feOffset",
  "feBlend",
  "feColorMatrix",
  "feComposite",
  "feFlood",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feDropShadow",
  "feImage",
  "feTile",
  "feTurbulence",
  "feDisplacementMap",
] as const;
const SVG_TAGS = new Set<string>(SVG_TAG_LIST);
export type SvgTagName = (typeof SVG_TAG_LIST)[number];

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Props | null,
  children?: Child,
): HTMLElementTagNameMap[K];
export function h<K extends keyof SVGElementTagNameMap>(
  tag: K,
  props?: Props | null,
  children?: Child,
): SVGElementTagNameMap[K];
export function h(tag: string, props?: Props | null, children?: Child): Element;
export function h(
  tag: string,
  props: Props | null = null,
  children?: Child,
): Element {
  const node = SVG_TAGS.has(tag)
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);
  if (props) applyProps(node, props);
  appendChild(node, children);
  return node;
}

// `options` lets a caller relabel the binding or, for tooling built on loom, mark it `internal` so
// it isn't observed by the inspector (which uses this to bind its own text without self-reporting).
export function text(read: Read<unknown>, options?: EffectOptions): Text {
  const node = document.createTextNode("");
  bindReactiveValue(
    node,
    "dom.text",
    () => stringValue(read()),
    (next) => {
      node.data = next;
    },
    "",
    options,
  );
  return node;
}

/**
 * The attribute as a cell — direction by first argument and arity:
 * `attr(name, read)` returns a JSX descriptor; `attr(el, name)` returns a reactive
 * `Read<string | null>` of the attribute's current value; `attr(el, name, read, options?)` binds
 * `read()` to the attribute, node-owned. Writes coerce like JSX attributes (nullish/false removes,
 * true sets empty). `options` relabels the binding or marks it `internal`.
 */
export function attr(name: string, read: Read<unknown>): AttrBinding;
export function attr(el: Element, name: string): Read<string | null>;
export function attr(
  el: Element,
  name: string,
  read: Read<unknown>,
  options?: EffectOptions,
): void;
export function attr(
  a: string | Element,
  b: Read<unknown> | string,
  read?: Read<unknown>,
  options?: EffectOptions,
): AttrBinding | Read<string | null> | undefined {
  if (typeof a === "string") {
    return brand<AttrBinding>({
      kind: "attr",
      name: a,
      read: b as Read<unknown>,
    } satisfies PropBinding);
  }
  const name = b as string;
  if (read === undefined) return attrRead(a, name);
  bindAttrValue(a, name, read, options);
  return undefined;
}

/**
 * A class as a boolean cell — direction by first argument and arity:
 * `classed(name, read)` returns a JSX descriptor; `classed(el, name)` returns a reactive
 * `Read<boolean>` of the class's presence; `classed(el, name, read, options?)` toggles the class
 * from `read()`, node-owned.
 */
export function classed(name: string, read: Read<unknown>): ClassBinding;
export function classed(el: Element, name: string): Read<boolean>;
export function classed(
  el: Element,
  name: string,
  read: Read<unknown>,
  options?: EffectOptions,
): void;
export function classed(
  a: string | Element,
  b: Read<unknown> | string,
  read?: Read<unknown>,
  options?: EffectOptions,
): ClassBinding | Read<boolean> | undefined {
  if (typeof a === "string") {
    return brand<ClassBinding>({
      kind: "class",
      name: a,
      read: b as Read<unknown>,
    } satisfies PropBinding);
  }
  const name = b as string;
  if (read === undefined) return classRead(a, name);
  bindClass(a, { kind: "class", name, read }, options);
  return undefined;
}

/**
 * An inline style property as a cell — direction by first argument and arity:
 * `style(name, read)` returns a JSX descriptor; `style(el, prop)` returns a reactive
 * `Read<string>` of the inline value (empty string when unset); `style(el, prop, read, options?)`
 * binds `read()` to the property, node-owned. Property names accept camelCase or kebab-case.
 */
export function style(name: string, read: Read<unknown>): StyleBinding;
export function style(el: Element, prop: string): Read<string>;
export function style(
  el: Element,
  prop: string,
  read: Read<unknown>,
  options?: EffectOptions,
): void;
export function style(
  a: string | Element,
  b: Read<unknown> | string,
  read?: Read<unknown>,
  options?: EffectOptions,
): StyleBinding | Read<string> | undefined {
  if (typeof a === "string") {
    return brand<StyleBinding>({
      kind: "style",
      name: a,
      read: b as Read<unknown>,
    } satisfies PropBinding);
  }
  const prop = cssPropName(b as string);
  if (read === undefined) return styleRead(a, prop);
  bindStyle(a, { kind: "style", name: prop, read }, options);
  return undefined;
}

// Shared keyed reconcile for list()/each(): create or reuse each item's element (stamping its
// `data-loom-key`), collect them in item order, and drop keys that vanished (disposing their owned
// effects). Positioning the result — into a container's children or around an anchor — is the caller's
// job, which is the only thing the two entry points differ on.
function reconcileKeyed<T>(
  items: readonly T[],
  nodes: Map<string, Element>,
  key: (item: T) => string | number,
  render: (item: T, key: string) => Element,
): Element[] {
  const seen = new Set<string>();
  const ordered: Element[] = [];
  for (const item of items) {
    const k = String(key(item));
    if (seen.has(k)) throw new Error(`Duplicate Loom key "${k}".`);
    seen.add(k);
    let node = nodes.get(k);
    if (!node) {
      node = render(item, k);
      node.setAttribute("data-loom-key", k);
      nodes.set(k, node);
    }
    ordered.push(node);
  }
  for (const [k, node] of nodes) {
    if (seen.has(k)) continue;
    remove(node);
    nodes.delete(k);
  }
  return ordered;
}

export function list<T>(
  container: Element,
  read: Read<readonly T[]>,
  options: ListOptions<T>,
): Stop {
  const nodes = new Map<string, Element>();
  const stop = untrack(() =>
    effect(
      () => {
        const shouldReorder = options.reorder?.() !== false;
        const ordered = reconcileKeyed(
          read(),
          nodes,
          options.key,
          options.render,
        );
        if (shouldReorder) {
          positionOrdered(container, ordered, null);
        } else {
          // Externally positioned: only append the newly created keys, leave the rest in place.
          for (const node of ordered) {
            if (!node.parentNode) container.appendChild(node);
          }
        }
      },
      { label: "dom.list", target: container },
    ),
  );

  const stopList = (): void => {
    stop();
    for (const node of nodes.values()) remove(node);
    nodes.clear();
  };
  onUnmount(container, stopList);
  return stopList;
}

// Single-branch slot: an effect keyed off `key()`. On a key change the previous subtree is removed —
// disposing its owned effects — and `pick(key)` is built **untracked** before the anchor, so only the
// key subscribes the slot, not whatever the branch content reads.
function dynamic(
  key: Read<string>,
  pick: (key: string) => Child,
): DynamicChild {
  return brand<DynamicChild>({
    __loomDynamic: true,
    mount(anchor) {
      let mounted: Node[] = [];
      let currentKey: string | undefined;
      return untrack(() =>
        effect(
          () => {
            const k = key();
            if (k === currentKey) return;
            currentKey = k;
            for (const node of mounted) remove(node);
            const frag = document.createDocumentFragment();
            untrack(() => appendChild(frag, pick(k)));
            mounted = [...frag.childNodes];
            anchor.parentNode?.insertBefore(frag, anchor);
          },
          slotOpts(anchor, "dom.dynamic"),
        ),
      );
    },
  } satisfies SlotDescriptor);
}

/**
 * Conditional subtree, keyed on the truthiness of `cond`. Renders `render()` while truthy and the
 * optional `fallback()` while falsy, rebuilding **only when the truthiness flips** — so a `cond` whose
 * value changes while staying truthy does not tear down and recreate the subtree (read live state with
 * your own bindings inside `render` for that). The returned value is a child: place it in JSX or
 * `h()`, e.g. `{when(open, () => <Panel />)}`. Removing the subtree disposes its effects.
 */
export function when(
  cond: Read<unknown>,
  render: () => Child,
  fallback?: () => Child,
): Child {
  return dynamic(
    () => (cond() ? "1" : "0"),
    (key) => (key === "1" ? render() : fallback ? fallback() : null),
  );
}

/**
 * Multi-way subtree, keyed on `selector()`. Builds `cases[String(selector())]` (or `fallback` when no
 * case matches), rebuilding **only when the selected key changes**. The switch/case companion to
 * {@link when}: `{match(tab, { info: () => <Info />, graph: () => <Graph /> })}`. Place the result as a
 * child of a Loom element.
 */
export function match(
  selector: Read<string | number>,
  cases: Readonly<Record<string, () => Child>>,
  fallback?: () => Child,
): Child {
  return dynamic(
    () => String(selector()),
    (key) => {
      const branch = cases[key] ?? fallback;
      return branch ? branch() : null;
    },
  );
}

/**
 * Inline keyed list. Reconciles `items()` against an anchor — the `list()` companion for when you want
 * a keyed list as a child expression rather than against a container: `{each(rows, r => <Row />, r =>
 * r.id)}`. `render(item, key)` must return a single Element (its owned effects are disposed when the
 * item leaves); `key(item)` identifies it across updates so existing rows are moved, not rebuilt. Like
 * `list()`, it reorders by key and throws on a duplicate key. Place the result as a child of a Loom
 * element.
 */
export function each<T>(
  // State is spelled out alongside Read because its dual call signature otherwise blocks T inference
  // (a plain Read/computed infers fine; a state/fields cell would fall back to unknown).
  items: State<readonly T[]> | Read<readonly T[]>,
  render: (item: NoInfer<T>, key: string) => Element,
  key: (item: NoInfer<T>) => string | number,
): Child {
  return brand<DynamicChild>({
    __loomDynamic: true,
    mount(anchor) {
      const nodes = new Map<string, Element>();
      return untrack(() =>
        effect(
          () => {
            const ordered = reconcileKeyed(items(), nodes, key, render);
            const parent = anchor.parentNode;
            if (parent) positionOrdered(parent, ordered, anchor);
          },
          slotOpts(anchor, "dom.each"),
        ),
      );
    },
  } satisfies SlotDescriptor);
}

export function dispose(root: Node): void {
  const stack: Node[] = [root];
  for (let index = 0; index < stack.length; index++) {
    const node = stack[index] as Node;
    const stops = ownedEffects.get(node);
    if (stops) {
      ownedEffects.delete(node);
      stopOwned(stops);
    }
    for (let child = node.firstChild; child; child = child.nextSibling) {
      stack.push(child);
    }
  }
}

export function remove(node: Node): void {
  dispose(node);
  node.parentNode?.removeChild(node);
}

// px: a pointerup within this distance of the pointerdown counts as a tap, not a drag/scroll.
const TAP_SLOP = 10;

/**
 * Bind a robust tap handler. Unlike `click`, this is not dropped by iOS Safari when the DOM mutates
 * mid-gesture, because it is built from raw pointer events rather than a hit-test-synthesized click.
 * `handler` fires on pointerup when the release is the same pointer as the press and within
 * {@link TAP_SLOP} px of it (so a drag or scroll does not trigger it). Use the `ontap` JSX prop,
 * which routes here; this export is for imperative call sites (e.g. the inspector).
 */
export function onTap(
  node: Element,
  handler: (event: PointerEvent) => void,
): void {
  let id = -1;
  let x = 0;
  let y = 0;
  node.addEventListener("pointerdown", (event) => {
    const pointer = event as PointerEvent;
    id = pointer.pointerId;
    x = pointer.clientX;
    y = pointer.clientY;
  });
  node.addEventListener("pointerup", (event) => {
    const pointer = event as PointerEvent;
    if (pointer.pointerId !== id) return;
    id = -1;
    const dx = pointer.clientX - x;
    const dy = pointer.clientY - y;
    if (dx * dx + dy * dy <= TAP_SLOP * TAP_SLOP) handler(pointer);
  });
  node.addEventListener("pointercancel", () => {
    id = -1;
  });
}

/**
 * Attach a disposer to a node's Loom lifecycle: it runs when the node is torn down the Loom way —
 * `remove()`, `dispose()`, or an ancestor slot/list swapping it out. The `onunmount` JSX prop is
 * this function as a prop — one concept, two syntaxes — for kit components that create their own
 * effects/listeners for an element they build. (This is ownership; `effect`'s `target` option is
 * inspector attribution only.)
 */
export function onUnmount(node: Node, stop: Stop): void {
  const owned = ownedEffects.get(node);
  if (!owned) ownedEffects.set(node, stop);
  else if (Array.isArray(owned)) owned.push(stop);
  else ownedEffects.set(node, [owned, stop]);
}

/**
 * Reactive DOM state that dies with this node: an `effect(fn)` that is target-attributed to the
 * node (inspector hover/highlight) and disposed with it (`remove()`, `dispose()`, a keyed row
 * leaving). The one-call form of `onUnmount(el, effect(fn, { target: el }))` — the dominant idiom
 * of kit code. Returns the stop for rare early manual disposal; options merge over the target
 * default, so `{ target: other }` can re-attribute.
 */
export function bind(
  node: Node,
  fn: CleanupEffectFn,
  options?: EffectOptions,
): Stop;
export function bind(node: Node, fn: EffectFn, options?: EffectOptions): Stop;
export function bind(node: Node, fn: EffectFn, options?: EffectOptions): Stop {
  const stop = effect(fn, { target: node, ...options });
  onUnmount(node, stop);
  return stop;
}

function stopOwned(owned: OwnedEffect): void {
  if (Array.isArray(owned)) {
    for (const stop of owned) stop();
  } else {
    owned();
  }
}

function applyProps(node: Element, props: Props): void {
  for (const name in props) {
    if (!Object.hasOwn(props, name) || name === "children") continue;
    const value = props[name];
    if (value == null || (value === false && !isAriaAttr(name))) continue;
    if (name === "key") {
      node.setAttribute("data-loom-key", String(value));
      continue;
    }
    if (name === "class" || name === "className") {
      applyClassProp(node, value as ClassProp);
      continue;
    }
    if (name === "style") {
      applyStyleProp(node, value as StyleProp);
      continue;
    }
    // Loom lifecycle hook (not a DOM event): a cleanup run when the node is torn down the Loom way
    // (`remove()` / `dispose()`, or an ancestor slot swapping it out). Grouped with the other
    // Loom-owned props above, not the DOM `on*` listeners below — it rides the node-owned disposer
    // channel (same as the reactive bindings), so it fires exactly when they do.
    if (
      (name === "onmount" || name === "onMount") &&
      typeof value === "function"
    ) {
      onMount(node, value as (node: Node) => void);
      continue;
    }
    if (
      (name === "onunmount" || name === "onUnmount") &&
      typeof value === "function"
    ) {
      onUnmount(node, value as Stop);
      continue;
    }
    if (isAttrBinding(value)) {
      const binding = brand<PropBinding>(value);
      bindAttrValue(node, binding.name, binding.read);
      continue;
    }
    if ((name === "ontap" || name === "onTap") && typeof value === "function") {
      onTap(node, value as (event: PointerEvent) => void);
      continue;
    }
    if (name.startsWith("on") && typeof value === "function") {
      node.addEventListener(eventName(name), value as EventListener);
      continue;
    }
    if (typeof value === "function") {
      bindAttrValue(node, name, value as Read<unknown>);
      continue;
    }
    setAttr(node, name, value);
  }
}

function appendChild(parent: Node, child: Child): void {
  if (Array.isArray(child)) {
    for (const item of child) appendChild(parent, item);
    return;
  }
  if (isDynamic(child)) {
    mountSlot(parent, child);
    return;
  }
  if (child == null || child === true || child === false) return;
  if (typeof child === "function") {
    parent.appendChild(text(child as Read<unknown>));
    return;
  }
  if (child instanceof Node) {
    parent.appendChild(child);
    return;
  }
  // Wrong-runtime guard: a loom/html Html value stringifies to its raw markup, so the silent
  // fallback below would render escaped HTML as visible text — the most confusing possible
  // symptom of a mixed-up jsxImportSource. The brand is a registered symbol, so this costs no
  // import from loom/html.
  if (typeof child === "object" && Symbol.for("loom.html") in child) {
    throw new Error(
      "loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.",
    );
  }
  parent.appendChild(document.createTextNode(String(child)));
}

function isDynamic(child: Child): child is DynamicChild {
  return (
    typeof child === "object" &&
    child !== null &&
    (child as { readonly __loomDynamic?: unknown }).__loomDynamic === true
  );
}

// Drive a slot: append a trailing comment anchor (now, while `parent` exists, so there is no
// detached-node timing gap), wire the slot's effect via `mount(anchor)`, and own its disposer on the
// anchor so removing the parent subtree tears it down.
function mountSlot(parent: Node, desc: DynamicChild): void {
  const anchor = document.createComment("loom-slot");
  parent.appendChild(anchor);
  onUnmount(anchor, brand<SlotDescriptor>(desc).mount(anchor));
}

// Effect options for a slot: label it, and target its parent element (when there is one) so the
// inspector can attribute the work — mirrors what list() passes for its container.
function slotOpts(anchor: Comment, label: string): EffectOptions {
  const parent = anchor.parentNode;
  return parent instanceof Element ? { label, target: parent } : { label };
}

function applyClassProp(node: Element, value: ClassProp): void {
  if (Array.isArray(value)) {
    for (const item of value) applyClassProp(node, item);
    return;
  }
  if (!value) return;
  if (typeof value === "string") {
    appendClassName(node, value);
    return;
  }
  if (isClassBinding(value)) {
    bindClass(node, brand<PropBinding>(value));
    return;
  }
  if (!isPlainRecord(value)) return;
  for (const name in value) {
    if (!Object.hasOwn(value, name)) continue;
    applyClassMapValue(node, name, value[name]);
  }
}

function appendClassName(node: Element, value: string): void {
  const next = value.trim();
  if (!next) return;

  const current = node.getAttribute("class");
  node.setAttribute("class", current ? `${current} ${next}` : next);
}

function hasClassName(node: Element, name: string): boolean {
  const current = node.getAttribute("class");
  return current ? current.split(/\s+/).includes(name) : false;
}

function applyStyleProp(node: Element, value: StyleProp): void {
  if (Array.isArray(value)) {
    for (const item of value) applyStyleProp(node, item);
    return;
  }
  if (!value) return;
  if (typeof value === "string") {
    node.setAttribute("style", value);
    return;
  }
  if (isStyleBinding(value)) {
    bindStyle(node, brand<PropBinding>(value));
    return;
  }
  if (!isPlainRecord(value)) return;
  const styleDecl = (node as StyledElement).style;
  for (const name in value) {
    if (!Object.hasOwn(value, name)) continue;
    const styleValue = value[name];
    const property = cssPropName(name);
    if (typeof styleValue === "function") {
      bindStyle(node, {
        kind: "style",
        name: property,
        read: styleValue as Read<unknown>,
      });
    } else if (styleValue != null) {
      styleDecl.setProperty(property, String(styleValue));
    }
  }
}

function applyClassMapValue(node: Element, name: string, value: unknown): void {
  if (typeof value === "function") {
    bindClass(node, { kind: "class", name, read: value as Read<unknown> });
  } else if (value) {
    node.classList.add(name);
  }
}

function bindClass(
  node: Element,
  binding: PropBinding,
  options?: EffectOptions,
): void {
  bindReactiveValue(
    node,
    `dom.class.${binding.name}`,
    () => Boolean(binding.read()),
    (next) => node.classList.toggle(binding.name, next),
    hasClassName(node, binding.name),
    options,
  );
}

function bindAttrValue(
  node: Element,
  name: string,
  read: Read<unknown>,
  options?: EffectOptions,
): void {
  bindReactiveValue(
    node,
    `dom.attr.${name}`,
    () => attrValue(name, read()),
    (next) => setAttrValue(node, name, next),
    undefined,
    options,
  );
}

function bindStyle(
  node: Element,
  binding: PropBinding,
  options?: EffectOptions,
): void {
  const styleDecl = (node as StyledElement).style;
  bindReactiveValue(
    node,
    `dom.style.${binding.name}`,
    () => attrValue(binding.name, binding.read()),
    (next) => {
      if (next === null) styleDecl.removeProperty(binding.name);
      else styleDecl.setProperty(binding.name, next);
    },
    undefined,
    options,
  );
}

// The one dedup-effect scaffold behind every binding (text/attr/class/style): run `read` in an
// untracked-created effect, apply only on change, own the disposer on the node. `options` merges
// over the defaults so a caller can relabel or mark the binding `internal`.
function bindReactiveValue<T>(
  node: Node,
  label: string,
  read: () => T,
  apply: (value: T) => void,
  initial?: T,
  options?: EffectOptions,
): void {
  let previous = initial;
  const stop = untrack(() =>
    effect(
      () => {
        const next = read();
        if (next === previous) return;
        previous = next;
        apply(next);
      },
      { label, target: node, ...options },
    ),
  );
  onUnmount(node, stop);
}

function setAttr(node: Element, name: string, value: unknown): void {
  setAttrValue(node, name, attrValue(name, value));
}

function setAttrValue(node: Element, name: string, value: string | null): void {
  if (value === null) node.removeAttribute(name);
  else node.setAttribute(name, value);
}

function attrValue(name: string, value: unknown): string | null {
  if (isAriaAttr(name) && typeof value === "boolean") return String(value);
  if (value == null || value === false) return null;
  if (value === true) return "";
  return String(value);
}

function isAriaAttr(name: string): boolean {
  return name.startsWith("aria-");
}

function stringValue(value: unknown): string {
  if (value == null || value === false) return "";
  return String(value);
}

function eventName(name: string): string {
  return name.slice(2).toLowerCase();
}

function isAttrBinding(value: unknown): value is AttrBinding {
  return isBinding(value, "attr");
}

function isClassBinding(value: unknown): value is ClassBinding {
  return isBinding(value, "class");
}

function isStyleBinding(value: unknown): value is StyleBinding {
  return isBinding(value, "style");
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isBinding<TKind extends "attr" | "class" | "style">(
  value: unknown,
  kind: TKind,
): value is {
  readonly kind: TKind;
  readonly name: string;
  readonly read: Read<unknown>;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { readonly kind?: unknown }).kind === kind &&
    typeof (value as { readonly name?: unknown }).name === "string" &&
    typeof (value as { readonly read?: unknown }).read === "function"
  );
}

export { connected } from "./connected.js";
export { type MorphOptions, morph } from "./morph.js";
export {
  type IntersectionCallback,
  type IntersectionOptions,
  observeIntersection,
} from "./observe-intersection.js";
export {
  type MutationsCallback,
  observeMutation,
} from "./observe-mutation.js";
export { observeSize, type SizeCallback } from "./observe-size.js";
export { onMount } from "./onmount.js";
export { type PersistedOptions, persisted } from "./persisted.js";
export { type ScrollFadeOptions, scrollFade } from "./scroll-fade.js";

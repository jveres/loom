import { throwCollected } from "../core/errors.js";
import { cssPropName, isAriaAttr } from "../jsx-props.js";
import {
  type CleanupEffectFn,
  domEffect,
  type EffectFn,
  type EffectNode,
  type EffectOptions,
  type Read,
  type State,
  type Stop,
  untrack,
} from "../loom.js";
import { nodeDocument } from "./document-observer.js";
import {
  type EachOptions,
  type ListOptions,
  type LoomKey,
  reconcileKeyed,
} from "./keyed-reconcile.js";
import { nodeLifetime } from "./lifetime.js";
import { onMount } from "./on-mount.js";
import { dispose } from "./ownership.js";
import {
  own,
  ownResource,
  ownStoppableResource,
  removeNodes,
  withConstructionRollback,
} from "./ownership-base.js";

export type {
  EachOptions,
  ListOptions,
  ListUpdate,
} from "./keyed-reconcile.js";

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

// Opaque handles returned by the slot factories (`when`/`match`/`each`). Their runtime shape is an
// internal detail — callers only receive one to hand straight back into JSX or `h()` — so the public
// type is branded with a private symbol and exposes no structure. Build them with the factories;
// never hand-construct. `DynamicChild` is also a member of {@link Child}.
declare const BINDING: unique symbol;
export type DynamicChild = { readonly [BINDING]: "dynamic" };

interface SlotDescriptor {
  readonly __loomDynamic: true;
  readonly mount: (anchor: Comment) => EffectNode;
}

// The one trust boundary between a descriptor's real shape and its opaque public handle. Phantom
// brands have no runtime form, so this reinterpret can't be checked — it's a single `as` from `object`
// (not a double cast), kept here so no other call site reaches across the seam.
const brand = <T extends object>(descriptor: object): T => descriptor as T;

type ClassProp = string | ClassMap | null | undefined | readonly ClassProp[];
type ClassMap = Record<string, unknown>;
type StyleMap = Record<string, unknown>;
type StyleProp = string | StyleMap | null | undefined | readonly StyleProp[];

// An element with an inline `style` — both HTMLElement and SVGElement satisfy this, so style
// bindings state it rather than a false HTMLElement claim (a truly style-less Element would throw).
type StyledElement = Element & ElementCSSInlineStyle;

// Deliberately open: the typed props below (class/style/key) are for editor help and reactive-value
// handling, but the `Record<string, unknown>` index accepts any attribute name/value. Loom is a thin
// layer over setAttribute, so applyProps validates and applies at runtime rather than the type
// enforcing an exhaustive per-element attribute model; a typo'd attribute is set as-is, not rejected.
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

const SVG_NS = "http://www.w3.org/2000/svg";
// SVG-only tag names — elements that must be created in the SVG namespace. Tags shared with
// HTML (a, title, script, style) are intentionally omitted so standalone h()/JSX calls keep
// rendering as HTML. Use svgElement() for those context-dependent shared names.
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
let svgTags: Set<string> | undefined;
const isSvgTag = (tag: string): boolean => {
  svgTags ??= new Set(
    "svg g defs symbol use switch foreignObject image path rect circle ellipse line polyline polygon text tspan textPath linearGradient radialGradient stop clipPath mask pattern marker filter feGaussianBlur feOffset feBlend feColorMatrix feComposite feFlood feMerge feMergeNode feMorphology feDropShadow feImage feTile feTurbulence feDisplacementMap".split(
      " ",
    ),
  );
  return svgTags.has(tag);
};
export type SvgTagName = (typeof SVG_TAG_LIST)[number];

/**
 * Parse a static, single-root HTML fragment once and return a cheap deep-clone
 * factory. A standard HTML tag gives the clone its precise element type;
 * custom-element and other tag names safely fall back to Element. Dynamic
 * values deliberately are not accepted: clone the skeleton, then bind or
 * assign its dynamic fields. This keeps repeated views on the browser's
 * optimized native clone path and makes the trust boundary explicit.
 */
export function template<K extends keyof HTMLElementTagNameMap>(
  rootTag: K,
): (
  strings: TemplateStringsArray,
  ...values: readonly unknown[]
) => () => HTMLElementTagNameMap[K];
export function template(
  rootTag: string,
): (
  strings: TemplateStringsArray,
  ...values: readonly unknown[]
) => () => Element;
export function template(
  rootTag: string,
): (
  strings: TemplateStringsArray,
  ...values: readonly unknown[]
) => () => Element {
  return (strings, ...values) => {
    if (values.length !== 0 || strings.length !== 1) {
      throw new TypeError(
        "template() accepts static markup only; bind dynamic values after cloning.",
      );
    }
    const holder = document.createElement("template");
    holder.innerHTML = strings[0] ?? "";
    const root = holder.content.firstElementChild;
    let extra = !root;
    for (
      let node = holder.content.firstChild;
      node && !extra;
      node = node.nextSibling
    ) {
      extra =
        node !== root &&
        (node.nodeType === 1 ||
          (node.nodeType === 3 && Boolean(node.nodeValue?.trim())));
    }
    if (extra || !root) {
      throw new TypeError("template() requires exactly one root element.");
    }
    if (root.localName !== rootTag) {
      throw new TypeError(
        `template(${JSON.stringify(rootTag)}) requires a <${rootTag}> root.`,
      );
    }
    return () => root.cloneNode(true) as Element;
  };
}

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: ElementProps | null,
  children?: Child,
): HTMLElementTagNameMap[K];
export function h<K extends keyof SVGElementTagNameMap>(
  tag: K,
  props?: ElementProps | null,
  children?: Child,
): SVGElementTagNameMap[K];
export function h(
  tag: string,
  props?: ElementProps | null,
  children?: Child,
): Element;
export function h(
  tag: string,
  props: ElementProps | null = null,
  children?: Child,
): Element {
  return isSvgTag(tag)
    ? svgElement(tag, props, children)
    : finishElement(document.createElement(tag), props, children, true);
}

function finishElement<T extends Element>(
  node: T,
  props: ElementProps | null,
  children: Child | undefined,
  htmlElement: boolean,
): T {
  // Children precede props so form properties such as <select value={...}> are applied only after
  // their options exist. Every prop is still installed synchronously before h() returns.
  if (children !== undefined) {
    if (typeof children === "string") node.textContent = children;
    else appendChild(node, children);
  }
  if (props) applyProps(node, props, htmlElement);
  return node;
}

/** Replace a node's children while preserving Loom ownership. Incoming
 *  descendants are moved aside first. After native replacement succeeds,
 *  every outgoing subtree is disposed; disposal failures are rethrown only
 *  after all outgoing resources have been given a chance to stop. A staging
 *  or native failure restores supplied nodes and disposes newly staged
 *  reactive children before it is rethrown. */
export function replaceChildren(
  parent: Node & ParentNode,
  ...children: readonly Child[]
): void {
  const next = (nodeDocument(parent) ?? document).createDocumentFragment();
  const incoming = new Set<Node>();
  const originalChildren = new Map<Node, readonly Node[]>();
  const remember = (child: Child): void => {
    if (Array.isArray(child)) {
      for (const item of child) remember(item);
      return;
    }
    if (
      typeof child !== "object" ||
      child === null ||
      !isNode(child) ||
      incoming.has(child)
    ) {
      return;
    }
    incoming.add(child);
    const currentParent = child.parentNode;
    if (currentParent && !originalChildren.has(currentParent)) {
      originalChildren.set(currentParent, [...currentParent.childNodes]);
    }
    // Appending a DocumentFragment consumes its children rather than moving
    // the fragment node. Treat those children as caller-owned inputs too so
    // failure can reconstruct the fragment verbatim.
    if (child.nodeType === 11) {
      for (let nested = child.firstChild; nested; nested = nested.nextSibling) {
        remember(nested);
      }
    }
  };
  remember(children);

  let outgoing: Node[] = [];
  // Do not stop live bindings until native replacement has succeeded. A
  // hierarchy error can leave the old DOM in place, where those resources
  // must remain live.
  try {
    appendChild(next, children);
    outgoing = [...parent.childNodes];
    parent.replaceChildren(next);
  } catch (failure) {
    const errors = [failure];
    // Reconstruct every original parent from right to left. Using the
    // parent's captured child order (not argument/move order) restores
    // reversed siblings and nested inputs exactly.
    for (const [originalParent, saved] of originalChildren) {
      let before: Node | null = null;
      for (let index = saved.length - 1; index >= 0; index--) {
        const child = saved[index] as Node;
        if (incoming.has(child)) {
          try {
            originalParent.insertBefore(child, before);
            before = child;
          } catch (error) {
            errors.push(error);
          }
        } else if (child.parentNode === originalParent) {
          before = child;
        }
      }
    }
    // Nodes supplied already detached still belong to the caller. Detach the
    // outermost ones from the staging fragment so cleanup cannot consume them.
    for (const node of incoming) {
      let ancestor = node.parentNode;
      while (ancestor && ancestor !== next && !incoming.has(ancestor)) {
        ancestor = ancestor.parentNode;
      }
      if (ancestor === next) next.removeChild(node);
    }
    try {
      dispose(next);
    } catch (error) {
      errors.push(error);
    }
    throwCollected(
      errors,
      "Loom DOM child replacement and staging cleanup failed.",
    );
  }

  removeNodes(outgoing);
}

/**
 * Create an explicitly SVG-namespaced element. Use this for names shared with HTML (`a`, `title`,
 * `script`, and `style`), whose namespace cannot be inferred from an already-evaluated JSX child.
 */
export function svgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  props?: ElementProps | null,
  children?: Child,
): SVGElementTagNameMap[K];
export function svgElement(
  tag: string,
  props?: ElementProps | null,
  children?: Child,
): SVGElement;
export function svgElement(
  tag: string,
  props: ElementProps | null = null,
  children?: Child,
): SVGElement {
  return finishElement(
    document.createElementNS(SVG_NS, tag),
    props,
    children,
    false,
  );
}

// `options` lets a caller relabel the binding or, for tooling built on loom, mark it `internal` so
// it isn't observed by the inspector (which uses this to bind its own text without self-reporting).
export function text(read: Read<unknown>, options?: EffectOptions): Text {
  const node = document.createTextNode("");
  let previous = "";
  ownResource(
    node,
    domEffect(
      () => {
        const raw = read();
        const next = raw == null || raw === false ? "" : String(raw);
        if (next === previous) return;
        previous = next;
        node.data = next;
      },
      "dom.text",
      node,
      options,
    ),
  );
  return node;
}

/** Options for a node-owned reactive binding. */
export interface BindingOptions extends EffectOptions {
  readonly signal?: AbortSignal;
}

function bindEffect(
  node: Node,
  fn: EffectFn,
  label: string,
  options?: BindingOptions,
): Stop {
  if (options?.signal?.aborted) return () => {};
  return ownStoppableResource(
    node,
    domEffect(fn, label, node, options),
    options?.signal,
  );
}

/** Bind an attribute to a tracked read; nullish/false removes it. */
export function bindAttr(
  el: Element,
  name: string,
  read: Read<unknown>,
  options?: BindingOptions,
): Stop {
  return bindEffect(
    el,
    attrUpdater(el, name, read),
    `dom.attr.${name}`,
    options,
  );
}

/** Bind one class token to the truthiness of a tracked read. */
export function bindClass(
  el: Element,
  name: string,
  read: Read<unknown>,
  options?: BindingOptions,
): Stop {
  return bindEffect(
    el,
    classUpdater(el, name, read),
    `dom.class.${name}`,
    options,
  );
}

/** Bind an inline style property to a tracked read. */
export function bindStyle(
  el: StyledElement,
  name: string,
  read: Read<unknown>,
  options?: BindingOptions,
): Stop {
  const prop = cssPropName(name);
  return bindEffect(
    el,
    styleUpdater(el, prop, read),
    `dom.style.${prop}`,
    options,
  );
}

export function list<T>(
  container: Element,
  read: State<readonly T[]> | Read<readonly T[]>,
  options: ListOptions<NoInfer<T>>,
): Stop {
  const life = nodeLifetime(container, options.signal);
  if (!life.active) return life.stop;
  const nodes = new Map<LoomKey, Element>();
  const stop = ownStoppableResource(
    container,
    domEffect(
      () =>
        reconcileKeyed(
          container,
          null,
          read(),
          nodes,
          options.key,
          options.render,
          options.reorder?.() !== false,
          options.update,
        ),
      "dom.list",
      container,
    ),
  );

  life.add(() => {
    const outgoing = [...nodes.values()];
    nodes.clear();
    const errors: unknown[] = [];
    try {
      stop();
    } catch (error) {
      errors.push(error);
    }
    removeNodes(outgoing, errors);
  });
  return life.stop;
}

// Single-branch slot: an effect keyed off `key()`. On a key change the previous subtree is removed —
// disposing its owned effects — and `pick(key)` is built **untracked** before the anchor, so only the
// key subscribes the slot, not whatever the branch content reads. The branch owns every node between
// a start marker and the anchor, so nodes that a child slot (`each`, `when`, `match`) inserts after
// the build are removed with it.
function dynamic(
  key: Read<string>,
  pick: (key: string) => Child,
): DynamicChild {
  return brand<DynamicChild>({
    __loomDynamic: true,
    mount(anchor) {
      const start = document.createComment("");
      anchor.parentNode?.insertBefore(start, anchor);
      let currentKey: string | undefined;
      return domEffect(
        () => {
          const k = key();
          const parent = anchor.parentNode;
          if (k === currentKey || !parent) return;
          if (start.parentNode !== parent) parent.insertBefore(start, anchor);
          const mounted: Node[] = [];
          for (
            let node = start.nextSibling;
            node && node !== anchor;
            node = node.nextSibling
          )
            mounted.push(node);
          const next: Node[] = withConstructionRollback(() => {
            const frag = (
              parent.ownerDocument ?? document
            ).createDocumentFragment();
            try {
              untrack(() => appendChild(frag, pick(k)));
              const added = [...frag.childNodes];
              parent.insertBefore(frag, anchor);
              return added;
            } catch (error) {
              removeNodes([...frag.childNodes], [error]);
              throw error;
            }
          });
          currentKey = k;
          removeNodes(mounted.filter((node) => !next.includes(node)));
        },
        "dom.dynamic",
        slotTarget(anchor),
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
    (key) => (key === "1" ? render() : fallback?.()),
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
    (key) =>
      ((Object.hasOwn(cases, key) ? cases[key] : undefined) ?? fallback)?.(),
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
  // (a plain Read/computed infers fine; a state/fields signal would fall back to unknown).
  items: State<readonly T[]> | Read<readonly T[]>,
  render: (item: NoInfer<T>, key: string) => Element,
  key: (item: NoInfer<T>) => string | number,
  options: EachOptions<NoInfer<T>> = {},
): Child {
  return brand<DynamicChild>({
    __loomDynamic: true,
    mount(anchor) {
      const nodes = new Map<LoomKey, Element>();
      return domEffect(
        () => {
          const values = items();
          const parent = anchor.parentNode;
          if (parent)
            reconcileKeyed(
              parent,
              anchor,
              values,
              nodes,
              key,
              render,
              true,
              options.update,
            );
        },
        "dom.each",
        slotTarget(anchor),
      );
    },
  } satisfies SlotDescriptor);
}

/** Install a tracked DOM effect with node ownership and explicit early teardown. */
export function bind(
  node: Node,
  fn: CleanupEffectFn,
  options?: BindingOptions,
): Stop;
export function bind(node: Node, fn: EffectFn, options?: BindingOptions): Stop;
export function bind(node: Node, fn: EffectFn, options?: BindingOptions): Stop {
  return bindEffect(node, fn, "dom.bind", options);
}

function ownEffect(node: Node, fn: EffectFn, label: string): void {
  ownResource(node, domEffect(fn, label, node));
}

function applyProps(
  node: Element,
  props: ElementProps,
  htmlElement: boolean,
): void {
  let classApplied = false;
  for (const name in props) {
    if (!Object.hasOwn(props, name) || name === "children") continue;
    const value = props[name];
    if (name === "key") {
      if (value != null) node.setAttribute("data-loom-key", String(value));
      continue;
    }
    if (name === "class" || name === "className") {
      // h()/JSX creates a fresh element, so the first plain class string can be installed directly.
      // Avoid the read/append path used for arrays and a second class/className prop.
      if (!classApplied && typeof value === "string") {
        const next = value.trim();
        if (next) {
          if (htmlElement) (node as HTMLElement).className = next;
          else node.setAttribute("class", next);
        }
      } else {
        applyClassProp(node, value as ClassProp);
      }
      classApplied = true;
      continue;
    }
    if (name === "style") {
      applyStyleProp(node, value as StyleProp);
      continue;
    }
    if (name[0] === "o" || name[0] === "O") {
      const lower = name.toLowerCase();
      if (name === "ontap" || name === "onTap" || lower === "ondoublepress") {
        throw new TypeError("Install tap behavior from loom/events.");
      }
      if (name.startsWith("on") && typeof value === "function") {
        if (lower === "onmount") onMount(node, value as (node: Node) => void);
        else if (lower === "onunmount") own(node, value as Stop);
        else {
          const type = lower === "ondoubleclick" ? "dblclick" : lower.slice(2);
          const listener = (event: Event): void =>
            untrack(() => (value as EventListener)(event));
          node.addEventListener(type, listener);
          own(node, () => node.removeEventListener(type, listener));
        }
        continue;
      }
    }
    if (isFormControlProperty(node, name)) {
      if (typeof value === "function") {
        ownEffect(
          node,
          valueUpdater(
            value as Read<unknown>,
            (next) => setFormControlProperty(node, name, next),
            formControlUnset,
          ),
          `dom.prop.${name}`,
        );
      } else {
        setFormControlProperty(node, name, value);
      }
      continue;
    }
    if (value == null || (value === false && !isAriaAttr(name))) continue;
    if (typeof value === "function") {
      ownEffect(
        node,
        attrUpdater(node, name, value as Read<unknown>),
        `dom.attr.${name}`,
      );
      continue;
    }
    setAttrValue(node, name, attrValue(name, value));
  }
}

function appendChild(parent: Node, child: Child): void {
  if (Array.isArray(child)) {
    for (const item of child) appendChild(parent, item);
    return;
  }
  if (child == null || typeof child === "boolean") return;
  if (typeof child === "function") {
    parent.appendChild(text(child as Read<unknown>));
    return;
  }
  if (typeof child === "object") {
    if (isDynamic(child)) {
      mountSlot(parent, child);
      return;
    }
    if (isNode(child)) {
      parent.appendChild(child);
      return;
    }
    // Wrong-runtime guard: a loom/html Html value stringifies to its raw markup, so the silent
    // fallback below would render escaped HTML as visible text — the most confusing possible
    // symptom of a mixed-up jsxImportSource. The brand is a registered symbol, so this costs no
    // import from loom/html.
    if (Symbol.for("loom.html") in child) {
      throw new Error(
        "loom/html Html value used as a loom/dom child — wrong jsxImportSource? Mount SSR strings via morph()/innerHTML.",
      );
    }
  }
  parent.appendChild(document.createTextNode(String(child)));
}

function isNode(value: object): value is Node {
  const globalNode = (globalThis as { readonly Node?: typeof Node }).Node;
  if (globalNode && value instanceof globalNode) return true;
  // `instanceof globalThis.Node` rejects nodes created by an iframe or another Window. Prefer the
  // common same-realm check above; discover the candidate's own realm only on that uncommon miss.
  const candidate = value as {
    readonly defaultView?: Window | null;
    readonly ownerDocument?: Document | null;
  };
  const ownNode = (
    (candidate.ownerDocument?.defaultView ?? candidate.defaultView) as
      | (Window & { readonly Node?: typeof Node })
      | null
      | undefined
  )?.Node;
  return Boolean(ownNode && value instanceof ownNode);
}

function isDynamic(child: object): child is DynamicChild {
  return (child as { readonly __loomDynamic?: unknown }).__loomDynamic === true;
}

// Drive a slot: append a trailing comment anchor (now, while `parent` exists, so there is no
// detached-node timing gap), wire the slot's effect via `mount(anchor)`, and own its disposer on the
// anchor so removing the parent subtree tears it down.
function mountSlot(parent: Node, desc: DynamicChild): void {
  const anchor = document.createComment("");
  parent.appendChild(anchor);
  ownResource(anchor, brand<SlotDescriptor>(desc).mount(anchor));
}

// Attribute slot work to its parent element when possible, falling back to the anchor itself.
function slotTarget(anchor: Comment): Node {
  const parent = anchor.parentNode;
  return parent instanceof Element ? parent : anchor;
}

function applyClassProp(node: Element, value: ClassProp): void {
  if (Array.isArray(value)) {
    for (const item of value) applyClassProp(node, item);
  } else if (typeof value === "string") {
    const next = value.trim();
    if (next) {
      const current = node.getAttribute("class");
      node.setAttribute("class", current ? `${current} ${next}` : next);
    }
  } else if (value && typeof value === "object") {
    for (const name in value) {
      if (!Object.hasOwn(value, name)) continue;
      const item = (value as ClassMap)[name];
      if (typeof item === "function") {
        ownEffect(
          node,
          classUpdater(node, name, item as Read<unknown>),
          `dom.class.${name}`,
        );
      } else if (item) {
        node.classList.add(name);
      }
    }
  }
}

function applyStyleProp(node: Element, value: StyleProp): void {
  if (Array.isArray(value)) {
    for (const item of value) applyStyleProp(node, item);
  } else if (typeof value === "string") {
    if (value) node.setAttribute("style", value);
  } else if (value && typeof value === "object") {
    const styleDecl = (node as StyledElement).style;
    for (const name in value) {
      if (!Object.hasOwn(value, name)) continue;
      const styleValue = (value as StyleMap)[name];
      const property = cssPropName(name);
      if (typeof styleValue === "function") {
        ownEffect(
          node,
          styleUpdater(node, property, styleValue as Read<unknown>),
          `dom.style.${property}`,
        );
      } else if (styleValue != null) {
        styleDecl.setProperty(property, String(styleValue));
      }
    }
  }
}

function classUpdater(
  node: Element,
  name: string,
  read: Read<unknown>,
): EffectFn {
  let previous = node.classList.contains(name);
  return () => {
    const next = Boolean(read());
    if (next === previous) return;
    node.classList.toggle(name, next);
    previous = next;
  };
}

function attrUpdater(
  node: Element,
  name: string,
  read: Read<unknown>,
): EffectFn {
  return valueUpdater(
    () => attrValue(name, read()),
    (next) => setAttrValue(node, name, next),
  );
}

type FormControlProperty = "checked" | "selected" | "value";
const formControlUnset = /* @__PURE__ */ Symbol();
type FormControlElement = Element & {
  checked?: boolean;
  selected?: boolean;
  value?: string;
};

function isFormControlProperty(
  node: Element,
  name: string,
): name is FormControlProperty {
  if (
    (name !== "checked" && name !== "selected" && name !== "value") ||
    node.namespaceURI !== "http://www.w3.org/1999/xhtml"
  )
    return false;
  const tag = node.localName;
  return name === "checked"
    ? tag === "input"
    : name === "selected"
      ? tag === "option"
      : /^(?:button|input|option|select|textarea)$/.test(tag);
}

function setFormControlProperty(
  node: Element,
  name: FormControlProperty,
  value: unknown,
): void {
  setAttrValue(node, name, attrValue(name, value));
  const control = node as FormControlElement;
  if (name === "value") {
    const next = value == null ? "" : String(value);
    if (
      !next ||
      node.localName !== "input" ||
      (node as HTMLInputElement).type !== "file"
    ) {
      control.value = next;
    }
  } else {
    control[name] = Boolean(value);
  }
}

function styleUpdater(
  node: Element,
  name: string,
  read: Read<unknown>,
): EffectFn {
  const styleDecl = (node as StyledElement).style;
  return valueUpdater(
    () => attrValue(name, read()),
    (next) => {
      if (next === null) styleDecl.removeProperty(name);
      else styleDecl.setProperty(name, next);
    },
  );
}

// Shared dedup scaffold for the less common attr/property/style paths. Text and class keep
// specialized bodies above so large mounts do not retain two extra wrapper closures per binding.
function valueUpdater<T>(
  read: () => T,
  apply: (value: T) => void,
  initial?: T,
): EffectFn {
  let previous = initial;
  return () => {
    const next = read();
    if (next === previous) return;
    apply(next);
    previous = next;
  };
}

function setAttrValue(node: Element, name: string, value: string | null): void {
  if (value === null) node.removeAttribute(name);
  else node.setAttribute(name, value);
}

function attrValue(name: string, value: unknown): string | null {
  if (isAriaAttr(name) && typeof value === "boolean") return String(value);
  return value == null || value === false
    ? null
    : value === true
      ? ""
      : String(value);
}

export { type BindValueOptions, bindValue } from "./bind-value.js";
export { keyedChild } from "./keyed-child.js";
export { type MorphOptions, morph, morphChildren } from "./morph.js";
export { type OnMountOptions, onMount } from "./on-mount.js";
export {
  dispose,
  onUnmount,
  pause,
  type ResourceGroup,
  remove,
  resourceGroup,
  resume,
} from "./ownership.js";

import { untrack } from "../core/tracking.js";
import { cssPropName } from "../jsx-props.js";
import {
  type CleanupEffectFn,
  domBindingEffect,
  domEffect,
  type EffectFn,
  type EffectNode,
  type EffectOptions,
  type Read,
  type State,
  type Stop,
} from "../loom.js";
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

// Opaque handles returned by the binding/slot factories (`attr`/`classed`/`style` and
// `when`/`match`/`each`). Their runtime shape is an internal detail — callers only receive one to
// hand straight back into JSX or `h()` — so the public types are branded with a private symbol and
// expose no structure. Build them with the factories; never hand-construct. `DynamicChild` is also a
// member of {@link Child}.
declare const BINDING: unique symbol;
export type DynamicChild = { readonly [BINDING]: "dynamic" };

// The real shapes behind those handles, private to this module.
interface PropBinding {
  readonly kind: "attr" | "class" | "style";
  readonly name: string;
  readonly read: Read<unknown>;
}
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
const SVG_TAGS = new Set<string>(SVG_TAG_LIST);
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
    const hasExtraContent = [...holder.content.childNodes].some(
      (node) =>
        (node.nodeType === Node.ELEMENT_NODE && node !== root) ||
        (node.nodeType === Node.TEXT_NODE &&
          (node.textContent ?? "").trim() !== ""),
    );
    if (root === null || hasExtraContent) {
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
  const isSvg = SVG_TAGS.has(tag);
  const node = isSvg
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);
  // Children precede props so form properties such as <select value={...}> are applied only after
  // their options exist. Every prop is still installed synchronously before h() returns.
  if (children !== undefined) {
    if (typeof children === "string") node.textContent = children;
    else appendChild(node, children);
  }
  if (props) applyProps(node, props, !isSvg);
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
  const owner =
    parent.nodeType === Node.DOCUMENT_NODE
      ? (parent as Document)
      : parent.ownerDocument;
  const next = (owner ?? document).createDocumentFragment();
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
    if (child.parentNode) {
      const parent = child.parentNode;
      if (!originalChildren.has(parent)) {
        originalChildren.set(parent, [...parent.childNodes]);
      }
    }
    // Appending a DocumentFragment consumes its children rather than moving
    // the fragment node. Treat those children as caller-owned inputs too so
    // failure can reconstruct the fragment verbatim.
    if (child.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      for (const nested of [...child.childNodes]) remember(nested);
    }
  };
  for (const child of children) remember(child);

  const rollback = (failure: unknown): never => {
    const errors = [failure];
    // Reconstruct every original parent from right to left. Using the
    // parent's captured child order (not argument/move order) restores
    // reversed siblings and nested inputs exactly.
    for (const [originalParent, children] of originalChildren) {
      let before: Node | null = null;
      for (let index = children.length - 1; index >= 0; index--) {
        const child = children[index];
        if (!child) continue;
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
      if (!next.contains(node)) continue;
      let ancestor = node.parentNode;
      let nestedIncoming = false;
      while (ancestor && ancestor !== next) {
        if (incoming.has(ancestor)) {
          nestedIncoming = true;
          break;
        }
        ancestor = ancestor.parentNode;
      }
      if (!nestedIncoming) node.parentNode?.removeChild(node);
    }
    try {
      dispose(next);
    } catch (error) {
      errors.push(error);
    }
    if (errors.length === 1) throw failure;
    throw new AggregateError(
      errors,
      "Loom DOM child replacement and staging cleanup failed.",
    );
  };

  try {
    for (const child of children) appendChild(next, child);
  } catch (error) {
    rollback(error);
  }

  const outgoing = [...parent.childNodes];
  // Do not stop live bindings until native replacement has succeeded. A
  // hierarchy error can leave the old DOM in place, where those resources
  // must remain live.
  try {
    parent.replaceChildren(next);
  } catch (error) {
    rollback(error);
  }

  const errors: unknown[] = [];
  for (const child of outgoing) {
    try {
      dispose(child);
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) {
    throw new AggregateError(
      errors,
      "Multiple Loom DOM child-replacement operations failed.",
    );
  }
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
  const node = document.createElementNS(SVG_NS, tag);
  if (children !== undefined) {
    if (typeof children === "string") node.textContent = children;
    else appendChild(node, children);
  }
  if (props) applyProps(node, props, false);
  return node;
}

// `options` lets a caller relabel the binding or, for tooling built on loom, mark it `internal` so
// it isn't observed by the inspector (which uses this to bind its own text without self-reporting).
export function text(read: Read<unknown>, options?: EffectOptions): Text {
  const node = document.createTextNode("");
  let previous = "";
  ownResource(
    node,
    (options === undefined ? domBindingEffect : domEffect)(
      () => {
        const next = stringValue(read());
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

/** Bind an attribute to a tracked read; nullish/false removes it. */
export function bindAttr(
  el: Element,
  name: string,
  read: Read<unknown>,
  options?: BindingOptions,
): Stop {
  return applyAttrBinding(el, name, read, options);
}

/** Bind one class token to the truthiness of a tracked read. */
export function bindClass(
  el: Element,
  name: string,
  read: Read<unknown>,
  options?: BindingOptions,
): Stop {
  return installClassBinding(el, { kind: "class", name, read }, options);
}

/** Bind an inline style property to a tracked read. */
export function bindStyle(
  el: StyledElement,
  name: string,
  read: Read<unknown>,
  options?: BindingOptions,
): Stop {
  return installStyleBinding(
    el,
    { kind: "style", name: cssPropName(name), read },
    options,
  );
}

export function list<T>(
  container: Element,
  read: State<readonly T[]> | Read<readonly T[]>,
  options: ListOptions<NoInfer<T>>,
): Stop {
  if (options.signal?.aborted) return () => {};
  const nodes = new Map<LoomKey, Element>();
  const updates = options.update
    ? { update: options.update, items: new Map<LoomKey, T>() }
    : undefined;
  const stop = bind(
    container,
    () => {
      const shouldReorder = options.reorder?.() !== false;
      const items = read();
      reconcileKeyed(
        container,
        null,
        items,
        nodes,
        options.key,
        options.render,
        shouldReorder,
        updates,
      );
    },
    { label: "dom.list" },
  );

  const stopList = (): void => {
    const outgoing = [...nodes.values()];
    nodes.clear();
    updates?.items.clear();
    const errors: unknown[] = [];
    try {
      stop();
    } catch (error) {
      errors.push(error);
    }
    removeNodes(outgoing, errors);
  };
  const life = nodeLifetime(container, options.signal);
  life.add(stopList);
  return life.stop;
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
      return domEffect(
        () => {
          const k = key();
          if (k === currentKey) return;
          const parent = anchor.parentNode;
          if (parent === null) return;
          const next: Node[] = withConstructionRollback(() => {
            const frag = (
              parent.ownerDocument ?? document
            ).createDocumentFragment();
            try {
              untrack(() => appendChild(frag, pick(k)));
              const next = [...frag.childNodes];
              parent.insertBefore(frag, anchor);
              return next;
            } catch (error) {
              removeNodes([...frag.childNodes], [error]);
              throw error;
            }
          });
          const outgoing = mounted.filter((node) => !next.includes(node));
          mounted = next;
          currentKey = k;
          removeNodes(outgoing);
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
      const branch =
        (Object.hasOwn(cases, key) ? cases[key] : undefined) ?? fallback;
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
      const updates = options.update
        ? { update: options.update, items: new Map<LoomKey, T>() }
        : undefined;
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
              updates,
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
  if (options?.signal?.aborted) return () => {};
  const handle = domEffect(fn, "dom.bind", node, options);
  return ownStoppableResource(node, handle, options?.signal);
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
      own(node, value as Stop);
      continue;
    }
    if (
      name === "ontap" ||
      name === "onTap" ||
      name.toLowerCase() === "ondoublepress"
    ) {
      throw new TypeError("Install tap behavior from loom/events.");
    }
    if (name.startsWith("on") && typeof value === "function") {
      const type = eventName(name);
      const listener = (event: Event): void => {
        untrack(() => (value as EventListener)(event));
      };
      node.addEventListener(type, listener);
      own(node, () => node.removeEventListener(type, listener));
      continue;
    }
    if (isFormControlProperty(node, name)) {
      if (typeof value === "function") {
        applyPropertyBinding(node, name, value as Read<unknown>);
      } else {
        setFormControlProperty(node, name, value);
      }
      continue;
    }
    if (value == null || (value === false && !isAriaAttr(name))) continue;
    if (typeof value === "function") {
      applyAttrBinding(node, name, value as Read<unknown>);
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
  // Primitive text is the dominant h()/JSX child. Keep it off the cross-realm node path.
  if (typeof child !== "object") {
    parent.appendChild(document.createTextNode(String(child)));
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
  parent.appendChild(document.createTextNode(String(child)));
}

function isNode(value: object): value is Node {
  const globalNode = (globalThis as { readonly Node?: typeof Node }).Node;
  if (globalNode !== undefined && value instanceof globalNode) return true;
  // `instanceof globalThis.Node` rejects nodes created by an iframe or another Window. Prefer the
  // common same-realm check above; discover the candidate's own realm only on that uncommon miss.
  const candidate = value as {
    readonly defaultView?: Window | null;
    readonly ownerDocument?: Document | null;
  };
  const view = candidate.ownerDocument?.defaultView ?? candidate.defaultView;
  const ownNode = (
    view as (Window & { readonly Node?: typeof Node }) | null | undefined
  )?.Node;
  return ownNode !== undefined && value instanceof ownNode;
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
    return;
  }
  if (!value) return;
  if (typeof value === "string") {
    appendClassName(node, value);
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
  if (!isPlainRecord(value)) return;
  const styleDecl = (node as StyledElement).style;
  for (const name in value) {
    if (!Object.hasOwn(value, name)) continue;
    const styleValue = value[name];
    const property = cssPropName(name);
    if (typeof styleValue === "function") {
      installStyleBinding(node, {
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
    installClassBinding(node, {
      kind: "class",
      name,
      read: value as Read<unknown>,
    });
  } else if (value) {
    node.classList.add(name);
  }
}

function installClassBinding(
  node: Element,
  binding: PropBinding,
  options?: BindingOptions,
): Stop {
  let previous = hasClassName(node, binding.name);
  return bind(
    node,
    () => {
      const next = Boolean(binding.read());
      if (next === previous) return;
      node.classList.toggle(binding.name, next);
      previous = next;
    },
    { label: `dom.class.${binding.name}`, ...options },
  );
}

function applyAttrBinding(
  node: Element,
  name: string,
  read: Read<unknown>,
  options?: BindingOptions,
): Stop {
  return bindReactiveValue(
    node,
    `dom.attr.${name}`,
    () => attrValue(name, read()),
    (next) => setAttrValue(node, name, next),
    undefined,
    options,
  );
}

type FormControlProperty = "checked" | "selected" | "value";
const FORM_CONTROL_UNSET = Symbol("form-control-unset");
type FormControlElement = Element & {
  checked?: boolean;
  selected?: boolean;
  value?: string;
};

function isFormControlProperty(
  node: Element,
  name: string,
): name is FormControlProperty {
  if (name !== "checked" && name !== "selected" && name !== "value")
    return false;
  if (node.namespaceURI !== "http://www.w3.org/1999/xhtml") return false;
  const tag = node.localName;
  if (name === "checked") return tag === "input";
  if (name === "selected") return tag === "option";
  return (
    name === "value" &&
    (tag === "button" ||
      tag === "input" ||
      tag === "option" ||
      tag === "select" ||
      tag === "textarea")
  );
}

function formControlValue(
  name: FormControlProperty,
  value: unknown,
): boolean | string {
  return name === "value"
    ? value == null
      ? ""
      : String(value)
    : Boolean(value);
}

function setFormControlProperty(
  node: Element,
  name: FormControlProperty,
  value: unknown,
): void {
  setAttrValue(node, name, attrValue(name, value));
  const control = node as FormControlElement;
  if (name === "value") {
    const next = formControlValue(name, value) as string;
    // Browsers reject non-empty programmatic values on file inputs. Preserve the declarative
    // attribute without turning h()/a reactive update into a DOMException.
    if (
      next === "" ||
      node.localName !== "input" ||
      node.getAttribute("type")?.toLowerCase() !== "file"
    ) {
      control.value = next;
    }
  } else {
    control[name] = formControlValue(name, value) as boolean;
  }
}

function applyPropertyBinding(
  node: Element,
  name: FormControlProperty,
  read: Read<unknown>,
): void {
  bindReactiveValue(
    node,
    `dom.prop.${name}`,
    () => read(),
    (next) => setFormControlProperty(node, name, next),
    FORM_CONTROL_UNSET,
  );
}

function installStyleBinding(
  node: Element,
  binding: PropBinding,
  options?: BindingOptions,
): Stop {
  const styleDecl = (node as StyledElement).style;
  return bindReactiveValue(
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

// Shared dedup scaffold for the less common attr/property/style paths. Text and class keep
// specialized bodies above so large mounts do not retain two extra wrapper closures per binding.
function bindReactiveValue<T>(
  node: Node,
  label: string,
  read: () => T,
  apply: (value: T) => void,
  initial?: T,
  options?: BindingOptions,
): Stop {
  let previous = initial;
  return bind(
    node,
    () => {
      const next = read();
      if (next === previous) return;
      apply(next);
      previous = next;
    },
    { label, ...options },
  );
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
  const event = name.slice(2).toLowerCase();
  return event === "doubleclick" ? "dblclick" : event;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export { type BindValueOptions, bindValue } from "./bind-value.js";
export { keyedChild } from "./keyed-child.js";
export { type MorphOptions, morph } from "./morph.js";
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

import { effect, type Read, type Stop, untrack } from "../loom.js";

export type Child =
  | Node
  | Read<unknown>
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly Child[];

export interface ClassBinding {
  readonly kind: "class";
  readonly name: string;
  readonly read: Read<unknown>;
}

export interface AttrBinding {
  readonly kind: "attr";
  readonly name: string;
  readonly read: Read<unknown>;
}

export interface StyleBinding {
  readonly kind: "style";
  readonly name: string;
  readonly read: Read<unknown>;
}

type ClassProp =
  | string
  | ClassBinding
  | CssToken
  | ClassMap
  | null
  | undefined
  | readonly ClassProp[];
type ClassMap = Record<string, unknown>;
// The shape of a css() token (loom/css), accepted structurally so the DOM layer needn't import the
// styling addon. Recognised at runtime by its brand (see isCssClass).
type CssToken = { readonly className: string; readonly cssText: string };
type StyleMap = Record<string, unknown>;
type StyleProp =
  | string
  | StyleMap
  | StyleBinding
  | null
  | undefined
  | readonly StyleProp[];

export type Props = Record<string, unknown> & {
  class?: ClassProp;
  className?: ClassProp;
  key?: string | number;
  style?: StyleProp;
};

export interface ListOptions<T> {
  key(item: T): string | number;
  render(item: T, key: string): Element;
  animate?: Read<boolean>;
  reorder?: Read<boolean>;
}

type OwnedEffect = Stop | Stop[];

const DOM_NAMESPACE = "dom";
const ownedEffects = new WeakMap<Node, OwnedEffect>();

const SVG_NS = "http://www.w3.org/2000/svg";
// SVG-only tag names — elements that must be created in the SVG namespace. Tags shared with
// HTML (a, title, script, style) are intentionally omitted so they keep rendering as HTML;
// the descendants of an <svg> are created namespaced because each SVG tag is listed here.
const SVG_TAGS = new Set<string>([
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
]);

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

export function text(read: Read<unknown>): Text {
  const node = document.createTextNode("");
  let previous = "";
  const stop = untrack(() =>
    effect(
      () => {
        const next = stringValue(read());
        if (next === previous) return;
        previous = next;
        node.data = next;
      },
      { label: "dom.text", namespace: DOM_NAMESPACE, target: node },
    ),
  );
  own(node, stop);
  return node;
}

export function attr(name: string, read: Read<unknown>): AttrBinding {
  return { kind: "attr", name, read };
}

export function classed(name: string, read: Read<unknown>): ClassBinding {
  return { kind: "class", name, read };
}

export function style(name: string, read: Read<unknown>): StyleBinding {
  return { kind: "style", name, read };
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
        const items = read();
        const shouldReorder = options.reorder?.() !== false;
        const animate = shouldReorder && options.animate?.() === true;
        const before = animate ? snapshot(nodes) : undefined;
        const seen = new Set<string>();
        let cursor = shouldReorder ? container.firstChild : undefined;

        for (const item of items) {
          const itemKey = String(options.key(item));
          if (seen.has(itemKey))
            throw new Error(`Duplicate Loom key "${itemKey}".`);
          seen.add(itemKey);

          let node = nodes.get(itemKey);
          if (!node) {
            node = options.render(item, itemKey);
            node.setAttribute("data-loom-key", itemKey);
            nodes.set(itemKey, node);
          }

          if (shouldReorder) {
            if (node !== cursor) container.insertBefore(node, cursor ?? null);
            cursor = node.nextSibling;
          } else if (!node.parentNode) {
            container.appendChild(node);
          }
        }

        for (const [itemKey, node] of nodes) {
          if (seen.has(itemKey)) continue;
          remove(node);
          nodes.delete(itemKey);
        }

        if (before) animateMoved(before, nodes);
      },
      { label: "dom.list", namespace: DOM_NAMESPACE, target: container },
    ),
  );

  const stopList = (): void => {
    stop();
    for (const node of nodes.values()) remove(node);
    nodes.clear();
  };
  own(container, stopList);
  return stopList;
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
export function tap(
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

function own(node: Node, stop: Stop): void {
  const owned = ownedEffects.get(node);
  if (!owned) ownedEffects.set(node, stop);
  else if (Array.isArray(owned)) owned.push(stop);
  else ownedEffects.set(node, [owned, stop]);
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
    if (!Object.hasOwn(props, name)) continue;
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
    if (isAttrBinding(value)) {
      bindAttr(node, value);
      continue;
    }
    if (name === "ontap" && typeof value === "function") {
      tap(node, value as (event: PointerEvent) => void);
      continue;
    }
    if (name.startsWith("on") && typeof value === "function") {
      node.addEventListener(eventName(name), value as EventListener);
      continue;
    }
    if (typeof value === "function") {
      bindAttr(node, attr(name, value as Read<unknown>));
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
  if (child == null || child === true || child === false) return;
  if (typeof child === "function") {
    parent.appendChild(text(child as Read<unknown>));
    return;
  }
  parent.appendChild(
    child instanceof Node ? child : document.createTextNode(String(child)),
  );
}

function applyClassProp(node: Element, value: ClassProp): void {
  if (Array.isArray(value)) {
    for (const item of value) applyClassProp(node, item);
    return;
  }
  if (!value) return;
  if (isCssClass(value)) {
    mountCss(value);
    appendClassName(node, value.className);
    return;
  }
  if (typeof value === "string") {
    appendClassName(node, value);
    return;
  }
  if (isClassBinding(value)) {
    bindClass(node, value);
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

// css() tokens are recognised by their brand (Symbol.for, shared by value) rather than by importing
// loom/css — so the DOM layer stays independent of the styling addon.
const CSS_CLASS = Symbol.for("loom.css");
function isCssClass(
  value: unknown,
): value is { readonly className: string; readonly cssText: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<symbol, unknown>)[CSS_CLASS] === true
  );
}

// Inject a css() token's rule once, into one shared sheet under `@layer loom` so component styles
// compose with — and lose to — the app's unlayered CSS (no specificity fights). Deduped by class
// name; a no-op without a document (SSR collects via loom/html instead). Prefers a constructable
// stylesheet (O(1) insertRule, no DOM node); the first mount probes it and, if the engine can't
// parse @layer/nesting in insertRule (e.g. happy-dom), permanently falls back to a <style> element
// whose textContent the browser parses with its full CSS engine.
let cssMode: "sheet" | "style" | undefined;
let cssSheet: CSSStyleSheet | undefined;
let cssStyleEl: HTMLStyleElement | undefined;
const mountedCss = new Set<string>();
function mountCss(token: { className: string; cssText: string }): void {
  if (mountedCss.has(token.className) || typeof document === "undefined") return;
  mountedCss.add(token.className);
  const rule = `@layer loom{${token.cssText}}`;

  if (cssMode === undefined) {
    if (typeof CSSStyleSheet === "function") {
      try {
        const sheet = new CSSStyleSheet();
        document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
        sheet.insertRule(rule, 0); // probe: real engines parse @layer + nesting here
        cssSheet = sheet;
        cssMode = "sheet";
        return;
      } catch {
        // engine rejected the modern syntax (or constructable sheets) — drop to a <style> element
      }
    }
    cssStyleEl = document.createElement("style");
    document.head.append(cssStyleEl);
    cssMode = "style";
  }

  if (cssMode === "sheet" && cssSheet)
    cssSheet.insertRule(rule, cssSheet.cssRules.length);
  else if (cssStyleEl) cssStyleEl.textContent += rule;
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
    bindStyle(node, value);
    return;
  }
  if (!isPlainRecord(value)) return;
  const styleDecl = (node as HTMLElement).style;
  for (const name in value) {
    if (!Object.hasOwn(value, name)) continue;
    const styleValue = value[name];
    const property = styleName(name);
    if (typeof styleValue === "function") {
      bindStyle(node, style(property, styleValue as Read<unknown>));
    } else if (styleValue != null) {
      styleDecl.setProperty(property, String(styleValue));
    }
  }
}

function applyClassMapValue(node: Element, name: string, value: unknown): void {
  if (typeof value === "function") {
    bindClass(node, classed(name, value as Read<unknown>));
  } else if (value) {
    node.classList.add(name);
  }
}

function bindClass(node: Element, binding: ClassBinding): void {
  let previous = hasClassName(node, binding.name);
  const stop = untrack(() =>
    effect(
      () => {
        const next = Boolean(binding.read());
        if (next === previous) return;
        previous = next;
        node.classList.toggle(binding.name, next);
      },
      {
        label: `dom.class.${binding.name}`,
        namespace: DOM_NAMESPACE,
        target: node,
      },
    ),
  );
  own(node, stop);
}

function bindAttr(node: Element, binding: AttrBinding): void {
  let previous: string | null | undefined;
  const stop = untrack(() =>
    effect(
      () => {
        const next = attrValue(binding.name, binding.read());
        if (next === previous) return;
        previous = next;
        setAttrValue(node, binding.name, next);
      },
      {
        label: `dom.attr.${binding.name}`,
        namespace: DOM_NAMESPACE,
        target: node,
      },
    ),
  );
  own(node, stop);
}

function bindStyle(node: Element, binding: StyleBinding): void {
  let previous: string | null | undefined;
  const styleDecl = (node as HTMLElement).style;
  const stop = untrack(() =>
    effect(
      () => {
        const next = attrValue(binding.name, binding.read());
        if (next === previous) return;
        previous = next;
        if (next === null) styleDecl.removeProperty(binding.name);
        else styleDecl.setProperty(binding.name, next);
      },
      {
        label: `dom.style.${binding.name}`,
        namespace: DOM_NAMESPACE,
        target: node,
      },
    ),
  );
  own(node, stop);
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

function styleName(name: string): string {
  return name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
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

function snapshot(nodes: Map<string, Element>): Map<Element, DOMRectReadOnly> {
  const rects = new Map<Element, DOMRectReadOnly>();
  for (const node of nodes.values()) {
    if (node.isConnected) rects.set(node, node.getBoundingClientRect());
  }
  return rects;
}

function animateMoved(
  before: Map<Element, DOMRectReadOnly>,
  nodes: Map<string, Element>,
): void {
  for (const node of nodes.values()) {
    const first = before.get(node);
    if (!first || typeof node.animate !== "function") continue;
    const last = node.getBoundingClientRect();
    const dx = first.left - last.left;
    const dy = first.top - last.top;
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) continue;
    node.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }
}

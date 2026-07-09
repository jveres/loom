import type { Child, ElementProps, SvgTagName } from "./index.js";

type Component = (props: never) => Child;
type EventHandler<TElement extends Element, TEvent extends Event> = (
  event: TEvent & { readonly currentTarget: TElement },
) => void;
// DOM-native event names (lowercase, as the DOM uses them) -> their event types. Loom is a thin
// layer over the DOM, so it follows the platform here rather than React's renamed camelCase props.
// `tap` is Loom's one synthetic event: a robust pointerdown+pointerup tap (see `onTap()` in ./index.ts).
interface DomEventMap {
  blur: FocusEvent;
  change: Event;
  click: MouseEvent;
  contextmenu: MouseEvent;
  dblclick: MouseEvent;
  drag: DragEvent;
  dragend: DragEvent;
  dragenter: DragEvent;
  dragleave: DragEvent;
  dragover: DragEvent;
  dragstart: DragEvent;
  drop: DragEvent;
  focus: FocusEvent;
  focusin: FocusEvent;
  focusout: FocusEvent;
  input: InputEvent;
  keydown: KeyboardEvent;
  keypress: KeyboardEvent;
  keyup: KeyboardEvent;
  mousedown: MouseEvent;
  mouseenter: MouseEvent;
  mouseleave: MouseEvent;
  mousemove: MouseEvent;
  mouseout: MouseEvent;
  mouseover: MouseEvent;
  mouseup: MouseEvent;
  pointercancel: PointerEvent;
  pointerdown: PointerEvent;
  pointerenter: PointerEvent;
  pointerleave: PointerEvent;
  pointermove: PointerEvent;
  pointerup: PointerEvent;
  scroll: Event;
  submit: SubmitEvent;
  touchcancel: TouchEvent;
  touchend: TouchEvent;
  touchmove: TouchEvent;
  touchstart: TouchEvent;
  wheel: WheelEvent;
}
type EventProps<TElement extends Element> = {
  [K in keyof DomEventMap as `on${K & string}`]?: EventHandler<
    TElement,
    DomEventMap[K]
  >;
} & {
  [K in keyof CamelDomEventNames as `on${K & string}`]?: EventHandler<
    TElement,
    DomEventMap[CamelDomEventNames[K]]
  >;
};

// Runtime event names are case-insensitive after the `on` prefix. These aliases retain the DOM
// event's precise type while supporting conventional camelCase JSX spelling.
interface CamelDomEventNames {
  Blur: "blur";
  Change: "change";
  Click: "click";
  ContextMenu: "contextmenu";
  DblClick: "dblclick";
  DoubleClick: "dblclick";
  Drag: "drag";
  DragEnd: "dragend";
  DragEnter: "dragenter";
  DragLeave: "dragleave";
  DragOver: "dragover";
  DragStart: "dragstart";
  Drop: "drop";
  Focus: "focus";
  FocusIn: "focusin";
  FocusOut: "focusout";
  Input: "input";
  KeyDown: "keydown";
  KeyPress: "keypress";
  KeyUp: "keyup";
  MouseDown: "mousedown";
  MouseEnter: "mouseenter";
  MouseLeave: "mouseleave";
  MouseMove: "mousemove";
  MouseOut: "mouseout";
  MouseOver: "mouseover";
  MouseUp: "mouseup";
  PointerCancel: "pointercancel";
  PointerDown: "pointerdown";
  PointerEnter: "pointerenter";
  PointerLeave: "pointerleave";
  PointerMove: "pointermove";
  PointerUp: "pointerup";
  Scroll: "scroll";
  Submit: "submit";
  TouchCancel: "touchcancel";
  TouchEnd: "touchend";
  TouchMove: "touchmove";
  TouchStart: "touchstart";
  Wheel: "wheel";
}
// What every element's props share, regardless of HTML vs SVG (ElementProps already carries key/class/
// style). ElementProps and SvgProps differ only in `htmlFor`, so both build on this to avoid drift.
type SharedProps<TElement extends Element> = ElementProps &
  EventProps<TElement> & {
    children?: Child;
    // The Loom lifecycle pair; neither is a DOM event. onMount runs once on a microtask after
    // insertion (measurable, not yet painted); onUnmount is the cleanup run when the node is torn
    // down the Loom way (remove()/dispose()). Both spellings are wired.
    onMount?: (node: Node) => void;
    onmount?: (node: Node) => void;
    onUnmount?: () => void;
    onunmount?: () => void;
    // Robust tap (press+release within slop; a drag or scroll does not trigger it).
    onTap?: (event: PointerEvent) => void;
    ontap?: (event: PointerEvent) => void;
    [name: `aria-${string}`]: unknown;
    [name: `data-${string}`]: unknown;
  };
type HtmlProps<TElement extends HTMLElement> = SharedProps<TElement> & {
  htmlFor?: string;
};
// SVG attributes are largely hyphenated (stroke-width) or camelCase (viewBox); the
// `Record<string, unknown>` index in ElementProps already admits both, so SVG props only need the
// shared structural fields plus SVG-typed events.
type SvgProps<TElement extends SVGElement> = SharedProps<TElement>;

type HtmlIntrinsics = {
  [K in keyof HTMLElementTagNameMap]: HtmlProps<HTMLElementTagNameMap[K]>;
};
type SvgIntrinsics = {
  [K in SvgTagName]: SvgProps<SVGElementTagNameMap[K]>;
};

export namespace JSX {
  // TypeScript exposes one global result type for every JSX expression, so it cannot preserve the
  // intrinsic overload's per-tag return type. Direct jsx()/h()/svgElement() calls remain precise.
  export type Element = HTMLElement;
  export type ElementType = string | Component;

  export interface ElementChildrenAttribute {
    children: unknown;
  }

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  // Derived, not hand-listed. HTML keys come from the platform's own
  // HTMLElementTagNameMap — every standard tag, each typed with its precise
  // element, and no list to drift against loom/html (whose runtime accepts any
  // tag). SVG keys derive from the runtime's SVG_TAG_LIST (the same value the
  // namespace decision uses), so the types can only offer SVG tags the runtime
  // actually creates in the SVG namespace.
  export interface IntrinsicElements extends HtmlIntrinsics, SvgIntrinsics {}
}

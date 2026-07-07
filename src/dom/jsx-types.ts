import type { Child, Props, SvgTagName } from "./index.js";

type Component = (props: never) => Child;
type EventHandler<TElement extends Element, TEvent extends Event> = (
  event: TEvent & { readonly currentTarget: TElement },
) => void;
// DOM-native event names (lowercase, as the DOM uses them) -> their event types. Loom is a thin
// layer over the DOM, so it follows the platform here rather than React's renamed camelCase props.
// `tap` is Loom's one synthetic event: a robust pointerdown+pointerup tap (see `tap()` in ./index.ts).
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
  tap: PointerEvent;
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
};
// The fields every element's props share, regardless of HTML vs SVG (Props already carries key/class/
// style). ElementProps and SvgProps differ only in `htmlFor`, so both build on this to avoid drift.
type SharedProps<TElement extends Element> = Props &
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
type ElementProps<TElement extends HTMLElement> = SharedProps<TElement> & {
  htmlFor?: string;
};
// SVG attributes are largely hyphenated (stroke-width) or camelCase (viewBox); the
// `Record<string, unknown>` index in Props already admits both, so SVG props only need the
// shared structural fields plus SVG-typed events.
type SvgProps<TElement extends SVGElement> = SharedProps<TElement>;

type HtmlIntrinsics = {
  [K in keyof HTMLElementTagNameMap]: ElementProps<HTMLElementTagNameMap[K]>;
};
type SvgIntrinsics = {
  [K in SvgTagName]: SvgProps<SVGElementTagNameMap[K]>;
};

export namespace JSX {
  // Deliberate pragmatism: every JSX expression types as HTMLElement, including SVG (`<svg>`,
  // `<circle>`) and components (which may return text/null/arrays). A truthful `HTMLElement |
  // SVGElement | Child` union would type as the common base `Element` at every `return <jsx>` and so
  // force narrowing casts through every builder, the panel wiring, and each `.style`/`.offsetHeight`
  // access — trading a rare, localized SVG cast for pervasive ones. Consumers of SVG-specific APIs
  // (rare here) cast at the point of use instead; `jsx()`'s overloads still return precise element
  // types when called directly. Same tradeoff React/Preact make with an opaque JSX.Element.
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

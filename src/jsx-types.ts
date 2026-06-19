import type { Child, Props } from "./dom.js";

type Component = (props: never) => Child;
type EventHandler<TElement extends Element, TEvent extends Event> = (
  event: TEvent & { readonly currentTarget: TElement },
) => void;
type EventProps<TElement extends Element> = {
  onBlur?: EventHandler<TElement, FocusEvent>;
  onChange?: EventHandler<TElement, Event>;
  onClick?: EventHandler<TElement, MouseEvent>;
  onDblClick?: EventHandler<TElement, MouseEvent>;
  onFocus?: EventHandler<TElement, FocusEvent>;
  onInput?: EventHandler<TElement, InputEvent>;
  onKeyDown?: EventHandler<TElement, KeyboardEvent>;
  onKeyUp?: EventHandler<TElement, KeyboardEvent>;
  onMouseDown?: EventHandler<TElement, MouseEvent>;
  onMouseUp?: EventHandler<TElement, MouseEvent>;
  onPointerDown?: EventHandler<TElement, PointerEvent>;
  onPointerMove?: EventHandler<TElement, PointerEvent>;
  onPointerUp?: EventHandler<TElement, PointerEvent>;
  onSubmit?: EventHandler<TElement, SubmitEvent>;
};
type ElementProps<TElement extends HTMLElement> = Props &
  EventProps<TElement> & {
    children?: Child;
    htmlFor?: string;
    key?: string | number;
    [name: `aria-${string}`]: unknown;
    [name: `data-${string}`]: unknown;
  };
// SVG attributes are largely hyphenated (stroke-width) or camelCase (viewBox); the
// `Record<string, unknown>` index in Props already admits both, so SVG props only need the
// shared structural fields plus SVG-typed events.
type SvgProps<TElement extends SVGElement> = Props &
  EventProps<TElement> & {
    children?: Child;
    key?: string | number;
    [name: `aria-${string}`]: unknown;
    [name: `data-${string}`]: unknown;
  };

export namespace JSX {
  export type Element = HTMLElement;
  export type ElementType = string | Component;

  export interface ElementChildrenAttribute {
    children: unknown;
  }

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  export interface IntrinsicElements {
    // HTML
    a: ElementProps<HTMLAnchorElement>;
    article: ElementProps<HTMLElement>;
    aside: ElementProps<HTMLElement>;
    b: ElementProps<HTMLElement>;
    br: ElementProps<HTMLBRElement>;
    button: ElementProps<HTMLButtonElement>;
    code: ElementProps<HTMLElement>;
    div: ElementProps<HTMLDivElement>;
    em: ElementProps<HTMLElement>;
    footer: ElementProps<HTMLElement>;
    header: ElementProps<HTMLElement>;
    h1: ElementProps<HTMLHeadingElement>;
    h2: ElementProps<HTMLHeadingElement>;
    h3: ElementProps<HTMLHeadingElement>;
    h4: ElementProps<HTMLHeadingElement>;
    h5: ElementProps<HTMLHeadingElement>;
    h6: ElementProps<HTMLHeadingElement>;
    hr: ElementProps<HTMLHRElement>;
    i: ElementProps<HTMLElement>;
    img: ElementProps<HTMLImageElement>;
    input: ElementProps<HTMLInputElement>;
    label: ElementProps<HTMLLabelElement>;
    li: ElementProps<HTMLLIElement>;
    main: ElementProps<HTMLElement>;
    nav: ElementProps<HTMLElement>;
    ol: ElementProps<HTMLOListElement>;
    option: ElementProps<HTMLOptionElement>;
    p: ElementProps<HTMLParagraphElement>;
    pre: ElementProps<HTMLPreElement>;
    section: ElementProps<HTMLElement>;
    select: ElementProps<HTMLSelectElement>;
    small: ElementProps<HTMLElement>;
    span: ElementProps<HTMLSpanElement>;
    strong: ElementProps<HTMLElement>;
    table: ElementProps<HTMLTableElement>;
    tbody: ElementProps<HTMLTableSectionElement>;
    td: ElementProps<HTMLTableCellElement>;
    textarea: ElementProps<HTMLTextAreaElement>;
    th: ElementProps<HTMLTableCellElement>;
    thead: ElementProps<HTMLTableSectionElement>;
    tr: ElementProps<HTMLTableRowElement>;
    u: ElementProps<HTMLElement>;
    ul: ElementProps<HTMLUListElement>;

    // SVG
    circle: SvgProps<SVGCircleElement>;
    clipPath: SvgProps<SVGClipPathElement>;
    defs: SvgProps<SVGDefsElement>;
    ellipse: SvgProps<SVGEllipseElement>;
    foreignObject: SvgProps<SVGForeignObjectElement>;
    g: SvgProps<SVGGElement>;
    image: SvgProps<SVGImageElement>;
    line: SvgProps<SVGLineElement>;
    linearGradient: SvgProps<SVGLinearGradientElement>;
    marker: SvgProps<SVGMarkerElement>;
    mask: SvgProps<SVGMaskElement>;
    path: SvgProps<SVGPathElement>;
    pattern: SvgProps<SVGPatternElement>;
    polygon: SvgProps<SVGPolygonElement>;
    polyline: SvgProps<SVGPolylineElement>;
    radialGradient: SvgProps<SVGRadialGradientElement>;
    rect: SvgProps<SVGRectElement>;
    stop: SvgProps<SVGStopElement>;
    svg: SvgProps<SVGSVGElement>;
    symbol: SvgProps<SVGSymbolElement>;
    text: SvgProps<SVGTextElement>;
    tspan: SvgProps<SVGTSpanElement>;
    use: SvgProps<SVGUseElement>;
  }
}

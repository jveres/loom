import type { Child, Props } from "./index.js";
type Component = (props: never) => Child;
type EventHandler<TElement extends Element, TEvent extends Event> = (event: TEvent & {
    readonly currentTarget: TElement;
}) => void;
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
    [K in keyof DomEventMap as `on${K & string}`]?: EventHandler<TElement, DomEventMap[K]>;
};
type SharedProps<TElement extends Element> = Props & EventProps<TElement> & {
    children?: Child;
    onunmount?: () => void;
    [name: `aria-${string}`]: unknown;
    [name: `data-${string}`]: unknown;
};
type ElementProps<TElement extends HTMLElement> = SharedProps<TElement> & {
    htmlFor?: string;
};
type SvgProps<TElement extends SVGElement> = SharedProps<TElement>;
export declare namespace JSX {
    type Element = HTMLElement;
    type ElementType = string | Component;
    interface ElementChildrenAttribute {
        children: unknown;
    }
    interface IntrinsicAttributes {
        key?: string | number;
    }
    interface IntrinsicElements {
        a: ElementProps<HTMLAnchorElement>;
        article: ElementProps<HTMLElement>;
        aside: ElementProps<HTMLElement>;
        b: ElementProps<HTMLElement>;
        blockquote: ElementProps<HTMLQuoteElement>;
        br: ElementProps<HTMLBRElement>;
        button: ElementProps<HTMLButtonElement>;
        code: ElementProps<HTMLElement>;
        dd: ElementProps<HTMLElement>;
        div: ElementProps<HTMLDivElement>;
        dl: ElementProps<HTMLDListElement>;
        dt: ElementProps<HTMLElement>;
        em: ElementProps<HTMLElement>;
        figcaption: ElementProps<HTMLElement>;
        figure: ElementProps<HTMLElement>;
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
        iframe: ElementProps<HTMLIFrameElement>;
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
        video: ElementProps<HTMLVideoElement>;
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
export {};

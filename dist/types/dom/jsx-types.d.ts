import type { Child, ElementProps, SvgTagName } from "./index.js";
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
type SharedProps<TElement extends Element> = ElementProps & EventProps<TElement> & {
    children?: Child;
    onMount?: (node: Node) => void;
    onmount?: (node: Node) => void;
    onUnmount?: () => void;
    onunmount?: () => void;
    onTap?: (event: PointerEvent) => void;
    ontap?: (event: PointerEvent) => void;
    [name: `aria-${string}`]: unknown;
    [name: `data-${string}`]: unknown;
};
type HtmlProps<TElement extends HTMLElement> = SharedProps<TElement> & {
    htmlFor?: string;
};
type SvgProps<TElement extends SVGElement> = SharedProps<TElement>;
type HtmlIntrinsics = {
    [K in keyof HTMLElementTagNameMap]: HtmlProps<HTMLElementTagNameMap[K]>;
};
type SvgIntrinsics = {
    [K in SvgTagName]: SvgProps<SVGElementTagNameMap[K]>;
};
export declare namespace JSX {
    type Element = HTMLElement;
    type ElementType = string | Component;
    interface ElementChildrenAttribute {
        children: unknown;
    }
    interface IntrinsicAttributes {
        key?: string | number;
    }
    interface IntrinsicElements extends HtmlIntrinsics, SvgIntrinsics {
    }
}
export {};

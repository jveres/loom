export type RevealAxis = "x" | "y";
export interface ScrollOptions {
    readonly axis?: RevealAxis;
    /** Clearance in px kept between el and the box's edge. */
    readonly margin?: number;
    /** "smooth" scrolls with the browser's animation; default instant. */
    readonly behavior?: ScrollBehavior;
}
export interface RevealOptions extends ScrollOptions {
    readonly scroller?: HTMLElement | string;
    readonly align?: "nearest" | "center";
    readonly ifHidden?: boolean;
}
export declare function scrollParent(el: Element, axis?: RevealAxis): HTMLElement | null;
export declare function nearestScroller(el: Element, axis?: RevealAxis): HTMLElement | null;
export declare function scrollNearest(box: HTMLElement, el: Element, options?: ScrollOptions): void;
export declare function scrollCentered(box: HTMLElement, el: Element, options?: ScrollOptions): void;
export declare function reveal(el: Element, options?: RevealOptions): boolean;

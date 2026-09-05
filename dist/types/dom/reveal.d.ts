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
export interface FindScrollerOptions {
    readonly axis?: RevealAxis;
    readonly requireOverflow?: boolean;
}
export declare function findScroller(el: Element, options?: FindScrollerOptions): HTMLElement | null;
export declare function reveal(el: Element, options?: RevealOptions): boolean;

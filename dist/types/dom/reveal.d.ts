export interface RevealOptions {
    readonly scroller?: HTMLElement | string;
    readonly align?: "nearest" | "center";
    readonly ifHidden?: boolean;
}
export declare function scrollParent(el: Element): HTMLElement | null;
export declare function nearestScroller(el: Element): HTMLElement | null;
export declare function scrollNearest(box: HTMLElement, el: Element): void;
export declare function scrollCentered(box: HTMLElement, el: Element): void;
export declare function reveal(el: Element, options?: RevealOptions): boolean;

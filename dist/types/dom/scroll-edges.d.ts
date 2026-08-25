import { type Read } from "../loom.js";
export interface ScrollEdges {
    readonly start: boolean;
    readonly end: boolean;
}
export interface ScrollEdgesOptions {
    /** "y" (default) or "x". */
    readonly axis?: "x" | "y";
    /** Slack in px before an edge counts as scrolled (default 4). */
    readonly epsilon?: number;
}
export declare function scrollEdges(el: Element, options?: ScrollEdgesOptions): Read<ScrollEdges>;

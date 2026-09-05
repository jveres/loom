import type { Stop } from "../loom.js";
export interface HeightFoldOptions {
    readonly signal?: AbortSignal;
    readonly onStart?: (open: boolean) => void;
    readonly onSettle?: (open: boolean) => void;
}
export interface HeightFold {
    readonly set: (open: boolean) => void;
    readonly stop: Stop;
}
/** Animate height using the element's CSS transition; remeasure on every expansion. */
export declare function heightFold(el: HTMLElement, options?: HeightFoldOptions): HeightFold;

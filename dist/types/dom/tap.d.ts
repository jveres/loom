import type { Stop } from "../loom.js";
export interface TapOptions {
    readonly signal?: AbortSignal;
    /** Maximum pointer travel in CSS pixels. Default 10. */
    readonly slop?: number;
    /** Recent-tap interval in milliseconds. Default 600. */
    readonly recentMs?: number;
}
export interface TapController {
    readonly stop: Stop;
    readonly recent: () => boolean;
}
export interface DoubleTapOptions extends TapOptions {
    /** Maximum interval between taps in milliseconds. Default 350. */
    readonly withinMs?: number;
}
export declare function onTap(node: Element, handler: (event: PointerEvent) => void, options?: TapOptions): TapController;
export declare function onDoubleTap(node: Element, handler: (event: PointerEvent) => void, options?: DoubleTapOptions): Stop;

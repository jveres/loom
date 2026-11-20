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
export interface PressOptions {
    readonly signal?: AbortSignal;
    /** Maximum pointer travel in CSS pixels. Default 10. */
    readonly slop?: number;
    /** Window in milliseconds to suppress the tap's follow-up click. Default 600. */
    readonly suppressMs?: number;
}
/** Runs `handler` on a pointer tap (`pointerup` within `slop`) or a native
 *  `click` (keyboard activation, programmatic `.click()`, or an unconsumed
 *  pointer click). When `handler` handles a pointer tap (returns anything
 *  other than `false`), its follow-up synthetic `click` is suppressed so
 *  overlays or controls that unmount on tap do not click or focus whatever
 *  sits underneath. */
export declare function onPress(node: Element, handler: (event: PointerEvent | MouseEvent) => unknown, options?: PressOptions): Stop;
export declare function onTap(node: Element, handler: (event: PointerEvent) => void, options?: TapOptions): TapController;
export declare function onDoubleTap(node: Element, handler: (event: PointerEvent) => void, options?: DoubleTapOptions): Stop;

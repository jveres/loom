import type { Stop } from "../loom.js";
export type SizeCallback = (entry: ResizeObserverEntry) => void;
export interface ObserveSizeOptions extends ResizeObserverOptions {
    readonly signal?: AbortSignal;
}
/** @internal Connection-owned observation, independent of node disposal. */
export declare function connectSize(el: Element, callback: SizeCallback, options?: ResizeObserverOptions): Stop;
export declare function observeSize(el: Element, callback: SizeCallback, options?: ObserveSizeOptions): Stop;

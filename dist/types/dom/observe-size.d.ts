import type { Stop } from "../loom.js";
export type SizeCallback = (entry: ResizeObserverEntry) => void;
export interface ObserveSizeOptions extends ResizeObserverOptions {
    readonly signal?: AbortSignal;
}
export declare function observeSize(el: Element, callback: SizeCallback, options?: ObserveSizeOptions): Stop;

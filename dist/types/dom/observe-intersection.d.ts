import type { Stop } from "../loom.js";
export type IntersectionCallback = (entry: IntersectionObserverEntry) => void;
export interface ObserveIntersectionOptions {
    readonly signal?: AbortSignal;
    readonly root?: Element | Document | null;
    readonly rootMargin?: string;
    readonly threshold?: number | readonly number[];
}
export declare function observeIntersection(el: Element, cb: IntersectionCallback, options?: ObserveIntersectionOptions): Stop;

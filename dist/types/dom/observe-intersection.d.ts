import type { Stop } from "../loom.js";
export type IntersectionCallback = (entry: IntersectionObserverEntry) => void;
export interface IntersectionOptions {
    readonly root?: Element | Document | null;
    readonly rootMargin?: string;
    readonly threshold?: number | readonly number[];
}
export declare function observeIntersection(el: Element, cb: IntersectionCallback, options?: IntersectionOptions): Stop;

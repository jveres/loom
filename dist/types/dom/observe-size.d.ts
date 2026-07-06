import type { Stop } from "../loom.js";
export type SizeCallback = (entry: ResizeObserverEntry) => void;
export declare function observeSize(el: Element, cb: SizeCallback): Stop;

import type { State, Stop } from "../loom.js";
export interface ScrollMemory {
    readonly restore: (key: string) => void;
    readonly stop: Stop;
}
export interface ScrollMemoryOptions {
    readonly axis?: "x" | "y";
    readonly signal?: AbortSignal;
}
/** Remember positions for one host; the latest restore wins across pending frames. */
export declare function scrollMemory(host: HTMLElement, cellFor: (key: string) => State<number>, options?: ScrollMemoryOptions): ScrollMemory;

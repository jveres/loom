import { type State } from "../loom.js";
export interface ScrollMemory {
    /** Stamp `key` and queue its position restore (after the caller's
     *  synchronous content swap). */
    restore(key: string): void;
    /** Detach early (the host's teardown does the same). */
    stop(): void;
}
export declare function scrollMemory(host: HTMLElement, cellFor: (key: string) => State<number>): ScrollMemory;

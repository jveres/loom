import type { Stop } from "../loom.js";
interface FrameClock {
    requestAnimationFrame?: (fn: () => void) => number;
    cancelAnimationFrame?: (id: number) => void;
}
export interface FrameRequest {
    (): void;
    /** Cancel a pending run and refuse future requests. */
    stop: Stop;
}
export declare function frameCoalesced(fn: () => void, options?: {
    window?: FrameClock;
    owner?: Node;
}): FrameRequest;
export {};

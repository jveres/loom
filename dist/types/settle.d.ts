import { type NodeOptions, type Read, type State, type Stop } from "./loom.js";
export interface SettleOptions<T> extends NodeOptions {
    /** Semantic equality for derived values. Defaults to `===`, matching `watch`. */
    readonly equals?: (value: T, previous: T) => boolean;
}
/** Controls one quiet-period watcher without promoting canceled values to its baseline. */
export interface Settlement {
    /** Permanently stop observing and discard any pending delivery. */
    readonly stop: Stop;
    /** Discard the pending delivery while continuing to observe. */
    readonly cancel: () => void;
    /** Deliver a pending value synchronously; a no-op while its scope is paused. */
    readonly flush: () => void;
}
/**
 * Observe a derived value synchronously, but deliver its changes only after `ms` without a
 * semantically distinct value. The initial evaluation is silent. A burst reports the latest value
 * and the last delivered value; returning to that delivered baseline cancels the burst.
 */
export declare function settle<T>(read: State<T>, onSettled: (value: T, previous: T) => void, ms: number, options?: SettleOptions<T>): Settlement;
export declare function settle<T>(read: Read<T>, onSettled: (value: T, previous: T) => void, ms: number, options?: SettleOptions<T>): Settlement;

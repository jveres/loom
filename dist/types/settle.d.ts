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
/** A settled derived value: a reactive Read that lags its source by the
 *  quiet period, plus the settlement's controls. */
export interface SettledState<T> extends Settlement {
    (): T;
}
/**
 * Derive a value that SETTLES: the returned read serves the initial
 * evaluation immediately, then follows the source only after `ms` without a
 * semantically distinct value. `flush()` SYNCHRONIZES the read with the
 * current source evaluation now (the host's "apply immediately" override) —
 * a stronger contract than Settlement.flush: it also serves a source write
 * whose settlement delivery is still deferred (made inside a batch or
 * another watcher, where nothing is pending yet). It honors everything else
 * the settlement honors: a no-op after stop, while the owning scope is
 * paused, and for a value the `equals` option judges unchanged. `cancel()`
 * discards a pending delivery; reads track reactively like any state. The
 * source is evaluated twice at construction (the seed and the settlement's
 * silent baseline).
 */
export declare function settled<T>(read: State<T>, ms: number, options?: SettleOptions<T>): SettledState<T>;
export declare function settled<T>(read: Read<T>, ms: number, options?: SettleOptions<T>): SettledState<T>;

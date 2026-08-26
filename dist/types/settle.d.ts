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
/** A quiet-period TASK: `run` once after `ms` without another `kick`.
 *  The revision-counter-feeding-settle ceremony as one object — a
 *  dirty compare, a history cache refresh, a save-after-typing all
 *  own only their run. `kick(ms?)` restarts the window (a per-kick
 *  delay serves callers with different durations on one task),
 *  `cancel()` discards pending work (later kicks schedule again),
 *  `flush()` runs pending work now, `stop()` is terminal. A scope
 *  resource: pausing the owning scope holds the window, resuming
 *  reschedules it. */
export interface QuietTask extends Settlement {
    /** Mark work pending and (re)start the quiet window — `ms` overrides the delay for this window. */
    kick(ms?: number): void;
}
export declare function quietTask(run: () => void, ms: number, _options?: NodeOptions): QuietTask;
/** A quiet WINDOW with a synchronous answer: is the burst for `key`
 *  still open? `touch(key)` opens (or extends) it; `open(key)` reads
 *  it — true while the last touch of the SAME key is younger than
 *  `ms`; `close()` ends it. The question settle/quietTask cannot
 *  answer at call time (they deliver after the quiet, never say
 *  whether it holds now): a typing burst joining one undo step, a
 *  tap's ghost click, a fresh row ignoring a double-click. */
export interface QuietWindow {
    touch(key?: string): void;
    open(key?: string): boolean;
    close(): void;
}
export declare function quietWindow(ms: number): QuietWindow;

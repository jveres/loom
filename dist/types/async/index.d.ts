import { type NodeOptions, type Read, type Stop } from "../loom.js";
export interface Resource<T> {
    /** The latest resolved value; `undefined` until the first fetch settles (stale-while-refetch). */
    (): T | undefined;
    /** True from fetch start to settle — initially and on every refetch. */
    readonly loading: Read<boolean>;
    /**
     * False until the first fetch **succeeds**, then permanently true. The initial-readiness
     * question, distinct from `loading` (which is true again on every refetch): `!ready()` selects
     * the skeleton shown only before the first data, while later refetches hold the stale value.
     * A first-fetch rejection leaves it false — the next success flips it.
     */
    readonly ready: Read<boolean>;
    /** The last rejection; cleared by the next successful settle. */
    readonly error: Read<unknown>;
    /** Start a new fetch now (one also starts whenever the fetcher's tracked reads change). */
    refresh(): void;
    /** Dispose the underlying effect (a resource inside a scope also stops with the scope). */
    readonly stop: Stop;
}
/**
 * An async computed: runs `fetcher` immediately and again whenever its **synchronously tracked**
 * reads change (reads after the first `await`/`.then` are outside the tracked run — hoist them or
 * use {@link Resource.refresh}). The previous value is passed to `fetcher` untracked, and `signal`
 * aborts when this fetch becomes obsolete (a newer fetch started, or the resource was disposed) —
 * forward it to `fetch()` and the obsolete request is cancelled, not just ignored. While a fetch
 * is in flight the previous value and error stay readable (stale-while-revalidate); a late
 * response from an aborted or superseded fetch never clobbers newer state, and its abort rejection
 * never surfaces through `error()`. Pausing an owning scope suspends refetches but does NOT abort
 * the in-flight fetch (unlike a `source()`'s producer, which disconnects on pause): it settles,
 * writes, and can flip `ready()` while paused — consumers catch up on resume.
 */
export declare function resource<T>(fetcher: (previous: T | undefined, signal: AbortSignal) => Promise<T>, options?: NodeOptions): Resource<T>;
/**
 * True while any of the given resources has a fetch in flight — the aggregate `loading` for
 * dimming a stale pane or disabling a submit that spans several requests. A plain derived read
 * (like `writable`), not a node: use it directly in an effect or binding; wrap it in `computed`
 * if a large fan-out wants value-deduped re-runs.
 */
export declare function pending(...resources: ReadonlyArray<Pick<Resource<unknown>, "loading">>): Read<boolean>;

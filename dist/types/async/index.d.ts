import { type NodeOptions, type Read, type Stop } from "../loom.js";
export interface Resource<T> {
    /** The latest resolved value; `undefined` until the first fetch settles (stale-while-refetch). */
    (): T | undefined;
    /** True from fetch start to settle — initially and on every refetch. */
    readonly loading: Read<boolean>;
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
 * use {@link Resource.refresh}). The previous value is passed to `fetcher` untracked. While a fetch
 * is in flight the previous value and error stay readable (stale-while-revalidate); a re-fetch or
 * disposal drops the in-flight response, so out-of-order resolutions never clobber newer state.
 */
export declare function resource<T>(fetcher: (previous: T | undefined) => Promise<T>, options?: NodeOptions): Resource<T>;

// Async addon (the `loom/async` entrypoint): a minimal reactive resource on top of the core
// primitives. Deliberately not Solid 2.0's graph-status async — no transitions, no optimistic
// lanes; just fine-grained value/loading/error reads with stale-response protection (see
// docs/architecture-v2.md, stage 5). Nothing here touches the core, so apps that don't import it
// bundle none of it.
import {
  batch,
  effect,
  type NodeOptions,
  type Read,
  type State,
  type Stop,
  state,
  untrack,
} from "../loom.js";

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
export function resource<T>(
  fetcher: (previous: T | undefined) => Promise<T>,
  options?: NodeOptions,
): Resource<T> {
  const value: State<T | undefined> = state<T | undefined>(undefined, options);
  const loading = state(true, options);
  const error = state<unknown>(undefined, options);
  const generation = state(0, options); // refresh()'s handle: a tracked dep the effect re-runs on

  const stop = effect(() => {
    generation();
    let live = true; // cleared before each re-run and on dispose — the stale-response guard
    loading(true);
    // Only the previous-value read is untracked — the fetcher's own synchronous reads are the
    // resource's dependencies.
    const previous = untrack(() => value());
    fetcher(previous).then(
      (next) => {
        if (!live) return;
        batch(() => {
          value(next);
          error(undefined);
          loading(false);
        });
      },
      (rejection) => {
        if (!live) return;
        batch(() => {
          error(rejection);
          loading(false);
        });
      },
    );
    return () => {
      live = false;
    };
  }, options);

  return Object.assign(() => value(), {
    loading: () => loading() as boolean,
    error: () => error(),
    refresh: () => {
      generation(untrack(() => generation()) + 1);
    },
    stop,
  });
}

import {
  type NodeOptions,
  type Read,
  registerScopeResource,
  type State,
  type Stop,
  untrack,
  watch,
} from "./loom.js";

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

const strictEqual = <T>(value: T, previous: T): boolean => value === previous;

/**
 * Observe a derived value synchronously, but deliver its changes only after `ms` without a
 * semantically distinct value. The initial evaluation is silent. A burst reports the latest value
 * and the last delivered value; returning to that delivered baseline cancels the burst.
 */
export function settle<T>(
  read: State<T>,
  onSettled: (value: T, previous: T) => void,
  ms: number,
  options?: SettleOptions<T>,
): Settlement;
export function settle<T>(
  read: Read<T>,
  onSettled: (value: T, previous: T) => void,
  ms: number,
  options?: SettleOptions<T>,
): Settlement;
export function settle<T>(
  read: Read<T>,
  onSettled: (value: T, previous: T) => void,
  ms: number,
  options?: SettleOptions<T>,
): Settlement {
  if (!Number.isFinite(ms) || ms < 0) {
    throw new RangeError(
      "settle() delay must be a finite, non-negative number.",
    );
  }

  const equals = options?.equals ?? strictEqual<T>;
  let first = true;
  let observed!: T;
  let delivered!: T;
  let pendingValue!: T;
  let pending = false;
  let paused = false;
  let terminal = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const clearTimer = (): void => {
    if (timer === undefined) return;
    clearTimeout(timer);
    timer = undefined;
  };

  const cancel = (): void => {
    if (terminal) return;
    pending = false;
    clearTimer();
  };

  const flush = (): void => {
    if (terminal || paused || !pending) return;
    clearTimer();
    pending = false;
    const value = pendingValue;
    const previous = delivered;
    // Commit before the callback: a re-entrant source write starts a new burst from this value.
    delivered = value;
    untrack(() => onSettled(value, previous));
  };

  const schedule = (): void => {
    clearTimer();
    timer = setTimeout(() => {
      timer = undefined;
      flush();
    }, ms);
  };

  const stopWatch = watch(
    () => {
      const value = read();
      if (first) {
        first = false;
        observed = value;
        delivered = value;
      }
      return value;
    },
    (value) => {
      const sameAsObserved = equals(value, observed);
      observed = value;
      if (sameAsObserved) {
        // Equal representations do not move the deadline, but a later flush still gets the latest.
        if (pending) pendingValue = value;
        return;
      }
      if (equals(value, delivered)) {
        cancel();
        return;
      }
      pendingValue = value;
      pending = true;
      if (!paused) schedule();
    },
    options,
  );

  const terminate = (): void => {
    if (terminal) return;
    terminal = true;
    pending = false;
    clearTimer();
    stopWatch();
  };

  const unregisterResource = registerScopeResource({
    pause: () => {
      paused = true;
      clearTimer();
    },
    resume: () => {
      paused = false;
      if (pending) schedule();
    },
    stop: terminate,
  });

  const stop = (): void => {
    if (terminal) return;
    terminate();
    unregisterResource();
  };

  return { stop, cancel, flush };
}

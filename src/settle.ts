import {
  type NodeOptions,
  type Read,
  registerScopeResource,
  state,
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

/** A settled derived value: a reactive Read that lags its source by the
 *  quiet period, plus the settlement's controls. */
export interface SettledState<T> extends Settlement {
  (): T;
}

/**
 * Derive a value that SETTLES: the returned read serves the initial
 * evaluation immediately, then follows the source only after `ms` without a
 * semantically distinct value. `flush()` promotes a pending value NOW (the
 * host's "apply immediately" override); `cancel()` discards it; reads track
 * reactively like any state. The source is evaluated twice at construction
 * (the seed and the settlement's silent baseline).
 */
export function settled<T>(
  read: State<T>,
  ms: number,
  options?: SettleOptions<T>,
): SettledState<T>;
export function settled<T>(
  read: Read<T>,
  ms: number,
  options?: SettleOptions<T>,
): SettledState<T>;
export function settled<T>(
  read: Read<T>,
  ms: number,
  options?: SettleOptions<T>,
): SettledState<T> {
  const nodeOptions: NodeOptions = {
    ...(options?.label !== undefined ? { label: options.label } : {}),
    ...(options?.internal !== undefined ? { internal: options.internal } : {}),
  };
  // The equals option belongs to the SETTLEMENT (semantic burst
  // detection); the cell keeps plain state semantics.
  const cell = state<T>(untrack(read), nodeOptions);
  const settlement = settle(read, (value) => cell(value), ms, options);
  return Object.assign(() => cell(), settlement);
}

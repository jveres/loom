import { failSetup, lifetime } from "./core/lifetime.js";
import { untrack } from "./core/tracking.js";
import { detached, type Read, type State, type Stop, watch } from "./loom.js";

export interface FrameClock {
  requestAnimationFrame?: (callback: FrameRequestCallback) => number;
  cancelAnimationFrame?: (id: number) => void;
}
export interface ScheduleOptions {
  readonly signal?: AbortSignal;
}
export interface FrameOptions extends ScheduleOptions {
  readonly window?: FrameClock;
}
export interface Coalescer {
  readonly request: () => void;
  readonly cancel: () => void;
  readonly stop: Stop;
}

function frame(run: () => void, clock: FrameClock = globalThis): Stop {
  let active = true;
  const deliver = (): void => {
    if (!active) return;
    active = false;
    run();
  };
  const id = clock.requestAnimationFrame?.(deliver);
  if (id === undefined) queueMicrotask(deliver);
  return () => {
    active = false;
    if (id !== undefined) clock.cancelAnimationFrame?.(id);
  };
}

function coalescer(
  run: () => void,
  enqueue: (run: () => void) => Stop,
  options?: ScheduleOptions,
): Coalescer {
  const life = lifetime(options?.signal);
  let pending: Stop | undefined;
  const cancel = (): void => {
    pending?.();
    pending = undefined;
  };
  life.add(cancel);
  return {
    request() {
      if (!life.active || pending) return;
      pending = enqueue(() => {
        pending = undefined;
        if (life.active) untrack(run);
      });
    },
    cancel,
    stop: life.stop,
  };
}

/** Coalesce requests into one microtask. Cancel permits subsequent requests. */
export function microtaskCoalescer(
  run: () => void,
  options?: ScheduleOptions,
): Coalescer {
  return coalescer(
    run,
    (deliver) => {
      let active = true;
      queueMicrotask(() => {
        if (active) deliver();
      });
      return () => {
        active = false;
      };
    },
    options,
  );
}

/** Coalesce requests into one frame of the selected window. */
export function frameCoalescer(
  run: () => void,
  options?: FrameOptions,
): Coalescer {
  return coalescer(run, (deliver) => frame(deliver, options?.window), options);
}

/** Run after a positive integer number of frames; no RAF means microtasks. */
export function afterFrames(
  count: number,
  run: () => void,
  options?: FrameOptions,
): Stop {
  if (!Number.isInteger(count) || count < 1)
    throw new RangeError("Frame count must be a positive integer.");
  const life = lifetime(options?.signal);
  let pending: Stop | undefined;
  life.add(() => pending?.());
  const step = (): void => {
    if (!life.active) return;
    if (--count === 0) {
      life.stop();
      untrack(run);
    } else pending = frame(step, options?.window);
  };
  if (life.active) pending = frame(step, options?.window);
  return life.stop;
}

export interface EventOrTimeoutOptions extends ScheduleOptions {
  readonly timeoutMs: number;
  readonly capture?: boolean;
}
/** Race one event against a timeout. Teardown precedes the callback. */
export function eventOrTimeout<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  run: (event: WindowEventMap[K] | undefined) => void,
  options: EventOrTimeoutOptions,
): Stop;
export function eventOrTimeout<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  run: (event: DocumentEventMap[K] | undefined) => void,
  options: EventOrTimeoutOptions,
): Stop;
export function eventOrTimeout<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  run: (event: HTMLElementEventMap[K] | undefined) => void,
  options: EventOrTimeoutOptions,
): Stop;
export function eventOrTimeout(
  target: EventTarget,
  type: string,
  run: (event: Event | undefined) => void,
  options: EventOrTimeoutOptions,
): Stop;
export function eventOrTimeout(
  target: EventTarget,
  type: string,
  run: (event: Event | undefined) => void,
  options: EventOrTimeoutOptions,
): Stop {
  assertDelay(options.timeoutMs);
  const life = lifetime(options.signal);
  if (!life.active) return life.stop;
  const fire = (event?: Event): void => {
    if (!life.active) return;
    life.stop();
    untrack(() => run(event));
  };
  const context = target as EventTarget & {
    ownerDocument?: Document;
    defaultView?: Window;
    window?: Window;
  };
  const realm =
    context.ownerDocument?.defaultView ??
    context.defaultView ??
    context.window ??
    globalThis;
  try {
    target.addEventListener(type, fire, { capture: options.capture ?? false });
    life.add(() =>
      target.removeEventListener(type, fire, options.capture ?? false),
    );
    const timer = realm.setTimeout(fire, options.timeoutMs);
    life.add(() => realm.clearTimeout(timer));
  } catch (error) {
    failSetup(life, error);
  }
  return life.stop;
}

export interface WatchSettledOptions<T> extends ScheduleOptions {
  readonly delayMs: number;
  readonly equals?: (value: T, previous: T) => boolean;
}
export interface SettledWatcher {
  readonly stop: Stop;
  readonly cancel: () => void;
  readonly flush: () => void;
}
function assertDelay(delayMs: number): void {
  if (!Number.isFinite(delayMs) || delayMs < 0)
    throw new RangeError("Delay must be finite and non-negative.");
}
/** Observe immediately, deliver changes after quiet time, and own the watcher explicitly. */
export function watchSettled<T>(
  read: State<T> | Read<T>,
  run: (value: NoInfer<T>, previous: NoInfer<T>) => void,
  options: WatchSettledOptions<T>,
): SettledWatcher {
  assertDelay(options.delayMs);
  const life = lifetime(options.signal);
  const equals = options.equals ?? ((a: T, b: T) => a === b);
  let first = true;
  let observed!: T;
  let delivered!: T;
  let latest!: T;
  let pending = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  const cancel = (): void => {
    pending = false;
    clear();
  };
  const flush = (): void => {
    if (!life.active || !pending) return;
    cancel();
    const previous = delivered;
    delivered = latest;
    untrack(() => run(delivered, previous));
  };
  life.add(cancel);
  if (life.active) {
    try {
      life.add(
        detached(() =>
          watch(
            () => {
              const value = read();
              if (first) {
                first = false;
                observed = delivered = value;
              }
              return value;
            },
            (value) => {
              if (!life.active) return;
              const same = equals(value, observed);
              observed = value;
              if (same) {
                if (pending) latest = value;
                return;
              }
              if (equals(value, delivered)) {
                cancel();
                return;
              }
              latest = value;
              pending = true;
              clear();
              timer = setTimeout(flush, options.delayMs);
            },
          ),
        ),
      );
    } catch (error) {
      failSetup(life, error);
    }
  }
  return { stop: life.stop, cancel, flush };
}

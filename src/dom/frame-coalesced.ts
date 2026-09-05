// frameCoalesced(fn, options?) — a FRAME-latched one-shot: however many
// times the returned request is called before the next paint, `fn` runs
// once, right before it. `coalesced`'s sibling — that one is a microtask
// latch (its own contract says "not nextFrame"); this one is for
// scroll/resize/observer fan-out that must collapse to ONE pass per
// painted frame (an overlay re-pin, a scrub drive). `window` pins the
// latch to a specific realm's paint clock — a popup or an iframe's
// window has its own frame scheduler. Falls back to a microtask when the chosen realm has no
// requestAnimationFrame (workers, tests, SSR). With an `owner`, requests
// after its disposal are dropped; `.stop()` cancels a pending run and
// retires the request for callers without an owner node (a dying popup).
import type { Stop } from "../loom.js";
import { own } from "./ownership-base.js";

interface FrameClock {
  requestAnimationFrame?: (fn: () => void) => number;
  cancelAnimationFrame?: (id: number) => void;
}

export interface FrameRequest {
  (): void;
  /** Cancel a pending run and refuse future requests. */
  stop: Stop;
}

export function frameCoalesced(
  fn: () => void,
  options?: { window?: FrameClock; owner?: Node },
): FrameRequest {
  const clock: FrameClock =
    options?.window ??
    (typeof requestAnimationFrame === "function"
      ? { requestAnimationFrame, cancelAnimationFrame }
      : {});
  let queued = false;
  let dead = false;
  let pending: number | undefined;
  const run = (): void => {
    queued = false;
    pending = undefined;
    if (!dead) fn();
  };
  const request = (): void => {
    if (queued || dead) return;
    queued = true;
    if (clock.requestAnimationFrame) {
      pending = clock.requestAnimationFrame(run);
    } else {
      queueMicrotask(run);
    }
  };
  request.stop = (): void => {
    dead = true;
    if (pending !== undefined) {
      clock.cancelAnimationFrame?.(pending);
      pending = undefined;
      queued = false;
    }
  };
  if (options?.owner) {
    own(options.owner, request.stop);
  }
  return request;
}

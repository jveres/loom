// The deferred effect lane — loaded by importing "loom/defer" once at startup, which installs it
// into the core's `deferredLane` seam. Apps that never use effect({ defer: true }) bundle none of
// this; creating a deferred effect without the module loaded throws. Same opt-in contract as
// loom/observe: the flag alone can't reach machinery that was never bundled.
import {
  type DeferScheduler,
  deferredLane,
  type EffectNode,
  installDeferredLane,
} from "../loom.js";

const now = (): number => performance.now();

const deferredQueue: Array<EffectNode | undefined> = [];
let deferHead = 0;
let drainScheduled = false;
let drainDeadline = Number.POSITIVE_INFINITY; // absolute time (now()+maxStale) the pending drain fires by
let drainCancel: (() => void) | undefined;
const DEFER_BUDGET_MS = 5; // a forced (no-idle) drain runs at most ~this long, then yields

// Default scheduler: requestIdleCallback (idle-first, with a maxStale timeout floor) where present,
// else a setTimeout floor. Both give the drain a budget so a forced (no-idle) run yields the frame.
function defaultDeferScheduler(
  drain: (hasBudget: () => boolean) => void,
  maxStale: number,
): () => void {
  const g = globalThis as unknown as {
    requestIdleCallback?: (
      cb: (d: {
        timeRemaining(): number;
        readonly didTimeout: boolean;
      }) => void,
      opts?: { timeout?: number },
    ) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof g.requestIdleCallback === "function") {
    const id = g.requestIdleCallback(
      (dl) => {
        const end = now() + DEFER_BUDGET_MS;
        // Idle: ride the remaining idle time. Forced (no idle): a fixed budget so we make bounded
        // progress instead of either starving or blocking the frame.
        drain(() => (dl.didTimeout ? now() < end : dl.timeRemaining() > 0));
      },
      { timeout: maxStale },
    );
    return () => g.cancelIdleCallback?.(id);
  }
  const id = setTimeout(() => {
    const end = now() + DEFER_BUDGET_MS;
    drain(() => now() < end);
  }, maxStale);
  return () => clearTimeout(id);
}

// Add a deferred effect to the lane (clearing Watching, as queueEffect does, so the system won't
// re-notify until it runs) and ensure a drain is scheduled to fire by its deadline. Dedup the
// queue: flushScope can re-offer a still-dirty effect that's already queued (pause→resume
// mid-flight) — an already-queued effect's deadline is covered by the drain scheduled when it was
// enqueued (or by the end-of-drain reschedule), so the re-offer path stays clock-free.
function deferEffect(node: EffectNode): void {
  clearWatching(node);
  if (node.deferredQueued) return;
  node.deferredQueued = true;
  deferredQueue.push(node);
  const deadline = now() + node.maxStale;
  node.deferDeadline = deadline;
  scheduleDrain(deadline, node.maxStale);
}

// Compare absolute fire-by times: a pending drain that already fires in time stands; a tighter
// deadline replaces it. `timeout` is the relative floor handed to the scheduler. The scheduler is
// read per schedule so a configure({ deferScheduler }) override applies to the next drain.
function scheduleDrain(deadline: number, timeout: number): void {
  if (drainScheduled && drainDeadline <= deadline) return;
  drainCancel?.();
  drainScheduled = true;
  drainDeadline = deadline;
  const scheduler: DeferScheduler =
    deferredLane.scheduler ?? defaultDeferScheduler;
  drainCancel = scheduler(drainDeferred, timeout);
}

// Run queued deferred effects while there's budget; reschedule any leftover. Each runs via the
// core's effect runner (honouring the dirty check, re-tracking deps, skipping a now-paused scope),
// which coalesces every change since it was queued into one run at the latest value.
function drainDeferred(hasBudget: () => boolean): void {
  drainScheduled = false;
  drainDeadline = Number.POSITIVE_INFINITY;
  drainCancel = undefined;
  while (deferHead < deferredQueue.length && hasBudget()) {
    const node = deferredQueue[deferHead];
    deferredQueue[deferHead] = undefined; // release the slot as we pass the head
    deferHead++;
    if (node !== undefined) {
      node.deferredQueued = false;
      if (node.flags !== 0) {
        // flags 0 = stopped while queued
        try {
          runEffect(node);
        } catch (error) {
          // Only reachable with no onError boundary (reportEffectError rethrows). Aborting the
          // drain here would wedge every effect queued behind this one — the tail reschedule
          // never runs and their deferredQueued flags block re-enqueueing forever. Re-throw on a
          // fresh task instead: window.onerror still fires, the drain keeps going.
          setTimeout(() => {
            throw error;
          }, 0);
        }
      }
    }
  }
  if (deferHead >= deferredQueue.length) {
    deferredQueue.length = 0;
    deferHead = 0;
  } else {
    // Leftovers keep their enqueue-time deadlines: reschedule with the time remaining to the
    // soonest one, not a fresh maxStale.
    let soonest = Number.POSITIVE_INFINITY;
    for (let i = deferHead; i < deferredQueue.length; i++) {
      const n = deferredQueue[i];
      if (n !== undefined && n.deferDeadline < soonest)
        soonest = n.deferDeadline;
    }
    scheduleDrain(soonest, Math.max(0, soonest - now()));
  }
}

// Install: hand the core our enqueue, capture its internals as plain locals (no per-call
// live-binding getters — see the install seam's comment in loom.ts).
const { runEffect, clearWatching } = installDeferredLane(deferEffect);

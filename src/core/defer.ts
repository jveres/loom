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
import type { Link, ReactiveNode } from "./graph.js";

const now = (): number => performance.now();
const Mutable = 1;
const Watching = 2;

const deferredQueue: Array<EffectNode | undefined> = [];
type DeadlineEntry = readonly [node: EffectNode, deadline: number];
// A lazy min-heap of enqueue-time deadlines. Queue slots remain FIFO for execution; the heap only
// answers which leftover must run soonest after a budget-limited drain. Processed/stopped entries
// are discarded lazily, avoiding a full tail scan after every partial drain.
const deferredDeadlines: DeadlineEntry[] = [];
let deferHead = 0;
let drainScheduled = false;
let drainDeadline = Number.POSITIVE_INFINITY; // absolute time (now()+maxStale) the pending drain fires by
let drainCancel: (() => void) | undefined;
let drainActive = false;
let scheduling = false;
let continuationTimer: ReturnType<typeof setTimeout> | undefined;

function pushDeadline(entry: DeadlineEntry): void {
  let index = deferredDeadlines.length;
  deferredDeadlines.push(entry);
  while (index > 0) {
    const parent = (index - 1) >> 1;
    const parentEntry = deferredDeadlines[parent] as DeadlineEntry;
    if (parentEntry[1] <= entry[1]) break;
    deferredDeadlines[index] = parentEntry;
    index = parent;
  }
  deferredDeadlines[index] = entry;
}

function popDeadline(): void {
  const tail = deferredDeadlines.pop() as DeadlineEntry;
  if (deferredDeadlines.length === 0) return;
  let index = 0;
  while (true) {
    const left = index * 2 + 1;
    if (left >= deferredDeadlines.length) break;
    const right = left + 1;
    let child = left;
    if (
      right < deferredDeadlines.length &&
      (deferredDeadlines[right] as DeadlineEntry)[1] <
        (deferredDeadlines[left] as DeadlineEntry)[1]
    ) {
      child = right;
    }
    const childEntry = deferredDeadlines[child] as DeadlineEntry;
    if (tail[1] <= childEntry[1]) break;
    deferredDeadlines[index] = childEntry;
    index = child;
  }
  deferredDeadlines[index] = tail;
}

function soonestPendingDeadline(): number {
  while (deferredDeadlines.length !== 0) {
    const entry = deferredDeadlines[0] as DeadlineEntry;
    if (entry[0].deferredQueued && entry[0].deferDeadline === entry[1]) {
      return entry[1];
    }
    popDeadline();
  }
  return Number.POSITIVE_INFINITY;
}

// An inline scheduler is invoked from graph notify(), before propagate() has necessarily visited
// the rest of the graph. Draining at that point can commit a dirty state before later subscribers
// are marked, making them observe a clean dependency and miss the update. Walk upstream from each
// queued effect and down Mutable branches; a still-Watching subscriber means the current propagation
// sweep has not reached it yet.
//
// This proof is only paid by a scheduler that calls its drain inline. The default scheduler and
// ordinary async custom schedulers never enter it.
function propagationStillActive(): boolean {
  const seen = new Set<ReactiveNode>();
  for (let index = deferHead; index < deferredQueue.length; index++) {
    const node = deferredQueue[index];
    if (node === undefined || node.flags === 0) continue;
    let link = node.deps;
    while (link !== undefined) {
      if (hasUnvisitedSubscriber(link.dep, seen)) return true;
      link = link.nextDep;
    }
  }
  return false;
}

function hasUnvisitedSubscriber(
  node: ReactiveNode,
  seen: Set<ReactiveNode>,
): boolean {
  if (seen.has(node)) return false;
  seen.add(node);
  let link: Link | undefined = node.subs;
  while (link !== undefined) {
    const sub = link.sub;
    if (sub.flags & Watching) return true;
    if ((sub.flags & Mutable) !== 0 && hasUnvisitedSubscriber(sub, seen))
      return true;
    link = link.nextSub;
  }
  link = node.deps;
  while (link !== undefined) {
    if (hasUnvisitedSubscriber(link.dep, seen)) return true;
    link = link.nextDep;
  }
  return false;
}

function cancelContinuation(): void {
  if (continuationTimer === undefined) return;
  clearTimeout(continuationTimer);
  continuationTimer = undefined;
}

// A synchronous scheduler can report an exhausted budget. Rescheduling it in the same call stack
// spins forever, so continue on a fresh task. The heap is consulted then, preserving the original
// enqueue-time deadline and incorporating any tighter work added before the continuation runs.
function scheduleContinuation(): void {
  if (continuationTimer !== undefined) return;
  continuationTimer = setTimeout(() => {
    continuationTimer = undefined;
    const soonest = soonestPendingDeadline();
    if (soonest !== Number.POSITIVE_INFINITY) {
      scheduleDrain(soonest, Math.max(0, soonest - now()));
    } else {
      clearDeferredQueue();
    }
  }, 0);
}

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
        const end = now() + 5;
        // Idle: ride the remaining idle time. Forced (no idle): a fixed budget so we make bounded
        // progress instead of either starving or blocking the frame.
        drain(() => (dl.didTimeout ? now() < end : dl.timeRemaining() > 0));
      },
      { timeout: maxStale },
    );
    return () => g.cancelIdleCallback?.(id);
  }
  const id = setTimeout(() => {
    const end = now() + 5;
    drain(() => now() < end);
  }, maxStale);
  return () => clearTimeout(id);
}

// Add a deferred effect and its deferred owner chain to the lane, parent first. Nested effects are
// dependencies of their parent, so a shared signal can encounter the child first; running that
// stale child before its dirty parent would do duplicate work immediately before the parent
// disposes it. This mirrors queueEffect's reverse insertion in the synchronous lane.
//
// Clear Watching on the node graph propagation actually notified. Parent placeholders stay armed
// until propagation reaches them; that is the barrier which prevents an inline scheduler from
// consuming shared dirty state too early. An already-queued parent is necessarily earlier in the
// FIFO, so it is also where this walk can stop. flushScope may re-offer the first node itself
// (pause→resume mid-flight); that duplicate remains clock-free.
function deferEffect(node: EffectNode): void {
  clearWatching(node);
  if (node.deferredQueued) {
    if (!drainScheduled && continuationTimer !== undefined) {
      const deadline = soonestPendingDeadline();
      if (deadline !== Number.POSITIVE_INFINITY)
        scheduleDrain(deadline, Math.max(0, deadline - now()));
    }
    return;
  }

  const enqueuedAt = now();
  const firstInsertedIndex = deferredQueue.length;
  let timeout = node.maxStale as number;

  while (true) {
    node.deferredQueued = true;
    deferredQueue.push(node);
    const maxStale = node.maxStale as number;
    const deadline = enqueuedAt + maxStale;
    node.deferDeadline = deadline;
    pushDeadline([node, deadline]);
    if (maxStale < timeout) timeout = maxStale;

    const parent = node.subs?.sub as EffectNode | undefined;
    if (parent === undefined || !parent.deferred || !(parent.flags & Watching))
      break;
    if (parent.deferredQueued) break;
    node = parent;
  }

  let left = firstInsertedIndex;
  let right = deferredQueue.length - 1;
  while (left < right) {
    const first = deferredQueue[left] as EffectNode;
    deferredQueue[left++] = deferredQueue[right];
    deferredQueue[right--] = first;
  }
  scheduleDrain(enqueuedAt + timeout, timeout);
}

// Compare absolute fire-by times: a pending drain that already fires in time stands; a tighter
// deadline replaces it. `timeout` is the relative floor handed to the scheduler. The scheduler is
// read per schedule so a configure({ deferScheduler }) override applies to the next drain.
function scheduleDrain(deadline: number, timeout: number): void {
  // Effects queued by the active drain are appended to the same FIFO and consumed by its loop. If
  // budget runs out, the tail logic below requests one continuation using the heap's true minimum.
  if (drainActive || scheduling) return;
  if (drainScheduled && drainDeadline <= deadline) return;
  drainCancel?.();
  drainScheduled = true;
  drainDeadline = deadline;
  // A custom scheduler may invoke drain synchronously. Guard that callback until the current graph
  // propagation finishes, and defer a zero-budget continuation to a fresh task.
  scheduling = true;
  try {
    const scheduler: DeferScheduler =
      deferredLane.scheduler ?? defaultDeferScheduler;
    const cancel = scheduler((hasBudget) => {
      if (scheduling && propagationStillActive()) {
        drainScheduled = false;
        drainDeadline = Number.POSITIVE_INFINITY;
        drainCancel = undefined;
        scheduleContinuation();
        return;
      }
      drainDeferred(hasBudget);
    }, timeout);
    // A synchronous scheduler may already have consumed this drain. Store its cancel callback only
    // if this exact request is still pending.
    if (drainScheduled && drainDeadline === deadline) drainCancel = cancel;
  } finally {
    scheduling = false;
  }
  if (!drainScheduled && deferHead < deferredQueue.length) {
    scheduleContinuation();
  }
}

// Run queued deferred effects while there's budget; reschedule any leftover. Each runs via the
// core's effect runner (honouring the dirty check, re-tracking deps, skipping a now-paused scope),
// which coalesces every change since it was queued into one run at the latest value.
function drainDeferred(hasBudget: () => boolean): void {
  if (drainActive) return;
  drainScheduled = false;
  drainDeadline = Number.POSITIVE_INFINITY;
  drainCancel = undefined;
  drainActive = true;
  try {
    while (deferHead < deferredQueue.length && hasBudget()) {
      // Every slot at/after the monotonic head is live; only passed slots are cleared for GC.
      const node = deferredQueue[deferHead] as EffectNode;
      deferredQueue[deferHead] = undefined; // release the slot as we pass the head
      deferHead++;
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
  } finally {
    drainActive = false;
  }
  if (deferHead < deferredQueue.length) {
    // Leftovers keep their enqueue-time deadlines: reschedule with the time remaining to the
    // soonest one, not a fresh maxStale. The deadline heap makes repeated one-item drains O(n log n)
    // instead of rescanning an n, n-1, n-2... tail (O(n²)).
    const soonest = soonestPendingDeadline();
    if (soonest !== Number.POSITIVE_INFINITY) {
      if (scheduling) scheduleContinuation();
      else scheduleDrain(soonest, Math.max(0, soonest - now()));
      return;
    }
  }
  // The queue was fully consumed, or every leftover stopped while queued.
  clearDeferredQueue();
}

function clearDeferredQueue(): void {
  deferredQueue.length = 0;
  deferredDeadlines.length = 0;
  deferHead = 0;
  cancelContinuation();
}

// Install: hand the core our enqueue, capture its internals as plain locals (no per-call
// live-binding getters — see the install seam's comment in loom.ts).
const { runEffect, clearWatching } = installDeferredLane(deferEffect);

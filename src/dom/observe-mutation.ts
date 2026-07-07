// observeMutation(el, cb, options) — DOM mutation observation with node lifetime: the raw
// MutationObserver contract (records batched per microtask, MutationObserverInit options),
// detached when the node is torn down. Returns a Stop for early manual detach.
//
// One observer per call: with `subtree: true` a record's target is the mutated descendant, so
// records on a shared observer cannot be routed to the right subscriber.
import type { Stop } from "../loom.js";
import { onUnmount } from "./index.js";
import { once } from "./once.js";

export type MutationsCallback = (records: MutationRecord[]) => void;

export function observeMutation(
  el: Node,
  cb: MutationsCallback,
  options: MutationObserverInit,
): Stop {
  const observer = new MutationObserver(cb);
  observer.observe(el, options);
  const stop = once(() => observer.disconnect());
  onUnmount(el, stop);
  return stop;
}

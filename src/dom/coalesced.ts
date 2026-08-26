// coalesced(fn, owner?) — a microtask-latched one-shot: however many
// times the returned request is called in one task, `fn` runs once,
// on the microtask. The observer fan-out shape — a width change
// resizes every observed box in one delivery, and each entry must not
// replay the whole layout pass. Not nextFrame (a frame, not a
// microtask) and not a quiet task (no timer). With an `owner`, a
// request after the owner's disposal is dropped.
import { own } from "./ownership-base.js";

export function coalesced(fn: () => void, owner?: Node): () => void {
  let queued = false;
  let dead = false;
  if (owner) {
    own(owner, () => {
      dead = true;
    });
  }
  return () => {
    if (queued || dead) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      if (!dead) fn();
    });
  };
}

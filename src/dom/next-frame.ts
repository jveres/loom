// nextFrame(fn, owner?) — run `fn` before the next paint (the frame
// boundary), cancellable, and abandoned with `owner` when one is given.
// requestAnimationFrame where the platform has one; a microtask where it
// doesn't (workers, tests, SSR) so callers never branch on the shim.
// afterFrames(n, fn, owner?) chains `n` frames — the "let the layout
// settle, then measure" idiom (two frames survives a same-frame style
// write plus its layout), one cancel for the whole chain.
import type { Stop } from "../loom.js";
import { onUnmount } from "./ownership-base.js";

const raf = (fn: () => void): (() => void) => {
  if (typeof requestAnimationFrame === "function") {
    const id = requestAnimationFrame(() => fn());
    return () => cancelAnimationFrame(id);
  }
  let live = true;
  queueMicrotask(() => {
    if (live) fn();
  });
  return () => {
    live = false;
  };
};

export function nextFrame(fn: () => void, owner?: Node): Stop {
  let done = false;
  let release: Stop = () => {};
  const cancelFrame = raf(() => {
    if (done) return;
    done = true;
    release();
    fn();
  });
  const stop = (): void => {
    if (done) return;
    done = true;
    cancelFrame();
    release();
  };
  if (owner) release = onUnmount(owner, stop);
  return stop;
}

export function afterFrames(n: number, fn: () => void, owner?: Node): Stop {
  let stop: Stop = () => {};
  let left = Math.max(1, Math.floor(n));
  const step = (): void => {
    left -= 1;
    if (left === 0) fn();
    else stop = nextFrame(step, owner);
  };
  stop = nextFrame(step, owner);
  return () => stop();
}

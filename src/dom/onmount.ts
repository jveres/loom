// onmount(el, fn) — the mount hook, with an explicit timing contract: `fn` runs once, on a
// microtask after the task that inserted the element — inserted and measurable (layout on
// demand), **not yet painted** — so measure-then-classify work causes no flash. Function-only,
// deliberately NOT a JSX prop: wiring it into applyProps would bundle this module into every
// h() user (+231 B gzip measured on the minimal-dom budget); as an import it's free until used.
//
// Cost model: the common case — caller inserts the element in the same synchronous task, or it is
// already connected — resolves entirely on the microtask, no observers anywhere. Only an element
// still disconnected at the microtask checkpoint falls back to a shared document-level
// MutationObserver, and that observer is transient: it exists exactly while such elements are
// pending and disconnects when the last one mounts (or is torn down / cancelled first — a pending
// entry is dropped by `remove()`/`dispose()` like any node-owned resource, so an element that
// never mounts doesn't pin the observer).
import type { Stop } from "../loom.js";
import { onunmount } from "./index.js";

const pending = new Map<Node, Set<(node: Node) => void>>();
let observer: MutationObserver | null = null;

function sweep(): void {
  for (const [node, fns] of pending) {
    if (!node.isConnected) continue;
    pending.delete(node);
    for (const fn of fns) fn(node);
  }
  if (pending.size === 0) {
    observer?.disconnect();
    observer = null;
  }
}

function enqueue(node: Node, fn: (node: Node) => void): void {
  let fns = pending.get(node);
  if (!fns) {
    fns = new Set();
    pending.set(node, fns);
  }
  fns.add(fn);
  observer ??= (() => {
    const mo = new MutationObserver(sweep);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    return mo;
  })();
}

export function onmount(node: Node, fn: (node: Node) => void): Stop {
  let cancelled = false;
  const run = (n: Node): void => {
    if (!cancelled) {
      cancelled = true; // once
      fn(n);
    }
  };
  queueMicrotask(() => {
    if (cancelled) return;
    if (node.isConnected) run(node);
    else enqueue(node, run);
  });
  const cancel = (): void => {
    cancelled = true;
    const fns = pending.get(node);
    if (fns) {
      fns.delete(run);
      if (fns.size === 0) {
        pending.delete(node);
        if (pending.size === 0) {
          observer?.disconnect();
          observer = null;
        }
      }
    }
  };
  // A node torn down the Loom way before it ever mounts must not pin the transient observer.
  onunmount(node, cancel);
  return cancel;
}

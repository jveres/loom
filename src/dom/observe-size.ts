// observeSize(el, cb) — sized observation with the same lifetime treatment events get: the
// callback runs on the element's ResizeObserver clock (including the spec's initial delivery on
// attach, so consumers get their first measurement without a manual call) and is torn down with
// the node — `remove()`/`dispose()`/a keyed row leaving detach it automatically, the forgotten
// `ro.disconnect()` class of leak gone by construction. Returns a Stop for early manual detach.
//
// ONE ResizeObserver serves every observeSize in the app; per-element callback sets route each
// entry. With nothing observed the observer is disconnected and this module costs zero.
import type { Stop } from "../loom.js";
import { onunmount } from "./index.js";

export type SizeCallback = (entry: ResizeObserverEntry) => void;

const watched = new Map<Element, Set<SizeCallback>>();
let observer: ResizeObserver | null = null;

function deliver(entries: ResizeObserverEntry[]): void {
  for (const entry of entries) {
    const callbacks = watched.get(entry.target);
    if (!callbacks) continue;
    for (const cb of callbacks) cb(entry);
  }
}

export function observeSize(el: Element, cb: SizeCallback): Stop {
  let callbacks = watched.get(el);
  if (!callbacks) {
    callbacks = new Set();
    watched.set(el, callbacks);
    observer ??= new ResizeObserver(deliver);
    observer.observe(el);
  }
  callbacks.add(cb);
  let detached = false;
  const stop = (): void => {
    if (detached) return; // idempotent: manual stop + the node teardown both call it
    detached = true;
    const current = watched.get(el);
    if (!current) return;
    current.delete(cb);
    if (current.size === 0) {
      watched.delete(el);
      observer?.unobserve(el);
      if (watched.size === 0) {
        observer?.disconnect();
        observer = null;
      }
    }
  };
  onunmount(el, stop);
  return stop;
}

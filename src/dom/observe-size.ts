// observeSize(el, cb, options?) — sized observation with the same lifetime treatment events get: the
// callback runs on the element's ResizeObserver clock (including the spec's initial delivery on
// attach, so consumers get their first measurement without a manual call) and is torn down with
// the node — `remove()`/`dispose()`/a keyed row leaving detach it automatically, the forgotten
// `ro.disconnect()` class of leak gone by construction. Returns a Stop for early manual detach.
//
// ONE ResizeObserver serves every observeSize in the app; per-element callback sets route each
// entry. With nothing observed the observer is disconnected and this module costs zero.
import type { Stop } from "../loom.js";
import { once } from "./once.js";
import { onUnmount } from "./ownership-base.js";

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

export function observeSize(
  el: Element,
  cb: SizeCallback,
  options?: ResizeObserverOptions,
): Stop {
  let callbacks = watched.get(el);
  if (!callbacks) {
    callbacks = new Set();
    watched.set(el, callbacks);
    observer ??= new ResizeObserver(deliver);
    observer.observe(el, options);
  } else if (options) {
    // The shared observer holds ONE observation per element, so an
    // explicit box wins over whatever the element was observed with:
    // re-observing replaces the options (and re-fires the spec's
    // initial delivery — size reads are idempotent). Padding-only
    // changes are invisible on the default content-box; a consumer
    // measuring border boxes must observe { box: "border-box" }.
    observer?.unobserve(el);
    observer?.observe(el, options);
  }
  callbacks.add(cb);
  const stop = once(() => {
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
  });
  return onUnmount(el, stop);
}

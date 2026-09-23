// One platform observer shared by many (element, callback) registrations, routed per target.
// Shared by the pooled ResizeObserver (observe-size) and IntersectionObserver (observe-intersection).
import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";

interface TargetObserver {
  unobserve(target: Element): void;
  disconnect(): void;
}

export interface ObserverPool<Entry> {
  /** Route `callback` the entries for `el`. The returned stop is idempotent; the last stop for a
   *  target unobserves it, and the last target disconnects the observer and calls `onEmpty`. */
  readonly add: (el: Element, callback: (entry: Entry) => void) => Stop;
}

export function observerPool<
  Entry extends { readonly target: Element },
  Observer extends TargetObserver,
>(
  create: (dispatch: (entries: readonly Entry[]) => void) => Observer,
  observe: (observer: Observer, el: Element) => void,
  onEmpty: () => void,
): ObserverPool<Entry> {
  const watched = new Map<Element, Set<(entry: Entry) => void>>();
  const observer = create((entries) => {
    for (const entry of entries) {
      const callbacks = watched.get(entry.target);
      if (!callbacks) continue;
      // Snapshot: a callback may stop itself or a sibling; a stopped one must not run.
      for (const fn of [...callbacks])
        if (callbacks.has(fn)) untrack(() => fn(entry));
    }
  });
  return {
    add(el, callback) {
      let callbacks = watched.get(el);
      if (!callbacks) {
        callbacks = new Set();
        try {
          observe(observer, el);
        } catch (error) {
          // A pool that failed its first registration holds nothing; release it.
          if (watched.size === 0) {
            observer.disconnect();
            onEmpty();
          }
          throw error;
        }
        watched.set(el, callbacks);
      }
      // A wrapper gives duplicate registrations independent teardown.
      const deliver = (entry: Entry): void => callback(entry);
      const registered = callbacks;
      registered.add(deliver);
      let active = true;
      return () => {
        if (!active) return;
        active = false;
        registered.delete(deliver);
        if (registered.size !== 0) return;
        watched.delete(el);
        observer.unobserve(el);
        if (watched.size === 0) {
          observer.disconnect();
          onEmpty();
        }
      };
    },
  };
}

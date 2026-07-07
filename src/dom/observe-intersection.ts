// observeIntersection(el, cb, options?) — viewport/root intersection with node lifetime: the
// callback runs on the IntersectionObserver clock (including the spec's initial delivery on
// attach) and detaches when the node is torn down. Returns a Stop for early manual detach.
//
// Pooling: observers with the same rootMargin/threshold and the default (viewport) root are
// shared, routed per entry.target. A custom `root` gets a dedicated observer per call — roots are
// objects and rare enough that keying pools on them buys nothing.
import type { Stop } from "../loom.js";
import { onUnmount } from "./index.js";
import { once } from "./once.js";

export type IntersectionCallback = (entry: IntersectionObserverEntry) => void;

export interface IntersectionOptions {
  readonly root?: Element | Document | null;
  readonly rootMargin?: string;
  readonly threshold?: number | readonly number[];
}

interface Pool {
  readonly observer: IntersectionObserver;
  readonly watched: Map<Element, Set<IntersectionCallback>>;
}

const pools = new Map<string, Pool>();

function poolKey(options?: IntersectionOptions): string {
  const threshold = options?.threshold;
  return `${options?.rootMargin ?? ""}|${Array.isArray(threshold) ? threshold.join(",") : (threshold ?? 0)}`;
}

function pooled(
  el: Element,
  cb: IntersectionCallback,
  key: string,
  options?: IntersectionOptions,
): Stop {
  let pool = pools.get(key);
  if (!pool) {
    const watched = new Map<Element, Set<IntersectionCallback>>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const callbacks = watched.get(entry.target);
          if (!callbacks) continue;
          for (const fn of callbacks) fn(entry);
        }
      },
      {
        rootMargin: options?.rootMargin ?? "0px",
        threshold: (options?.threshold ?? 0) as number | number[],
      },
    );
    pool = { observer, watched };
    pools.set(key, pool);
  }
  let callbacks = pool.watched.get(el);
  if (!callbacks) {
    callbacks = new Set();
    pool.watched.set(el, callbacks);
    pool.observer.observe(el);
  }
  callbacks.add(cb);
  return once(() => {
    const current = pools.get(key);
    if (!current) return;
    const set = current.watched.get(el);
    if (!set) return;
    set.delete(cb);
    if (set.size === 0) {
      current.watched.delete(el);
      current.observer.unobserve(el);
      if (current.watched.size === 0) {
        current.observer.disconnect();
        pools.delete(key);
      }
    }
  });
}

export function observeIntersection(
  el: Element,
  cb: IntersectionCallback,
  options?: IntersectionOptions,
): Stop {
  let stop: Stop;
  if (options?.root != null) {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) cb(entry);
      },
      {
        root: options.root,
        rootMargin: options.rootMargin ?? "0px",
        threshold: (options.threshold ?? 0) as number | number[],
      },
    );
    observer.observe(el);
    stop = once(() => observer.disconnect());
  } else {
    stop = pooled(el, cb, poolKey(options), options);
  }
  onUnmount(el, stop);
  return stop;
}

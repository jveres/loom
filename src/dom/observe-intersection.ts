// observeIntersection(el, cb, options?) — viewport/root intersection with node lifetime: the
// callback runs on the IntersectionObserver clock (including the spec's initial delivery on
// attach) and detaches when the node is torn down. Returns a Stop for early manual detach.
//
// Pooling: observers with the same root/rootMargin/threshold are shared and routed per target.
// Viewport pools use a normal Map; custom roots use a WeakMap so pooling never extends root lifetime.
import type { Stop } from "../loom.js";
import { once } from "./once.js";
import { onUnmount } from "./ownership-base.js";

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

const viewportPools = new Map<string, Pool>();
const rootedPools = new WeakMap<Element | Document, Map<string, Pool>>();

interface NormalizedOptions {
  readonly rootMargin: string;
  readonly threshold: number | number[];
}

function normalizeMargin(value = "0px"): string {
  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) =>
      /^[+-]?0(?:\.0+)?(?:[a-z%]+)?$/i.test(part) ? "0px" : part,
    );
  const [top = "0px", right = top, bottom = top, left = right] =
    parts.length === 3
      ? [parts[0], parts[1], parts[2], parts[1]]
      : parts.length === 2
        ? [parts[0], parts[1], parts[0], parts[1]]
        : parts;
  return `${top} ${right} ${bottom} ${left}`;
}

function normalizeOptions(options?: IntersectionOptions): NormalizedOptions {
  const raw = options?.threshold;
  const values = (typeof raw === "number" ? [raw] : raw ? [...raw] : [0]).sort(
    (a, b) => a - b,
  );
  if (values.length === 0) values.push(0);
  const unique = values.filter((value, index) => value !== values[index - 1]);
  return {
    rootMargin: normalizeMargin(options?.rootMargin),
    threshold: unique.length === 1 ? (unique[0] ?? 0) : unique,
  };
}

function poolKey(options: NormalizedOptions): string {
  const threshold = options.threshold;
  return `${options.rootMargin}|${Array.isArray(threshold) ? threshold.join(",") : threshold}`;
}

function poolsFor(root: Element | Document | null): Map<string, Pool> {
  if (root === null) return viewportPools;
  let pools = rootedPools.get(root);
  if (!pools) {
    pools = new Map();
    rootedPools.set(root, pools);
  }
  return pools;
}

function pooled(
  el: Element,
  cb: IntersectionCallback,
  root: Element | Document | null,
  pools: Map<string, Pool>,
  key: string,
  options: NormalizedOptions,
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
        root,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
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
        if (root !== null && pools.size === 0) rootedPools.delete(root);
      }
    }
  });
}

export function observeIntersection(
  el: Element,
  cb: IntersectionCallback,
  options?: IntersectionOptions,
): Stop {
  const root = options?.root ?? null;
  const normalized = normalizeOptions(options);
  const pools = poolsFor(root);
  const stop = pooled(el, cb, root, pools, poolKey(normalized), normalized);
  return onUnmount(el, stop);
}

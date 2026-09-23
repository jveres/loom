import { failSetup } from "../core/lifetime.js";
// observeIntersection(el, cb, options?) — viewport/root intersection with node lifetime: the
// callback runs on the IntersectionObserver clock (including the spec's initial delivery on
// attach) and detaches when the node is torn down. Returns a Stop for early manual detach.
//
// Pooling: observers with the same root/rootMargin/threshold are shared and routed per target.
// Viewport pools use a normal Map; custom roots use a WeakMap so pooling never extends root lifetime.
import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";
import { type ObserverPool, observerPool } from "./observer-pool.js";

export type IntersectionCallback = (entry: IntersectionObserverEntry) => void;

export interface ObserveIntersectionOptions {
  readonly signal?: AbortSignal;
  readonly root?: Element | Document | null;
  readonly rootMargin?: string;
  readonly threshold?: number | readonly number[];
}

type Pool = ObserverPool<IntersectionObserverEntry>;

const viewportPools = new WeakMap<object, Map<string, Pool>>();
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

function normalizeOptions(
  options?: ObserveIntersectionOptions,
): NormalizedOptions {
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

function poolsFor(
  root: Element | Document | null,
  realm: object,
): Map<string, Pool> {
  if (root === null) {
    let pools = viewportPools.get(realm);
    if (!pools) {
      pools = new Map();
      viewportPools.set(realm, pools);
    }
    return pools;
  }
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
    const realm = el.ownerDocument.defaultView ?? globalThis;
    const IO = (realm as typeof globalThis).IntersectionObserver;
    pool = observerPool(
      (dispatch) =>
        new IO(dispatch, {
          root,
          rootMargin: options.rootMargin,
          threshold: options.threshold,
        }),
      (observer, target) => observer.observe(target),
      () => {
        pools.delete(key);
        if (root !== null && pools.size === 0) rootedPools.delete(root);
      },
    );
    pools.set(key, pool);
  }
  return pool.add(el, cb);
}

export function observeIntersection(
  el: Element,
  cb: IntersectionCallback,
  options?: ObserveIntersectionOptions,
): Stop {
  const life = nodeLifetime(el, options?.signal);
  if (!life.active) return life.stop;
  const root = options?.root ?? null;
  const normalized = normalizeOptions(options);
  const pools = poolsFor(root, el.ownerDocument.defaultView ?? globalThis);
  try {
    life.add(pooled(el, cb, root, pools, poolKey(normalized), normalized));
  } catch (error) {
    failSetup(life, error);
  }
  return life.stop;
}

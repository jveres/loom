import { failSetup } from "../core/lifetime.js";
import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";
import { type ObserverPool, observerPool } from "./observer-pool.js";

export type SizeCallback = (entry: ResizeObserverEntry) => void;
export interface ObserveSizeOptions extends ResizeObserverOptions {
  readonly signal?: AbortSignal;
}
type Pool = ObserverPool<ResizeObserverEntry>;
const realms = new WeakMap<object, Map<ResizeObserverBoxOptions, Pool>>();

/** @internal Connection-owned observation, independent of node disposal. */
export function connectSize(
  el: Element,
  callback: SizeCallback,
  options?: ResizeObserverOptions,
): Stop {
  const realm = el.ownerDocument.defaultView ?? globalThis;
  const box = options?.box ?? "content-box";
  let pools = realms.get(realm);
  if (!pools) {
    pools = new Map();
    realms.set(realm, pools);
  }
  let pool = pools.get(box);
  if (!pool) {
    const RO = (realm as typeof globalThis).ResizeObserver;
    pool = observerPool(
      (dispatch) => new RO(dispatch),
      (observer, target) => observer.observe(target, { box }),
      () => {
        pools.delete(box);
        if (pools.size === 0) realms.delete(realm);
      },
    );
    pools.set(box, pool);
  }
  return pool.add(el, callback);
}

export function observeSize(
  el: Element,
  callback: SizeCallback,
  options?: ObserveSizeOptions,
): Stop {
  const life = nodeLifetime(el, options?.signal);
  if (life.active) {
    try {
      life.add(connectSize(el, callback, options));
    } catch (error) {
      failSetup(life, error);
    }
  }
  return life.stop;
}

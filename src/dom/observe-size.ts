import { failSetup } from "../core/lifetime.js";
import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";

export type SizeCallback = (entry: ResizeObserverEntry) => void;
export interface ObserveSizeOptions extends ResizeObserverOptions {
  readonly signal?: AbortSignal;
}
interface Pool {
  readonly observer: ResizeObserver;
  readonly watched: Map<Element, Set<SizeCallback>>;
}
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
    const watched = new Map<Element, Set<SizeCallback>>();
    const RO = (realm as typeof globalThis).ResizeObserver;
    const observer = new RO((entries) => {
      for (const entry of entries) {
        const callbacks = watched.get(entry.target);
        if (!callbacks) continue;
        for (const fn of [...callbacks])
          if (callbacks.has(fn)) untrack(() => fn(entry));
      }
    });
    pool = { observer, watched };
    pools.set(box, pool);
  }
  let callbacks = pool.watched.get(el);
  if (!callbacks) {
    callbacks = new Set();
    pool.observer.observe(el, { box });
    pool.watched.set(el, callbacks);
  }
  // A wrapper gives duplicate registrations independent teardown.
  const deliver: SizeCallback = (entry) => callback(entry);
  callbacks.add(deliver);
  let active = true;
  return () => {
    if (!active) return;
    active = false;
    callbacks.delete(deliver);
    if (callbacks.size !== 0) return;
    pool.watched.delete(el);
    pool.observer.unobserve(el);
    if (pool.watched.size === 0) {
      pool.observer.disconnect();
      pools.delete(box);
      if (pools.size === 0) realms.delete(realm);
    }
  };
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

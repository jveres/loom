import { untrack } from "./core/tracking.js";
// weakMemo(compute, version?) — a per-OBJECT memo: one value per key
// object, held weakly (a dropped key drops its entry), recomputed
// when `version` (any Read — a revision counter, a document version)
// moves. computed() memoizes one value; keyedStates keys by string;
// this is the shape for "the border outset of THIS element, until the
// document changes". Both computation and version reads are UNTRACKED — a
// lookup, never a subscription — so the memo is invalidated lazily and
// costs no effect.
import type { Read } from "./loom.js";

export function weakMemo<K extends object, V>(
  compute: (key: K) => V,
  version?: Read<unknown>,
): (key: K) => V {
  let cache = new WeakMap<K, V>();
  let stamp: unknown;
  let stamped = false;
  return (key) => {
    if (version) {
      const now = untrack(version);
      if (!stamped || now !== stamp) {
        stamped = true;
        stamp = now;
        cache = new WeakMap<K, V>();
      }
    }
    if (cache.has(key)) return cache.get(key) as V;
    const value = untrack(() => compute(key));
    cache.set(key, value);
    return value;
  };
}

// lens(source, key) — the derived writable over ONE MEMBER of a record
// or tuple signal: reads through `source()[key]` (tracked — a binding
// subscribes through the source), writes a COPY of the source with the
// member replaced (the source's identity moves, so every dependent of
// the whole record re-runs; an equal member is a no-op write). Form
// fields over a settings record, the halves of a pair — the three-line
// writable recipe, keyed.
import { type State, untrack, writable } from "./loom.js";

export function lens<T extends object, K extends keyof T>(
  source: State<T>,
  key: K,
): State<T[K]> {
  return writable(
    () => source()[key],
    (next) => {
      const current = untrack(() => source());
      if (Object.is(current[key], next)) return;
      const copy = (
        Array.isArray(current) ? current.slice() : { ...current }
      ) as T;
      copy[key] = next;
      source(copy);
    },
  );
}

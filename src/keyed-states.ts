// keyedStates(options?) — IDENTITY-keyed state that survives rebuilds:
// a pane torn down and rebuilt around the same entity asks
// `cell("fold:" + id, false)` and gets the cell it had. The model in
// one sentence: identity-keyed view state survives, instance-local
// state dies. Cells are created on first touch, seeded with the
// authored default — deviations only. A factory initial
// (`cell(key, () => persisted(...))`) lets a cell be persisted or any
// other State-shaped thing. `prune(match)` drops the cells of a dying
// identity (a deleted entity's folds and scroll offsets would otherwise
// live forever): a string matches keys containing it, a predicate
// decides per key.
import { type NodeOptions, type State, state } from "./loom.js";

export interface KeyedStates {
  /** The cell for `key`, created on first touch. */
  cell<T>(key: string, initial: T | (() => State<T>)): State<T>;
  /** Drop cells whose key matches; returns how many were dropped. */
  prune(match: string | ((key: string) => boolean)): number;
  /** Is there a cell for `key`? */
  has(key: string): boolean;
}

export function keyedStates(options: NodeOptions = {}): KeyedStates {
  const cells = new Map<string, State<unknown>>();
  return {
    cell<T>(key: string, initial: T | (() => State<T>)): State<T> {
      let found = cells.get(key);
      if (!found) {
        found =
          typeof initial === "function"
            ? ((initial as () => State<T>)() as State<unknown>)
            : state<unknown>(initial, {
                ...(options.label ? { label: `${options.label}.${key}` } : {}),
                ...(options.internal ? { internal: true } : {}),
              });
        cells.set(key, found);
      }
      return found as State<T>;
    },
    prune(match) {
      const test =
        typeof match === "string"
          ? (key: string): boolean => key.includes(match)
          : match;
      let dropped = 0;
      for (const key of cells.keys()) {
        if (test(key)) {
          cells.delete(key);
          dropped += 1;
        }
      }
      return dropped;
    },
    has: (key) => cells.has(key),
  };
}

// keyedStates(options?) — IDENTITY-keyed state that survives rebuilds:
// a pane torn down and rebuilt around the same entity asks
// `value("fold:" + id, false)` and gets the cell it had. The model in
// one sentence: identity-keyed view state survives, instance-local
// state dies. Cells are created on first touch, seeded with the
// authored default — deviations only. An explicit factory
// (`factory(key, () => persisted(...))`) lets a cell be persisted or any
// other State-shaped thing. `prune(match)` drops the cells of a dying
// identity (a deleted entity's folds and scroll offsets would otherwise
// live forever): a string matches keys containing it, a predicate
// decides per key.
import { type NodeOptions, type State, state } from "./loom.js";

export interface KeyedStates {
  /** @deprecated Use value() for literal values or factory() for state factories. */
  cell<T>(key: string, initial: T | (() => State<T>)): State<T>;
  /** Store a literal initial value, including a function. */
  value<T>(key: string, initial: T): State<T>;
  /** Create a state once, on first touch. */
  factory<T>(key: string, create: () => State<T>): State<T>;
  /** Drop cells whose key matches; returns how many were dropped. */
  prune(match: string | ((key: string) => boolean)): number;
  /** Is there a cell for `key`? */
  has(key: string): boolean;
}

export interface TypedKeyedStates<Schema extends object> {
  value<K extends Extract<keyof Schema, string>>(
    key: K,
    initial: NoInfer<Schema[K]>,
  ): State<Schema[K]>;
  factory<K extends Extract<keyof Schema, string>>(
    key: K,
    create: () => State<NoInfer<Schema[K]>>,
  ): State<Schema[K]>;
  prune(
    match: string | ((key: Extract<keyof Schema, string>) => boolean),
  ): number;
  has(key: Extract<keyof Schema, string>): boolean;
}

export function keyedStates(options?: NodeOptions): KeyedStates;
export function keyedStates<Schema extends object>(
  options?: NodeOptions,
): TypedKeyedStates<Schema>;
export function keyedStates(options: NodeOptions = {}): KeyedStates {
  const cells = new Map<string, State<unknown>>();
  const factory = <T>(key: string, create: () => State<T>): State<T> => {
    let found = cells.get(key);
    if (!found) {
      const created = create();
      if (typeof created !== "function")
        throw new TypeError("Keyed state factory must return a state.");
      found = created as State<unknown>;
      cells.set(key, found);
    }
    return found as State<T>;
  };
  const value = <T>(key: string, initial: T): State<T> =>
    factory(key, () =>
      state(initial, {
        ...(options.label ? { label: `${options.label}.${key}` } : {}),
        ...(options.internal ? { internal: true } : {}),
      }),
    );
  return {
    value,
    factory,
    cell<T>(key: string, initial: T | (() => State<T>)): State<T> {
      return typeof initial === "function"
        ? factory(key, initial as () => State<T>)
        : value(key, initial);
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

import { untrack } from "./core/tracking.js";
import { type NodeOptions, type State, state } from "./loom.js";

/** Identity-keyed states with an explicit key/value schema. */
export interface KeyedStates<Schema extends object> {
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

export function keyedStates<Schema extends object = never>(
  ...args: [Schema] extends [never]
    ? [schemaRequired: never]
    : [options?: NodeOptions]
): KeyedStates<Schema> {
  const options: NodeOptions = args[0] ?? {};
  type Key = Extract<keyof Schema, string>;
  const cells = new Map<Key, State<unknown>>();
  const factory = <K extends Key>(
    key: K,
    create: () => State<Schema[K]>,
  ): State<Schema[K]> => {
    let found = cells.get(key);
    if (!found) {
      const created = untrack(create);
      if (typeof created !== "function")
        throw new TypeError("Keyed state factory must return a state.");
      found = created as State<unknown>;
      cells.set(key, found);
    }
    return found as State<Schema[K]>;
  };
  return {
    factory,
    value: (key, initial) =>
      factory(key, () =>
        state(initial, {
          ...options,
          ...(options.label ? { label: `${options.label}.${key}` } : {}),
        }),
      ),
    prune(match) {
      const test =
        typeof match === "string"
          ? (key: Key): boolean => key.includes(match)
          : match;
      let count = 0;
      for (const key of cells.keys())
        if (untrack(() => test(key))) {
          cells.delete(key);
          count++;
        }
      return count;
    },
    has: (key) => cells.has(key),
  };
}

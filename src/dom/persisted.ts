// persisted(key, initial, options?) — a state cell backed by Storage: read-validate once at
// creation, write-through on every set. The cell IS a plain loom State (update()/watch()/bindings
// all compose); persistence is a watch() subscriber, so the initial load never writes back and
// unchanged sets don't touch storage. `validate` is the choke point a hand-rolled read/write pair
// never has — a corrupt, stale, or out-of-range stored value falls back to `initial` instead of
// leaking into the app (the class of bug where a persisted fractional position broke layout).
//
// Storage access is fully guarded: no localStorage (SSR, sandboxed frames, disabled cookies) or a
// throwing quota simply degrades to an unpersisted cell.
import { type NodeOptions, type State, state, watch } from "../loom.js";

export interface PersistedOptions<T> extends NodeOptions {
  /** Value → stored string. Default JSON.stringify. */
  readonly serialize?: (value: T) => string;
  /** Stored string → value. Default JSON.parse. A throw falls back to `initial`. */
  readonly parse?: (raw: string) => T;
  /** Gate on the LOADED value: return false to discard it and start from `initial`. */
  readonly validate?: (value: T) => boolean;
  /** Storage to use. Default localStorage (guarded — absent storage means no persistence). */
  readonly storage?: Storage;
}

function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined; // access itself can throw (sandboxed iframe, disabled cookies)
  }
}

export function persisted<T>(
  key: string,
  initial: T,
  options: PersistedOptions<T> = {},
): State<T> {
  const storage = options.storage ?? defaultStorage();
  const serialize = options.serialize ?? JSON.stringify;
  const parse = options.parse ?? (JSON.parse as (raw: string) => T);

  let value = initial;
  if (storage) {
    try {
      const raw = storage.getItem(key);
      if (raw !== null) {
        const loaded = parse(raw);
        if (options.validate?.(loaded) !== false) value = loaded;
      }
    } catch {
      /* unreadable or unparsable -> initial */
    }
  }

  const label = options.label ?? `persisted:${key}`;
  const cell = state(
    value,
    options.internal === undefined
      ? { label }
      : { label, internal: options.internal },
  );
  if (storage) {
    watch(cell, (next) => {
      try {
        storage.setItem(key, serialize(next));
      } catch {
        /* quota/permission: the cell still works, it just stops persisting */
      }
    });
  }
  return cell;
}

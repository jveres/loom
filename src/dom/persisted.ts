// persisted(key, initial, options?) — a state signal backed by Storage: read-validate once at
// creation, write-through on every set. The signal IS a plain loom State (update()/watch()/bindings
// all compose); persistence is a watch() subscriber, so the initial load never writes back and
// unchanged sets don't touch storage. `validate` is the choke point a hand-rolled read/write pair
// never has — a corrupt, stale, or out-of-range stored value falls back to `initial` instead of
// leaking into the app (the class of bug where a persisted fractional position broke layout).
//
// Storage access is fully guarded: no localStorage (SSR, sandboxed frames, disabled cookies) or a
// throwing quota simply degrades to an unpersisted signal.
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

/** The standard CODECS — pass one as `options` (or spread it under
 *  your own `label`/`validate`): the "1"/"0" boolean dialect, a finite
 *  number with an optional range, a string drawn from an allowed set. A
 *  hand-written serialize/parse/validate triple per call site drifts
 *  the stored format; these keep one dialect per kind. */
export const codecs = {
  boolean: {
    serialize: (v: boolean): string => (v ? "1" : "0"),
    parse: (raw: string): boolean => raw === "1",
    validate: (v: boolean): boolean => typeof v === "boolean",
  } satisfies PersistedOptions<boolean>,
  number: (range: { min?: number; max?: number } = {}) =>
    ({
      serialize: String,
      parse: Number,
      validate: (v: number): boolean =>
        Number.isFinite(v) &&
        (range.min === undefined || v >= range.min) &&
        (range.max === undefined || v <= range.max),
    }) satisfies PersistedOptions<number>,
  string: <T extends string>(allowed?: readonly T[]) =>
    ({
      serialize: (v: T): string => v,
      parse: (raw: string): T => raw as T,
      validate: (v: T): boolean =>
        allowed === undefined || (allowed as readonly string[]).includes(v),
    }) satisfies PersistedOptions<T>,
} as const;

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
  const signal = state(
    value,
    options.internal === undefined
      ? { label }
      : { label, internal: options.internal },
  );
  if (storage) {
    watch(signal, (next) => {
      try {
        storage.setItem(key, serialize(next));
      } catch {
        /* quota/permission: the signal still works, it just stops persisting */
      }
    });
  }
  return signal;
}

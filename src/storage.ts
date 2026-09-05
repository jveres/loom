import { failSetup, lifetime } from "./core/lifetime.js";
import { untrack } from "./core/tracking.js";
import { detached, type State, type Stop, watch } from "./loom.js";

/** Explicit decoding is required at the storage boundary. */
export interface StorageSlotOptions<T> {
  readonly serialize?: (value: T) => string;
  readonly parse: (raw: string) => T;
  readonly validate?: (value: T) => boolean;
  readonly storage?: Storage;
}

export interface StorageSlot<T> {
  /** The stored value, or undefined: nothing stored, unparsable, or rejected by validate. */
  load(): T | undefined;
  /** Store the value; false when storage is absent or refused (quota, permission). */
  store(value: T): boolean;
  /** Remove the entry (guarded). */
  clear(): void;
}

export function storageSlot<T>(
  key: string,
  options: StorageSlotOptions<T>,
): StorageSlot<T> {
  const storage = options.storage ?? defaultStorage();
  const serialize = options.serialize ?? JSON.stringify;
  const parse = options.parse;
  return {
    load() {
      if (!storage) return undefined;
      try {
        const raw = storage.getItem(key);
        if (raw === null) return undefined;
        const loaded = parse(raw);
        return options.validate?.(loaded) === false ? undefined : loaded;
      } catch {
        return undefined;
      }
    },
    store(value) {
      if (!storage) return false;
      try {
        const raw = serialize(value);
        if (typeof raw !== "string") return false;
        storage.setItem(key, raw);
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        storage?.removeItem(key);
      } catch {
        /* absent or refusing storage: nothing to clear */
      }
    },
  };
}

function stringCodec(): StorageSlotOptions<string>;
function stringCodec<T extends string>(
  allowed: readonly T[],
): StorageSlotOptions<T>;
function stringCodec(allowed?: readonly string[]): StorageSlotOptions<string> {
  return {
    serialize: (value) => value,
    parse: (raw) => raw,
    validate: (value) => allowed === undefined || allowed.includes(value),
  };
}

/** Decoders reject invalid storage data. Spread a codec to select storage. */
export const codecs = {
  json: <T>(
    validate: (value: unknown) => value is T,
  ): StorageSlotOptions<T> => ({
    serialize: JSON.stringify,
    parse(raw) {
      const value: unknown = JSON.parse(raw);
      if (!validate(value)) throw new TypeError("Invalid stored JSON value.");
      return value;
    },
  }),
  boolean: {
    serialize: (v: boolean): string => (v ? "1" : "0"),
    parse: (raw: string): boolean => {
      if (raw !== "0" && raw !== "1")
        throw new TypeError("Invalid stored boolean.");
      return raw === "1";
    },
    validate: (v: boolean): boolean => typeof v === "boolean",
  } satisfies StorageSlotOptions<boolean>,
  number: (range: { min?: number; max?: number } = {}) =>
    ({
      serialize: String,
      parse: (raw: string): number => {
        if (raw.trim() === "") throw new TypeError("Invalid stored number.");
        return Number(raw);
      },
      validate: (v: number): boolean =>
        Number.isFinite(v) &&
        (range.min === undefined || v >= range.min) &&
        (range.max === undefined || v <= range.max),
    }) satisfies StorageSlotOptions<number>,
  string: stringCodec,
} as const;

function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined; // access itself can throw (sandboxed iframe, disabled cookies)
  }
}

export interface BindStorageOptions {
  readonly signal?: AbortSignal;
  readonly delayMs?: number;
}
export interface StorageBinding {
  /** Attempt the pending write now. True means no pending write or a successful write. */
  readonly flush: () => boolean;
  readonly stop: Stop;
}
/** Load once without write-back, then persist changes for this explicit lifetime. */
export function bindStorage<T>(
  cell: State<T>,
  slot: StorageSlot<NoInfer<T>>,
  options: BindStorageOptions = {},
): StorageBinding {
  const delayMs = options.delayMs ?? 0;
  if (!Number.isFinite(delayMs) || delayMs < 0)
    throw new RangeError("Storage delay must be finite and non-negative.");
  const life = lifetime(options.signal);
  let pending = false;
  let latest!: T;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  const flush = (): boolean => {
    if (!life.active || !pending) return true;
    clear();
    pending = false;
    return untrack(() => slot.store(latest));
  };
  life.add(() => {
    pending = false;
    clear();
  });
  if (life.active) {
    try {
      detached(() => {
        const loaded = slot.load();
        if (loaded !== undefined && life.active) cell(loaded);
        if (!life.active) return;
        life.add(
          watch(
            () => cell(),
            (value) => {
              if (!life.active) return;
              latest = value;
              pending = true;
              clear();
              if (delayMs === 0) flush();
              else timer = setTimeout(flush, delayMs);
            },
          ),
        );
      });
    } catch (error) {
      failSetup(life, error);
    }
  }
  return { flush, stop: life.stop };
}

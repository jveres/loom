import { isPromiseLike } from "../core/errors.js";
import type {
  DbKey,
  Scan,
  Schema,
  StoreName,
  WriteTransaction,
} from "./types.js";

/** A callback outlived its native transaction. Never retry a committed write. */
export class TransactionContractError extends Error {
  readonly committed: boolean;
  constructor(message: string, committed: boolean, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransactionContractError";
    this.committed = committed;
  }
}

export function storeNames<N extends string>(stores: readonly N[]): N[] {
  if (
    !Array.isArray(stores) ||
    stores.length === 0 ||
    stores.some((name) => typeof name !== "string")
  )
    throw new TypeError("Declare a nonempty array of store names");
  return [...new Set(stores)];
}

function key(value: DbKey, parents = new Set<unknown>()): IDBValidKey {
  if (
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  )
    return value;
  if (!Array.isArray(value) || parents.has(value))
    throw new TypeError("Expected a finite number, string, or compound key");
  parents.add(value);
  const result = Array.from(value, (part) => key(part, parents));
  parents.delete(value);
  return result;
}

function scanOptions(options: Scan<DbKey>): {
  range: IDBKeyRange | undefined;
  direction: IDBCursorDirection;
  limit: number;
} {
  if (!options || !Number.isSafeInteger(options.limit) || options.limit < 1)
    throw new RangeError("Scan limit must be a positive safe integer");
  const direction = options.direction ?? "next";
  if (direction !== "next" && direction !== "prev")
    throw new TypeError("Scan direction must be next or prev");
  const range = options.range;
  if (range === undefined)
    return { range: undefined, direction, limit: options.limit };
  if (!range || typeof range !== "object")
    throw new TypeError("Invalid key range");
  let native: IDBKeyRange | undefined;
  if ("only" in range) {
    if (
      ["lower", "upper", "lowerOpen", "upperOpen"].some((name) => name in range)
    )
      throw new TypeError("Exact and bounded ranges cannot be combined");
    native = IDBKeyRange.only(key(range.only as DbKey));
  } else {
    const { lower, upper, lowerOpen, upperOpen } = range;
    if (
      (lowerOpen !== undefined &&
        (typeof lowerOpen !== "boolean" || lower === undefined)) ||
      (upperOpen !== undefined &&
        (typeof upperOpen !== "boolean" || upper === undefined))
    )
      throw new TypeError("Open flags require their bound");
    if (lower !== undefined && upper !== undefined)
      native = IDBKeyRange.bound(key(lower), key(upper), lowerOpen, upperOpen);
    else if (lower !== undefined)
      native = IDBKeyRange.lowerBound(key(lower), lowerOpen);
    else if (upper !== undefined)
      native = IDBKeyRange.upperBound(key(upper), upperOpen);
  }
  return { range: native, direction, limit: options.limit };
}

// The facade owns failure and completion. No native handle escapes the callback.
export function transact<S extends Schema<S>, N extends StoreName<S>, T>(
  database: IDBDatabase,
  names: N[],
  mode: IDBTransactionMode,
  body: (tx: WriteTransaction<S, N>) => T | Promise<T>,
  committed: (stores: readonly string[]) => void,
  settled: () => void,
  signal?: AbortSignal,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let native: IDBTransaction;
    // The handle validates and snapshots names before retaining ownership.
    try {
      signal?.throwIfAborted();
      native = database.transaction(names, mode);
    } catch (error) {
      settled();
      reject(error);
      return;
    }
    let finished = false;
    let bodyDone = false;
    let failed = false;
    let failure: unknown;
    let value: T;
    const changed = new Set<string>();
    const fail = (error: unknown) => {
      if (!failed) {
        failed = true;
        failure = error;
      }
      if (!finished) {
        try {
          native.abort();
        } catch {
          /* Completion has already made rollback impossible. */
        }
      }
    };
    // Only reactive readonly calls supply a signal. Imperative writes always drain.
    const abort = () => fail(signal?.reason);
    signal?.addEventListener("abort", abort, { once: true });
    const finish = () => {
      finished = true;
      signal?.removeEventListener("abort", abort);
      settled();
    };
    const ensure = () => {
      if (finished || bodyDone || failed)
        throw new DOMException(
          "Transaction callback is no longer active",
          "TransactionInactiveError",
        );
    };
    const attempt = <R>(run: () => R): R => {
      try {
        ensure();
        return run();
      } catch (error) {
        fail(error);
        throw error;
      }
    };
    // Observe rejections even when callers omit await; transaction outcome still fails.
    const observed = <R>(promise: Promise<R>): Promise<R> => {
      void promise.catch(() => undefined);
      return promise;
    };
    const request = <R>(
      create: () => IDBRequest<R>,
      name?: string,
    ): Promise<R> =>
      observed(
        new Promise<R>((res, rej) => {
          try {
            const req = attempt(create);
            if (name !== undefined) changed.add(name);
            req.onsuccess = () => res(req.result);
            req.onerror = (event) => {
              event.preventDefault();
              const error =
                req.error ?? new DOMException("Request failed", "UnknownError");
              fail(error);
              rej(error);
            };
          } catch (error) {
            rej(error);
          }
        }),
      );
    const reader = (source: IDBObjectStore | IDBIndex) => {
      // One bounded cursor loop; each read chooses its cursor and row shape.
      const scan = <C extends IDBCursor>(
        options: Scan<DbKey>,
        open: (
          range: IDBKeyRange | undefined,
          direction: IDBCursorDirection,
        ) => IDBRequest<C | null>,
        row: (cursor: C) => unknown,
      ) =>
        observed(
          new Promise<readonly unknown[]>((res, rej) => {
            try {
              const spec = attempt(() => scanOptions(options));
              const req = attempt(() => open(spec.range, spec.direction));
              const rows: unknown[] = [];
              req.onerror = (event) => {
                event.preventDefault();
                const error = req.error;
                fail(error);
                rej(error);
              };
              req.onsuccess = () => {
                try {
                  const cursor = req.result;
                  if (!cursor) {
                    res(rows);
                    return;
                  }
                  rows.push(row(cursor));
                  if (rows.length === spec.limit) res(rows);
                  else cursor.continue();
                } catch (error) {
                  fail(error);
                  rej(error);
                }
              };
            } catch (error) {
              rej(error);
            }
          }),
        );
      const values = (
        range: IDBKeyRange | undefined,
        direction: IDBCursorDirection,
      ) => source.openCursor(range, direction);
      return {
        scan: (options: Scan<DbKey>) =>
          scan(options, values, (cursor) => cursor.value),
        entries: (options: Scan<DbKey>) =>
          scan(options, values, (cursor) => ({
            key: cursor.primaryKey,
            value: cursor.value,
          })),
        // A key cursor never loads or clones the record values.
        keys: (options: Scan<DbKey>) =>
          scan(
            options,
            (range, direction) => source.openKeyCursor(range, direction),
            (cursor) => cursor.primaryKey,
          ),
      };
    };
    const facade = {
      store(name: N) {
        return attempt(() => {
          if (!names.includes(name))
            throw new DOMException(
              "Store is outside the transaction scope",
              "NotFoundError",
            );
          const store = native.objectStore(name);
          if (store.keyPath !== null || store.autoIncrement)
            throw new DOMException(
              "Stores require explicit out-of-line keys",
              "InvalidAccessError",
            );
          return {
            ...reader(store),
            get: (id: DbKey) => request(() => store.get(key(id))),
            index: (index: string) => attempt(() => reader(store.index(index))),
            ...(mode === "readwrite"
              ? {
                  put: (id: DbKey, record: unknown) =>
                    observed(
                      request(() => store.put(record, key(id)), name).then(
                        () => undefined,
                      ),
                    ),
                  delete: (id: DbKey) =>
                    request(() => store.delete(key(id)), name),
                  clear: () => request(() => store.clear(), name),
                }
              : {}),
          };
        });
      },
    } as unknown as WriteTransaction<S, N>;
    native.onabort = () => {
      finish();
      reject(
        failed
          ? failure
          : (native.error ??
              new DOMException("Transaction aborted", "AbortError")),
      );
    };
    native.oncomplete = () => {
      finished = true;
      try {
        // Notification failures cannot change the durable outcome.
        if (changed.size) {
          try {
            committed([...changed]);
          } catch {
            /* Listener isolation. */
          }
        }
        if (!bodyDone)
          reject(
            new TransactionContractError(
              "Callback outlived the native transaction; await only its requests",
              true,
            ),
          );
        else if (failed)
          reject(
            new TransactionContractError(
              "Callback failed after the native transaction committed",
              true,
              { cause: failure },
            ),
          );
        else resolve(value);
      } finally {
        finish();
      }
    };
    try {
      const result = body(facade);
      if (isPromiseLike(result)) {
        void Promise.resolve(result).then(
          (next) => {
            value = next;
            bodyDone = true;
          },
          (error) => {
            bodyDone = true;
            fail(error);
          },
        );
      } else {
        value = result;
        bodyDone = true;
      }
    } catch (error) {
      bodyDone = true;
      fail(error);
    }
  });
}

import { type Resource, resource } from "../async/index.js";
import { ignorePromiseRejection, isPromiseLike } from "../core/errors.js";
import { effect, scope, source, state, untrack } from "../loom.js";
import { modeRead, notifications } from "./notifications.js";
import { storeNames, transact } from "./transaction.js";
import type {
  Database,
  DatabaseOptions,
  ReadTransaction,
  Schema,
  StoreName,
  WriteTransaction,
} from "./types.js";

export { TransactionContractError } from "./transaction.js";
export type {
  Database,
  DatabaseOptions,
  DbEntry,
  DbKey,
  IndexRead,
  KeyRange,
  ReadStore,
  ReadTransaction,
  Scan,
  Schema,
  StoreName,
  StoreShape,
  WriteStore,
  WriteTransaction,
} from "./types.js";

function closedError(): DOMException {
  return new DOMException("Database connection is closed", "InvalidStateError");
}

function handle<S extends Schema<S>>(native: IDBDatabase): Database<S> {
  const connection = state<"open" | "closed" | "versionchange" | "terminated">(
    "open",
  );
  const bus = notifications(native.name);
  const release = bus.retain();
  let open = true;
  const closed = closedError();
  const disconnectors = new Set<() => void>();
  const close = (reason: "closed" | "versionchange" | "terminated") => {
    if (!open) return;
    open = false;
    native.close();
    native.onversionchange = null;
    native.onclose = null;
    for (const disconnect of disconnectors) disconnect();
    disconnectors.clear();
    release();
    // Always finish native/resource cleanup before user reactive observers run.
    try {
      connection(reason);
    } catch {
      /* Observers cannot keep a native handle open. */
    }
  };
  native.onversionchange = () => close("versionchange");
  native.onclose = () => close("terminated");

  const run = <N extends StoreName<S>, T>(
    stores: readonly N[],
    mode: "readonly" | "readwrite",
    body: (tx: WriteTransaction<S, N>) => T | Promise<T>,
  ) => {
    if (!open) return Promise.reject(closedError());
    let names: N[];
    try {
      names = storeNames(stores) as N[];
    } catch (error) {
      return Promise.reject(error);
    }
    // Every admitted transaction keeps the notification bus alive through commit.
    const done = bus.retain();
    return transact(
      native,
      names,
      mode,
      body,
      (changed) => bus.commit(native.version, changed),
      done,
    );
  };

  return {
    connection: () => connection(),
    crossTab: modeRead(bus),
    read: (stores, body) => untrack(() => run(stores, "readonly", body)),
    write: (stores, body) => untrack(() => run(stores, "readwrite", body)),
    query<N extends StoreName<S>, T>(
      stores: readonly N[],
      body: (tx: ReadTransaction<S, N>) => T | Promise<T>,
    ) {
      const names = storeNames(stores) as N[];
      let result!: Resource<T>;
      const owner = scope(
        () => {
          let revision = 0;
          const invalidation = source<number>((set) => {
            set(++revision); // Reconnect always refreshes, even after missed events.
            if (!open) return () => {};
            const unsubscribe = bus.subscribe(new Set(names), () =>
              set(++revision),
            );
            const disconnect = () => {
              unsubscribe();
              disconnectors.delete(disconnect);
            };
            disconnectors.add(disconnect);
            return disconnect;
          }, 0);
          result = resource<T>(() => {
            // Read connection first: closing detaches the invalidation dependency.
            if (connection() !== "open") return Promise.reject(closedError());
            invalidation(); // Subscribe before starting the snapshot transaction.
            return run(names, "readonly", body).then((value) => {
              if (!open) throw closedError();
              return value;
            });
          });
        },
        { internal: true },
      );
      const lifetime = effect(() => () => owner.stop(), { internal: true });
      return Object.assign(() => result(), {
        loading: () => connection() === "open" && result.loading(),
        ready: result.ready,
        error: () => (connection() === "open" ? result.error() : closed),
        refresh: result.refresh,
        stop: () => {
          lifetime();
          owner.stop();
        },
      });
    },
    refresh() {
      if (open) bus.invalidate();
    },
    close: () => close("closed"),
  };
}

/** Open an explicitly owned database. Importing this module installs nothing. */
export function openDatabase<S extends Schema<S>>(
  options: DatabaseOptions,
): Promise<Database<S>> {
  return new Promise((resolve, reject) => {
    if (
      !options ||
      typeof options.name !== "string" ||
      !Number.isSafeInteger(options.version) ||
      options.version < 1
    ) {
      reject(
        new TypeError(
          "Database name and positive safe integer version are required",
        ),
      );
      return;
    }
    const { signal } = options;
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      if (typeof indexedDB === "undefined")
        throw new DOMException("IndexedDB is unavailable", "NotSupportedError");
      request = indexedDB.open(options.name, options.version);
    } catch (error) {
      reject(error);
      return;
    }
    let cancelled = false;
    const cleanup = () => signal?.removeEventListener("abort", abort);
    const cancel = (error: unknown) => {
      if (cancelled) return;
      cancelled = true;
      cleanup();
      try {
        request.transaction?.abort();
      } catch {
        /* An already committed upgrade cannot be undone. */
      }
      reject(error);
    };
    const abort = () => cancel(signal?.reason);
    signal?.addEventListener("abort", abort, { once: true });
    request.onerror = () => {
      cleanup();
      reject(request.error);
    };
    request.onblocked = (event) => {
      if (cancelled) return;
      try {
        const result: unknown = untrack(() =>
          options.onBlocked?.(event.oldVersion, options.version),
        );
        if (isPromiseLike(result)) {
          ignorePromiseRejection(result);
          throw new TypeError("Blocked observers must be synchronous");
        }
      } catch (error) {
        cancel(error);
      }
    };
    request.onupgradeneeded = (event) => {
      if (cancelled) {
        request.transaction?.abort();
        return;
      }
      try {
        const transaction = request.transaction;
        if (!transaction)
          throw new DOMException(
            "Upgrade transaction is missing",
            "InvalidStateError",
          );
        const result: unknown = untrack(() =>
          options.upgrade?.(
            request.result,
            event.oldVersion,
            options.version,
            transaction,
          ),
        );
        if (isPromiseLike(result)) {
          ignorePromiseRejection(result);
          throw new TypeError("Upgrade callbacks must be synchronous");
        }
      } catch (error) {
        cancel(error);
      }
    };
    request.onsuccess = () => {
      cleanup();
      if (cancelled || signal?.aborted) {
        request.result.close();
        if (!cancelled) reject(signal?.reason);
        return;
      }
      try {
        resolve(handle<S>(request.result));
      } catch (error) {
        request.result.close();
        reject(error);
      }
    };
  });
}

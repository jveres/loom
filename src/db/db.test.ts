import { openDatabase } from "loom/db";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllGlobals());

describe("database opening", () => {
  it("should reject unavailable IndexedDB without installing a fallback", async () => {
    vi.stubGlobal("indexedDB", undefined);
    await expect(
      openDatabase({ name: "synthetic", version: 1 }),
    ).rejects.toMatchObject({ name: "NotSupportedError" });
  });

  it.each([0, -1, 1.5, Infinity, NaN])(
    "should reject invalid version %s before opening",
    async (version) => {
      const open = vi.fn();
      vi.stubGlobal("indexedDB", { open });
      await expect(
        openDatabase({ name: "synthetic", version }),
      ).rejects.toBeInstanceOf(TypeError);
      expect(open).not.toHaveBeenCalled();
    },
  );

  it("should preserve an already aborted signal's reason without opening", async () => {
    const open = vi.fn();
    vi.stubGlobal("indexedDB", { open });
    const reason = new Error("cancelled");
    await expect(
      openDatabase({
        name: "synthetic",
        version: 1,
        signal: AbortSignal.abort(reason),
      }),
    ).rejects.toBe(reason);
    expect(open).not.toHaveBeenCalled();
  });

  it("should preserve a denied-storage error", async () => {
    const reason = new DOMException("Storage denied", "SecurityError");
    vi.stubGlobal("indexedDB", {
      open: () => {
        throw reason;
      },
    });
    await expect(openDatabase({ name: "synthetic", version: 1 })).rejects.toBe(
      reason,
    );
  });

  it("should close late success after cancellation while blocked", async () => {
    const close = vi.fn();
    const request = {
      result: { close },
      transaction: null,
    } as unknown as IDBOpenDBRequest;
    vi.stubGlobal("indexedDB", { open: () => request });
    const controller = new AbortController();
    const pending = openDatabase({
      name: "synthetic",
      version: 1,
      signal: controller.signal,
    });
    controller.abort("cancelled");
    await expect(pending).rejects.toBe("cancelled");
    request.onsuccess?.call(request, new Event("success"));
    expect(close).toHaveBeenCalledOnce();
  });

  it("should close late success after the blocked observer throws", async () => {
    const close = vi.fn();
    const request = {
      result: { close },
      transaction: null,
    } as unknown as IDBOpenDBRequest;
    vi.stubGlobal("indexedDB", { open: () => request });
    const reason = new Error("observer failed");
    const pending = openDatabase({
      name: "synthetic",
      version: 2,
      onBlocked: () => {
        throw reason;
      },
    });
    request.onblocked?.call(request, {
      oldVersion: 1,
    } as IDBVersionChangeEvent);
    await expect(pending).rejects.toBe(reason);
    request.onsuccess?.call(request, new Event("success"));
    expect(close).toHaveBeenCalledOnce();
  });

  it("should reject an async blocked observer and close late success", async () => {
    const close = vi.fn();
    const request = {
      result: { close },
      transaction: null,
    } as unknown as IDBOpenDBRequest;
    vi.stubGlobal("indexedDB", { open: () => request });
    const pending = openDatabase({
      name: "synthetic",
      version: 2,
      onBlocked: async () => {
        throw new Error("async observer");
      },
    });
    request.onblocked?.call(request, {
      oldVersion: 1,
    } as IDBVersionChangeEvent);
    await expect(pending).rejects.toBeInstanceOf(TypeError);
    request.onsuccess?.call(request, new Event("success"));
    expect(close).toHaveBeenCalledOnce();
  });

  it("should abort and observe a mistakenly asynchronous upgrade", async () => {
    const abort = vi.fn();
    const request = {
      result: {},
      transaction: { abort },
    } as unknown as IDBOpenDBRequest;
    vi.stubGlobal("indexedDB", { open: () => request });
    const pending = openDatabase({
      name: "synthetic",
      version: 1,
      // @ts-expect-error Upgrade callbacks must be synchronous.
      upgrade: async () => {
        throw new Error("async upgrade");
      },
    });
    request.onupgradeneeded?.call(request, {
      oldVersion: 0,
    } as IDBVersionChangeEvent);
    await expect(pending).rejects.toBeInstanceOf(TypeError);
    expect(abort).toHaveBeenCalledOnce();
  });
});

describe("database transaction settlement", () => {
  it("should report committed callback failure when native rollback is no longer possible", async () => {
    const reason = new Error("callback failed after commit");
    const transaction = {
      abort: () => {
        throw new DOMException("Already committed", "InvalidStateError");
      },
    } as unknown as IDBTransaction;
    const native = {
      name: "settlement-fixture",
      version: 1,
      close() {},
      transaction: () => transaction,
    };
    const request = { result: native } as unknown as IDBOpenDBRequest;
    vi.stubGlobal("indexedDB", { open: () => request });
    vi.stubGlobal("BroadcastChannel", undefined);
    const opening = openDatabase<{
      items: { key: string; value: string; indexes: Record<never, never> };
    }>({ name: native.name, version: 1 });
    request.onsuccess?.call(request, new Event("success"));
    const db = await opening;
    try {
      const write = db.write(["items"], async () => {
        throw reason;
      });
      await Promise.resolve();
      transaction.oncomplete?.call(transaction, new Event("complete"));
      await expect(write).rejects.toMatchObject({
        name: "TransactionContractError",
        committed: true,
        cause: reason,
      });
    } finally {
      db.close();
    }
  });

  it("should read primary keys through a key cursor without loading values", async () => {
    const cursor = {
      result: null as unknown,
      onsuccess: null as (() => void) | null,
    };
    const store = {
      keyPath: null,
      autoIncrement: false,
      openCursor: vi.fn(),
      openKeyCursor: vi.fn(() => cursor),
    };
    const transaction = {
      objectStore: () => store,
      abort() {},
    } as unknown as IDBTransaction;
    const native = {
      name: "key-cursor-fixture",
      version: 1,
      close() {},
      transaction: () => transaction,
    };
    const request = { result: native } as unknown as IDBOpenDBRequest;
    vi.stubGlobal("indexedDB", { open: () => request });
    vi.stubGlobal("BroadcastChannel", undefined);
    const opening = openDatabase<{
      items: { key: string; value: string; indexes: Record<never, never> };
    }>({ name: native.name, version: 1 });
    request.onsuccess?.call(request, new Event("success"));
    const db = await opening;
    try {
      const reading = db.read(["items"], (tx) =>
        tx.store("items").keys({ direction: "prev", limit: 2 }),
      );
      const advance = vi.fn();
      for (const primaryKey of ["c", "b"]) {
        cursor.result = {
          primaryKey,
          get value(): never {
            throw new Error("A key read must not load values");
          },
          continue: advance,
        };
        cursor.onsuccess?.();
      }
      await new Promise((resolve) => setTimeout(resolve, 0));
      transaction.oncomplete?.call(transaction, new Event("complete"));
      await expect(reading).resolves.toEqual(["c", "b"]);
      expect(store.openKeyCursor).toHaveBeenCalledWith(undefined, "prev");
      expect(store.openCursor).not.toHaveBeenCalled();
      expect(advance).toHaveBeenCalledOnce();
    } finally {
      db.close();
    }
  });

  it("should finish closing even if notification transport cleanup throws", async () => {
    vi.stubGlobal(
      "BroadcastChannel",
      class {
        close() {
          throw new Error("Transport cleanup failed");
        }
      },
    );
    const native = { name: "close-fixture", version: 1, close() {} };
    const request = { result: native } as unknown as IDBOpenDBRequest;
    vi.stubGlobal("indexedDB", { open: () => request });
    const opening = openDatabase<{
      items: { key: string; value: string; indexes: Record<never, never> };
    }>({ name: native.name, version: 1 });
    request.onsuccess?.call(request, new Event("success"));
    const db = await opening;
    expect(() => db.close()).not.toThrow();
    expect(db.connection()).toBe("closed");
    await expect(db.read(["items"], () => 1)).rejects.toMatchObject({
      name: "InvalidStateError",
    });
  });
});

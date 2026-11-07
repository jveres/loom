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

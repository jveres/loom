// @vitest-environment happy-dom

import { state } from "loom";
import { bindStorage, codecs, storageSlot } from "loom/storage";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

const memoryStorage = (): Storage => {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => {
      map.delete(k);
    },
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
};
afterEach(() => {
  vi.useRealTimers();
});
describe("storageSlot", () => {
  it("loads a parsed, validated value; misses, bad values and throws read undefined; store answers whether storage took it; clear removes", () => {
    const storage = memoryStorage();
    const slot = storageSlot<{
      v: number;
    }>("doc", {
      storage,
      ...codecs.json(
        (value): value is { v: number } =>
          typeof value === "object" &&
          value !== null &&
          "v" in value &&
          typeof value.v === "number",
      ),
    });
    expect(slot.load()).toBeUndefined();
    expect(slot.store({ v: 1 })).toBe(true);
    expect(slot.load()).toEqual({ v: 1 });
    storage.setItem("doc", "{not json");
    expect(slot.load()).toBeUndefined();
    storage.setItem("doc", JSON.stringify({ v: "x" }));
    expect(slot.load()).toBeUndefined();
    slot.clear();
    expect(storage.getItem("doc")).toBeNull();
    const refusing = storageSlot<number>("n", {
      ...codecs.number(),
      storage: {
        ...storage,
        setItem: () => {
          throw new Error("quota");
        },
      },
    });
    expect(refusing.store(1)).toBe(false);
  });
});
describe("bindStorage with delayMs", () => {
  it("writes through after the quiet period instead of on every set; the signal itself is live", () => {
    vi.useFakeTimers();
    const storage = memoryStorage();
    const cell = state(1);
    const binding = bindStorage(
      cell,
      storageSlot<number>("w", { ...codecs.number(), storage }),
      {
        delayMs: 100,
      },
    );
    cell(2);
    cell(3);
    expect(cell()).toBe(3);
    expect(storage.getItem("w")).toBeNull();
    vi.advanceTimersByTime(99);
    expect(storage.getItem("w")).toBeNull();
    vi.advanceTimersByTime(1);
    expect(storage.getItem("w")).toBe("3");
    binding.stop();
  });
});

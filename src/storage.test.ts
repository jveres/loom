import { scope, state } from "loom";
import { bindStorage, codecs, storageSlot } from "loom/storage";
import { afterEach, describe, expect, it, vi } from "vitest";

function memory(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
    clear: () => values.clear(),
    key: (index) => [...values.keys()][index] ?? null,
  };
}
afterEach(() => vi.useRealTimers());

describe("explicit storage bindings", () => {
  it("should load silently and survive the creating view's teardown", () => {
    const storage = memory();
    storage.setItem("count", "4");
    const writes = vi.spyOn(storage, "setItem");
    const value = state(0);
    const abort = new AbortController();
    const view = scope(() =>
      bindStorage(
        value,
        storageSlot("count", { ...codecs.number(), storage }),
        { signal: abort.signal },
      ),
    );

    expect(value()).toBe(4);
    expect(writes).not.toHaveBeenCalled();
    view.stop();
    value(5);
    expect(storage.getItem("count")).toBe("5");
    abort.abort();
    value(6);
    expect(value()).toBe(6);
    expect(storage.getItem("count")).toBe("5");
  });
  it("should flush pending work explicitly and discard it on stop", () => {
    vi.useFakeTimers();
    const storage = memory();
    const value = state(1);
    const binding = bindStorage(
      value,
      storageSlot("count", { ...codecs.number(), storage }),
      { delayMs: 100 },
    );
    value(2);
    expect(storage.getItem("count")).toBeNull();
    expect(binding.flush()).toBe(true);
    expect(storage.getItem("count")).toBe("2");
    value(3);
    binding.stop();
    binding.stop();
    binding.flush();
    vi.advanceTimersByTime(200);
    expect(storage.getItem("count")).toBe("2");
  });
  it("should install no reads or writes for an already aborted signal", () => {
    const slot = {
      load: vi.fn(() => 4),
      store: vi.fn(() => true),
      clear: () => {},
    };
    const value = state(1);
    const binding = bindStorage(value, slot, { signal: AbortSignal.abort() });
    value(2);
    binding.flush();
    expect(slot.load).not.toHaveBeenCalled();
    expect(slot.store).not.toHaveBeenCalled();
    expect(value()).toBe(2);
  });
  it("should report refused writes without damaging the state", () => {
    const value = state(1);
    const binding = bindStorage(
      value,
      { load: () => undefined, store: () => false, clear: () => {} },
      { delayMs: 100 },
    );
    value(2);
    expect(binding.flush()).toBe(false);
    expect(value()).toBe(2);
    binding.stop();
  });
  it.each(["yes", "false", "", "2"])(
    "should reject malformed boolean %j",
    (raw) => {
      const storage = memory();
      storage.setItem("flag", raw);
      expect(
        storageSlot("flag", { ...codecs.boolean, storage }).load(),
      ).toBeUndefined();
    },
  );
  it.each([true, false])("should round-trip boolean %j", (value) => {
    const storage = memory();
    const slot = storageSlot("flag", { ...codecs.boolean, storage });
    expect(slot.store(value)).toBe(true);
    expect(slot.load()).toBe(value);
  });
  it.each(["", " ", "NaN", "Infinity", "12px", "9000"])(
    "should reject invalid or out-of-range number %j",
    (raw) => {
      const storage = memory();
      storage.setItem("width", raw);
      expect(
        storageSlot("width", {
          ...codecs.number({ min: 10, max: 500 }),
          storage,
        }).load(),
      ).toBeUndefined();
    },
  );
  it("should reject unknown string choices and round-trip structured codecs", () => {
    const storage = memory();
    storage.setItem("tab", "missing");
    expect(
      storageSlot("tab", {
        ...codecs.string(["info", "graph"] as const),
        storage,
      }).load(),
    ).toBeUndefined();
    const slot = storageSlot<Set<string>>("selection", {
      storage,
      serialize: (value) => JSON.stringify([...value]),
      parse: (raw) => new Set(JSON.parse(raw) as string[]),
    });
    expect(slot.store(new Set(["a", "b"]))).toBe(true);
    expect(slot.load()).toEqual(new Set(["a", "b"]));
  });
});

import { state } from "loom";
import { keyedStates } from "loom/model";
import { describe, expect, it } from "vitest";
import type { State } from "./loom.js";

describe("keyedStates", () => {
  it("stores function values without invoking them", () => {
    const view = keyedStates<{
      action: () => number;
    }>();
    let calls = 0;
    const action = () => ++calls;
    const cell = view.value("action", action);
    expect(calls).toBe(0);
    expect(cell()).toBe(action);
    expect(view.value("action", () => 42)).toBe(cell);
    expect(cell()()).toBe(1);
  });
  it("uses one cache for explicit values and factories", () => {
    const view = keyedStates<{
      count: number;
      [key: `scroll:${string}`]: number;
      [key: `fold:${string}`]: boolean;
    }>();
    const original = view.value("count", 3);
    let calls = 0;
    expect(
      view.factory("count", () => {
        calls++;
        return state(4);
      }),
    ).toBe(original);
    expect(view.value("count", 5)).toBe(original);
    expect(calls).toBe(0);
    view.prune("count");
    const backing = state(6);
    expect(view.factory("count", () => backing)).toBe(backing);
    expect(view.value("count", 0)).toBe(backing);
  });
  it("does not cache failed factories", () => {
    const view = keyedStates<{
      count: number;
    }>();
    expect(() =>
      view.factory("count", () => {
        throw new Error("failed");
      }),
    ).toThrow("failed");
    expect(view.has("count")).toBe(false);
    expect(view.factory("count", () => state(7))()).toBe(7);
  });
  it("creates a cell on first touch and returns the same cell after a rebuild", () => {
    const view = keyedStates<Record<`fold:${string}`, boolean>>({
      label: "test.view",
    });
    const fold = view.value("fold:a", false);
    fold(true);
    expect(view.value("fold:a", false)).toBe(fold); // the rebuild's ask
    expect(view.value("fold:a", false)()).toBe(true);
    expect(view.value("fold:b", false)()).toBe(false); // seeded, not shared
    expect(view.has("fold:a")).toBe(true);
    expect(view.has("fold:z")).toBe(false);
  });
  it("a factory initial supplies the state", () => {
    const view = keyedStates<{
      count: number;
      [key: `scroll:${string}`]: number;
      [key: `fold:${string}`]: boolean;
    }>();
    const backing = state(7);
    const cell = view.factory("scroll:a", () => backing);
    expect(cell).toBe(backing);
    expect(view.factory("scroll:a", () => state(0))).toBe(backing);
  });
  it("prune drops the dying identity's cells — by fragment or predicate", () => {
    const view = keyedStates<{
      count: number;
      [key: `scroll:${string}`]: number;
      [key: `fold:${string}`]: boolean;
    }>();
    view.value("fold:a", false);
    view.value("scroll:a", 0);
    view.value("fold:b", false);
    expect(view.prune(":a")).toBe(2);
    expect(view.has("fold:a")).toBe(false);
    expect(view.has("fold:b")).toBe(true);
    expect(view.prune((key) => key.startsWith("fold:"))).toBe(1);
    expect(view.has("fold:b")).toBe(false);
  });
});
// Compile-time checks: an explicit schema fixes each key's value type.
function checkTypedKeys() {
  const view = keyedStates<{
    count: number;
    action: () => string;
  }>();
  const count: State<number> = view.value("count", 0);
  const action: State<() => string> = view.factory("action", () =>
    state(() => "ok"),
  );
  count(1);
  action(() => "next");
  // @ts-expect-error unknown key
  view.value("missing", 0);
  // @ts-expect-error defaults cannot widen the schema
  view.value("count", "zero");
  // @ts-expect-error factories must match the key's state type
  view.factory("count", () => state("zero"));
  // @ts-expect-error the ambiguous legacy API is unavailable on typed stores
  view.cell("count", "zero");
  // @ts-expect-error has accepts schema keys
  view.has("missing");
}
void checkTypedKeys;

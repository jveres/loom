import { describe, expect, it } from "vitest";
import { keyedStates } from "./keyed-states.js";
import { type State, state } from "./loom.js";

describe("keyedStates", () => {
  it("stores function values without invoking them", () => {
    const view = keyedStates<{ action: () => number }>();
    let calls = 0;
    const action = () => ++calls;
    const cell = view.value("action", action);

    expect(calls).toBe(0);
    expect(cell()).toBe(action);
    expect(view.value("action", () => 42)).toBe(cell);
    expect(cell()()).toBe(1);
  });

  it("uses one cache for explicit values, factories, and legacy cells", () => {
    const view = keyedStates();
    const original = view.value("count", 3);
    let calls = 0;
    expect(
      view.factory("count", () => {
        calls++;
        return state(4);
      }),
    ).toBe(original);
    expect(view.cell("count", 5)).toBe(original);
    expect(calls).toBe(0);
    view.prune("count");
    const backing = state(6);
    expect(view.factory("count", () => backing)).toBe(backing);
    expect(view.value("count", 0)).toBe(backing);
  });

  it("does not cache failed factories", () => {
    const view = keyedStates<{ count: number }>();
    expect(() =>
      view.factory("count", () => {
        throw new Error("failed");
      }),
    ).toThrow("failed");
    expect(view.has("count")).toBe(false);
    expect(view.factory("count", () => state(7))()).toBe(7);
  });
  it("creates a cell on first touch and returns the same cell after a rebuild", () => {
    const view = keyedStates({ label: "test.view" });
    const fold = view.cell("fold:a", false);
    fold(true);
    expect(view.cell("fold:a", false)).toBe(fold); // the rebuild's ask
    expect(view.cell("fold:a", false)()).toBe(true);
    expect(view.cell("fold:b", false)()).toBe(false); // seeded, not shared
    expect(view.has("fold:a")).toBe(true);
    expect(view.has("fold:z")).toBe(false);
  });

  it("a factory initial supplies the cell (a persisted one composes)", () => {
    const view = keyedStates();
    const backing = state(7);
    const cell = view.cell("scroll:a", () => backing);
    expect(cell).toBe(backing);
    expect(view.cell("scroll:a", () => state(0))).toBe(backing);
  });

  it("prune drops the dying identity's cells — by fragment or predicate", () => {
    const view = keyedStates();
    view.cell("fold:a", false);
    view.cell("scroll:a", 0);
    view.cell("fold:b", false);
    expect(view.prune(":a")).toBe(2);
    expect(view.has("fold:a")).toBe(false);
    expect(view.has("fold:b")).toBe(true);
    expect(view.prune((key) => key.startsWith("fold:"))).toBe(1);
    expect(view.has("fold:b")).toBe(false);
  });
});

// Compile-time checks: an explicit schema fixes each key's value type.
function checkTypedKeys() {
  const view = keyedStates<{ count: number; action: () => string }>();
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

import { describe, expect, it } from "vitest";
import { keyedStates } from "./keyed-states.js";
import { state } from "./loom.js";

describe("keyedStates", () => {
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

import { describe, expect, it } from "vitest";
import { runtimeSlot } from "./runtime-slot.js";

describe("runtimeSlot", () => {
  it("initializes once per name and hands every asker the same value", () => {
    let inits = 0;
    const make = (): Set<string> => {
      inits += 1;
      return new Set();
    };
    const a = runtimeSlot("test.slot", make);
    const b = runtimeSlot("test.slot", make);
    expect(a).toBe(b);
    expect(inits).toBe(1);
    // A "second module instance" asks through the global symbol.
    const key = Symbol.for("loom.runtimeSlot:test.slot");
    expect((globalThis as Record<symbol, unknown>)[key]).toBe(a);
    expect(runtimeSlot("test.other", make)).not.toBe(a);
    expect(inits).toBe(2);
  });
});

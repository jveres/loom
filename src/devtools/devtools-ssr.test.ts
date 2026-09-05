import {
  inspectorMounted,
  mountInspector,
  toggleInspector,
  unmountInspector,
} from "loom/devtools";
import { describe, expect, it } from "vitest";

describe("loom/devtools outside a DOM", () => {
  it("keeps every lifecycle entrypoint a no-op", () => {
    expect(() => mountInspector()).not.toThrow();
    expect(() => toggleInspector()).not.toThrow();
    expect(() => unmountInspector()).not.toThrow();
    expect(inspectorMounted()).toBe(false);
  });
});

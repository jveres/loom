// @vitest-environment happy-dom
// Smoke coverage for the inspector lifecycle: the ~2k-line devtools tree has
// exactly four public seams, and the costly failure mode is a teardown leak —
// mount → unmount must return the page and the reactive world to rest.
import { describe, expect, it } from "vitest";
import { inspectResources } from "../core/inspect.js";
import { PANEL_ID } from "./css.js";
import {
  inspectorMounted,
  mountInspector,
  toggleInspector,
  unmountInspector,
} from "./index.js";

describe("loom/devtools", () => {
  it("mounts, reports mounted, and unmounts clean", () => {
    expect(inspectorMounted()).toBe(false);
    mountInspector();
    expect(inspectorMounted()).toBe(true);
    expect(document.getElementById(PANEL_ID)).toBeTruthy();

    unmountInspector();
    expect(inspectorMounted()).toBe(false);
    expect(document.getElementById(PANEL_ID)).toBeNull();
  });

  it("toggle flips mount state; teardown leaves no live scopes behind", () => {
    const rest = inspectResources().scopes;
    toggleInspector();
    expect(inspectorMounted()).toBe(true);
    toggleInspector();
    expect(inspectorMounted()).toBe(false);
    // The inspector's own scope must not survive its unmount.
    expect(inspectResources().scopes).toBe(rest);
  });

  it("remounts after unmount (module state fully reset)", () => {
    mountInspector();
    unmountInspector();
    mountInspector();
    expect(inspectorMounted()).toBe(true);
    expect(document.getElementById(PANEL_ID)).toBeTruthy();
    unmountInspector();
  });
});

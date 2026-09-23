// @vitest-environment happy-dom

import { configure, effect, state } from "loom";
import {
  inspectorMounted,
  mountInspector,
  toggleInspector,
  unmountInspector,
} from "loom/devtools";
import { inspect, inspectResources } from "loom/observe";
// @vitest-environment happy-dom
// Smoke coverage for the inspector lifecycle: the ~2k-line devtools tree has
// exactly four public seams, and the costly failure mode is a teardown leak —
// mount → unmount must return the page and the reactive world to rest.
import { afterEach, describe, expect, it, vi } from "vitest";
import { PANEL_ID } from "./css.js";

describe("loom/devtools", () => {
  afterEach(() => {
    unmountInspector();
    configure({ inspect: false });
  });
  it("mounts, reports mounted, and unmounts clean", () => {
    expect(inspectorMounted()).toBe(false);
    mountInspector();
    expect(inspectorMounted()).toBe(true);
    expect(document.getElementById(PANEL_ID)).not.toBeNull();
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
    expect(document.getElementById(PANEL_ID)).not.toBeNull();
    unmountInspector();
  });
  it("keeps the selection lock balanced when a second panel gesture takes over", () => {
    mountInspector();
    const panel = document.getElementById(PANEL_ID);
    const bar = panel?.querySelector<HTMLElement>(".li-bar");
    const resize = panel?.querySelector<HTMLElement>(".li-resize");
    if (!bar || !resize)
      throw new Error("inspector gesture handles are missing");
    for (const handle of [bar, resize]) {
      Object.defineProperties(handle, {
        setPointerCapture: { configurable: true, value: () => {} },
        releasePointerCapture: { configurable: true, value: () => {} },
      });
    }
    bar.dispatchEvent(
      new PointerEvent("pointerdown", { pointerId: 1, bubbles: true }),
    );
    expect(document.body.style.userSelect).toBe("none");
    resize.dispatchEvent(
      new PointerEvent("pointerdown", { pointerId: 2, bubbles: true }),
    );
    expect(document.body.style.userSelect).toBe("none");
    expect(bar.style.cursor).toBe("");
    resize.dispatchEvent(
      new PointerEvent("pointerup", { pointerId: 2, bubbles: true }),
    );
    expect(document.body.style.userSelect).toBe("");
  });
  it("keeps refreshing the Graph tab while the Info pane is paused", () => {
    // Leaving the Info tab pauses the stats pane's bindings; the per-tab refresh must not live
    // under that pane, or the Graph and Trace tabs never render.
    vi.useFakeTimers();
    const drains: Array<(hasBudget: () => boolean) => void> = [];
    const previous = configure({
      inspect: true,
      deferScheduler: (drain) => {
        drains.push(drain);
        return () => {};
      },
    });
    const tick = (): void => {
      vi.advanceTimersByTime(400);
      while (drains.length > 0) drains.shift()?.(() => true);
    };
    // happy-dom has no layout; give the virtual list a viewport so it draws rows.
    const clientHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "clientHeight",
    );
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 400,
    });
    try {
      const count = state(0, { label: "graph-probe" });
      const stop = effect(() => void count());
      mountInspector();
      const panel = document.getElementById(PANEL_ID);
      const graphTab = [
        ...(panel?.querySelectorAll<HTMLElement>(".li-tab") ?? []),
      ].find((tab) => tab.textContent === "Graph");
      if (!graphTab) throw new Error("Graph tab is missing");
      graphTab.dispatchEvent(
        new PointerEvent("pointerdown", {
          pointerId: 1,
          button: 0,
          isPrimary: true,
        }),
      );
      graphTab.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
      tick();
      tick();
      expect(panel?.querySelector(".li-graph")?.textContent).toContain(
        "graph-probe",
      );
      stop();
    } finally {
      if (clientHeight)
        Object.defineProperty(
          HTMLElement.prototype,
          "clientHeight",
          clientHeight,
        );
      else
        delete (HTMLElement.prototype as { clientHeight?: number })
          .clientHeight;
      configure(previous);
      vi.useRealTimers();
    }
  });
  it("restores the inspection setting that existed before mounting", () => {
    configure({ inspect: false });
    mountInspector();
    unmountInspector();
    const hidden = state(0, { label: "after-disabled-inspector" });
    hidden();
    expect(
      inspect().nodes.some((node) => node.label === "after-disabled-inspector"),
    ).toBe(false);
    configure({ inspect: true });
    mountInspector();
    unmountInspector();
    const visible = state(0, { label: "after-enabled-inspector" });
    visible();
    expect(
      inspect().nodes.some((node) => node.label === "after-enabled-inspector"),
    ).toBe(true);
  });
});

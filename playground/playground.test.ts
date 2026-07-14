// @vitest-environment happy-dom

// Every sample in the catalog must survive the editor pipeline end to end:
// sucrase-compile, execute against the module shim, default-export an
// element, mount, and tear down cleanly. A sample that drifts from the live
// API fails `pnpm run check`; one that breaks at runtime fails here.

import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { runSample } from "./runner.js";
import { samples } from "./samples.js";

describe("playground samples", () => {
  it("has a populated catalog with unique ids", () => {
    expect(samples.length).toBeGreaterThan(20);
    expect(new Set(samples.map((s) => s.id)).size).toBe(samples.length);
  });

  for (const sample of samples) {
    it(`${sample.id} compiles, mounts and disposes`, () => {
      const run = runSample(sample.source);
      document.body.append(run.el);
      expect(run.el.isConnected).toBe(true);
      run.dispose();
      expect(run.el.isConnected).toBe(false);
    });
  }

  it("reports unknown modules by name", () => {
    expect(() =>
      runSample('import x from "left-pad"; export default x;'),
    ).toThrowError(/unknown module "left-pad"/);
  });

  it("rejects a sample without an element default export", () => {
    expect(() => runSample("export default 42;")).toThrowError(
      /export default/,
    );
  });

  it("positions virtual-list rows absolutely (virtualizer contract)", () => {
    // Regression: static-flow rows stack below the sizer, millions of px
    // off-screen — the list LOOKED empty while 18 rows sat in the DOM.
    // (fs, not ?raw: vitest's css pipeline empties .css before ?raw sees it.)
    const playgroundCss = readFileSync("playground/playground.css", "utf8");
    const block = playgroundCss.slice(playgroundCss.indexOf(".pg-stage .vrow"));
    const rule = block.slice(0, block.indexOf("}"));
    expect(rule).toContain("position: absolute");
  });

  it("morph sample: the focused input survives a render, a blurred one resets", () => {
    // Regression: the old sample re-rendered from a button — the click blurred
    // the input, so morph (correctly) synced the fresh empty value over it.
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    try {
      const source = samples.find((s) => s.id === "morph")?.source;
      if (!source) throw new Error("morph sample missing");
      const run = runSample(source);
      document.body.append(run.el);
      const input = run.el.querySelector("input");
      if (!input) throw new Error("morph sample input missing");
      input.focus();
      input.value = "typed";
      vi.advanceTimersByTime(2100); // a render ticks past while focused
      expect(input.value).toBe("typed");
      input.blur();
      vi.advanceTimersByTime(2100); // the next render is the source of truth
      expect(input.value).toBe("");
      run.dispose();
    } finally {
      vi.useRealTimers();
    }
  });
});

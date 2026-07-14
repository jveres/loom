// @vitest-environment happy-dom

// Every sample in the catalog must survive the editor pipeline end to end:
// sucrase-compile, execute against the module shim, default-export an
// element, mount, and tear down cleanly. A sample that drifts from the live
// API fails `pnpm run check`; one that breaks at runtime fails here.

import { describe, expect, it } from "vitest";
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
});

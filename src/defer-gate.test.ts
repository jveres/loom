// Runs WITHOUT importing the lane: the defer option must fail loudly, not silently degrade.
// (Its own file: vitest isolates modules per file, so loom.test.ts's lane import doesn't leak here.)
import { expect, it } from "vitest";
import { effect } from "./loom.js";

it("effect({ defer: true }) without loom/defer loaded throws with the import hint", () => {
  expect(() => effect(() => {}, { defer: true })).toThrow(/loom\/defer/);
});

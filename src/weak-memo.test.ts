import { describe, expect, it, vi } from "vitest";
import { effect, state, weakMemo } from "./index.js";

describe("weakMemo", () => {
  it("computes once per key object and recomputes when the version moves", () => {
    const version = state(0);
    const compute = vi.fn((key: { n: number }) => key.n * 2);
    const memo = weakMemo(compute, version);
    const a = { n: 1 };
    const b = { n: 2 };
    expect(memo(a)).toBe(2);
    expect(memo(a)).toBe(2);
    expect(memo(b)).toBe(4);
    expect(compute).toHaveBeenCalledTimes(2);
    version(1);
    expect(memo(a)).toBe(2);
    expect(compute).toHaveBeenCalledTimes(3);
  });

  it("reads the version UNTRACKED — a lookup inside an effect never subscribes it", () => {
    const version = state(0);
    const memo = weakMemo((key: { n: number }) => key.n, version);
    const key = { n: 7 };
    let runs = 0;
    effect(() => {
      runs += 1;
      memo(key);
    });
    version(1);
    version(2);
    expect(runs).toBe(1);
  });

  it("works without a version — a plain per-object memo", () => {
    const compute = vi.fn((key: object) => Object.keys(key).length);
    const memo = weakMemo(compute);
    const key = { a: 1 };
    memo(key);
    memo(key);
    expect(compute).toHaveBeenCalledTimes(1);
  });
});

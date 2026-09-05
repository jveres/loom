import { effect, state } from "loom";
import { weakMemo } from "loom/model";
import { describe, expect, it, onTestFinished, vi } from "vitest";

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
  it("never subscribes callers to reads made during cache computation", () => {
    const input = state(1);
    const version = state(0);
    const refresh = state(0);
    const memo = weakMemo(() => input(), version);
    const key = {};
    const seen: number[] = [];
    const stop = effect(() => {
      refresh();
      seen.push(memo(key));
    });
    onTestFinished(stop);
    input(2);
    version(1);
    expect(seen).toEqual([1]);
    refresh(1);
    input(3);
    refresh(2);
    expect(seen).toEqual([1, 2, 2]);
  });
});

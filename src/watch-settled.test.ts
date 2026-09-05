import { scope, state } from "loom";
import { type SettledWatcher, watchSettled } from "loom/schedule";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
});
describe("loom settle", () => {
  it("collapses a burst after a full quiet period and keeps the delivered baseline", () => {
    vi.useFakeTimers();
    const value = state("A");
    const seen: Array<[string, string]> = [];
    const settlement = watchSettled(
      value,
      (next, previous) => {
        seen.push([next, previous]);
      },
      {
        delayMs: 100,
      },
    );
    value("B");
    vi.advanceTimersByTime(60);
    value("C");
    vi.advanceTimersByTime(99);
    expect(seen).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(seen).toEqual([["C", "A"]]);
    settlement.stop();
  });
  it("cancels a burst that returns to baseline and keeps callback reads untracked", () => {
    vi.useFakeTimers();
    const value = state("A");
    const other = state(0);
    let reads = 0;
    const seen: Array<[string, string]> = [];
    const settlement = watchSettled(
      () => {
        reads++;
        return value();
      },
      (next, previous) => {
        other();
        seen.push([next, previous]);
      },
      {
        delayMs: 100,
      },
    );
    value("B");
    vi.advanceTimersByTime(50);
    value("A");
    vi.advanceTimersByTime(100);
    expect(seen).toEqual([]);
    value("C");
    vi.advanceTimersByTime(100);
    expect(seen).toEqual([["C", "A"]]);
    expect(reads).toBe(4);
    other(1);
    expect(reads).toBe(4);
    settlement.stop();
  });
  it("uses semantic equality without moving the pending deadline", () => {
    vi.useFakeTimers();
    const value = state<readonly string[]>(["A"]);
    const seen: Array<readonly string[]> = [];
    const settlement = watchSettled(value, (next) => seen.push(next), {
      delayMs: 100,
      ...{
        equals: (next, previous) =>
          next.length === previous.length &&
          next.every((item, index) => item === previous[index]),
      },
    });
    const latest = ["B"] as const;
    value(["B"]);
    vi.advanceTimersByTime(50);
    value(latest);
    vi.advanceTimersByTime(50);
    expect(seen).toEqual([latest]);
    expect(seen[0]).toBe(latest);
    settlement.stop();
  });
  it("keeps cancel, flush, and terminal stop distinct and idempotent", () => {
    vi.useFakeTimers();
    const value = state("A");
    const seen: Array<[string, string]> = [];
    const settlement = watchSettled(
      value,
      (next, previous) => {
        seen.push([next, previous]);
      },
      {
        delayMs: 100,
      },
    );
    value("B");
    settlement.cancel();
    vi.advanceTimersByTime(100);
    value("C");
    settlement.flush();
    settlement.flush();
    expect(seen).toEqual([["C", "A"]]);
    value("D");
    settlement.stop();
    settlement.stop();
    vi.advanceTimersByTime(100);
    settlement.flush();
    expect(seen).toEqual([["C", "A"]]);
  });
  it("commits a delivery before a re-entrant source write starts the next burst", () => {
    vi.useFakeTimers();
    const value = state("A");
    const seen: Array<[string, string]> = [];
    const settlement = watchSettled(
      value,
      (next, previous) => {
        seen.push([next, previous]);
        if (next === "B") value("C");
      },
      {
        delayMs: 100,
      },
    );
    value("B");
    vi.advanceTimersByTime(100);
    expect(seen).toEqual([["B", "A"]]);
    vi.advanceTimersByTime(100);
    expect(seen).toEqual([
      ["B", "A"],
      ["C", "B"],
    ]);
    settlement.stop();
  });
  it("keeps a manually owned watcher active across ambient scope pause and stop", () => {
    vi.useFakeTimers();
    const cell = state(0);
    const seen: number[] = [];
    let watcher!: SettledWatcher;
    const owner = scope(() => {
      watcher = watchSettled(cell, (value) => seen.push(value), {
        delayMs: 10,
      });
    });
    cell(1);
    owner.pause();
    vi.advanceTimersByTime(10);
    owner.stop();
    cell(2);
    vi.advanceTimersByTime(10);
    expect(seen).toEqual([1, 2]);
    watcher.stop();
    cell(3);
    vi.advanceTimersByTime(10);
    expect(seen).toEqual([1, 2]);
  });
  it("coalesces synchronous writes at zero delay and rejects invalid delays first", () => {
    vi.useFakeTimers();
    const value = state(0);
    const seen: Array<[number, number]> = [];
    const settlement = watchSettled(
      value,
      (next, previous) => {
        seen.push([next, previous]);
      },
      {
        delayMs: 0,
      },
    );
    value(1);
    value(2);
    expect(seen).toEqual([]);
    vi.runOnlyPendingTimers();
    expect(seen).toEqual([[2, 0]]);
    settlement.stop();
    let reads = 0;
    for (const invalid of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() =>
        watchSettled(
          () => ++reads,
          () => {},
          {
            delayMs: invalid,
          },
        ),
      ).toThrow(RangeError);
    }
    expect(reads).toBe(0);
  });
});

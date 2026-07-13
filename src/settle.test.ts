import { afterEach, describe, expect, it, vi } from "vitest";
import { scope, state, watch } from "./loom.js";
import { settle, type Settlement, settled } from "./settle.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("loom settle", () => {
  it("collapses a burst after a full quiet period and keeps the delivered baseline", () => {
    vi.useFakeTimers();
    const value = state("A");
    const seen: Array<[string, string]> = [];
    const settlement = settle(
      value,
      (next, previous) => {
        seen.push([next, previous]);
      },
      100,
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
    const settlement = settle(
      () => {
        reads++;
        return value();
      },
      (next, previous) => {
        other();
        seen.push([next, previous]);
      },
      100,
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
    const settlement = settle(value, (next) => seen.push(next), 100, {
      equals: (next, previous) =>
        next.length === previous.length &&
        next.every((item, index) => item === previous[index]),
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
    const settlement = settle(
      value,
      (next, previous) => {
        seen.push([next, previous]);
      },
      100,
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
    const settlement = settle(
      value,
      (next, previous) => {
        seen.push([next, previous]);
        if (next === "B") value("C");
      },
      100,
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

  it("suspends a pending delivery with its scope and resumes from the latest value", () => {
    vi.useFakeTimers();
    const value = state("A");
    const seen: Array<[string, string]> = [];
    let settlement!: Settlement;
    const owner = scope(() => {
      settlement = settle(
        value,
        (next, previous) => {
          seen.push([next, previous]);
        },
        100,
      );
    });

    value("B");
    vi.advanceTimersByTime(50);
    owner.pause();
    value("C");
    vi.advanceTimersByTime(500);
    settlement.flush();
    expect(seen).toEqual([]);

    owner.resume();
    vi.advanceTimersByTime(99);
    expect(seen).toEqual([]);
    vi.advanceTimersByTime(1);
    expect(seen).toEqual([["C", "A"]]);

    value("D");
    owner.stop();
    owner.resume();
    vi.advanceTimersByTime(100);
    settlement.flush();
    expect(seen).toEqual([["C", "A"]]);
  });

  it("coalesces synchronous writes at zero delay and rejects invalid delays first", () => {
    vi.useFakeTimers();
    const value = state(0);
    const seen: Array<[number, number]> = [];
    const settlement = settle(
      value,
      (next, previous) => {
        seen.push([next, previous]);
      },
      0,
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
        settle(
          () => ++reads,
          () => {},
          invalid,
        ),
      ).toThrow(RangeError);
    }
    expect(reads).toBe(0);
  });
});

describe("loom settled", () => {
  it("serves the seed immediately and follows the source after quiet", () => {
    vi.useFakeTimers();
    const source = state("A");
    const lagging = settled(source, 100);

    expect(lagging()).toBe("A"); // the seed, no waiting

    source("B");
    vi.advanceTimersByTime(60);
    source("C");
    vi.advanceTimersByTime(99);
    expect(lagging()).toBe("A"); // burst not yet settled

    vi.advanceTimersByTime(1);
    expect(lagging()).toBe("C");
    lagging.stop();
  });

  it("reads are reactive: a watcher fires on the settled delivery", () => {
    vi.useFakeTimers();
    const source = state(1);
    const lagging = settled(source, 100);
    const seen: number[] = [];
    const stopWatch = watch(
      () => lagging(),
      (value) => seen.push(value),
    );

    source(2);
    expect(seen).toEqual([]);
    vi.advanceTimersByTime(100);
    expect(seen).toEqual([2]);
    stopWatch();
    lagging.stop();
  });

  it("flush promotes a pending value now; cancel discards one", () => {
    vi.useFakeTimers();
    const source = state("A");
    const lagging = settled(source, 100);

    source("B");
    lagging.flush(); // the host's "apply immediately" override
    expect(lagging()).toBe("B");

    source("C");
    lagging.cancel();
    vi.advanceTimersByTime(100);
    expect(lagging()).toBe("B"); // the canceled burst never lands

    source("D"); // observing continues after a cancel
    vi.advanceTimersByTime(100);
    expect(lagging()).toBe("D");
    lagging.stop();
  });

  it("honors semantic equality without moving the read", () => {
    vi.useFakeTimers();
    const source = state(["a"], { label: "settled.eq" });
    const lagging = settled(source, 100, {
      equals: (next, previous) =>
        next.length === previous.length &&
        next.every((entry, index) => entry === previous[index]),
    });

    source(["a"]); // a new array, same meaning: no pending delivery
    vi.advanceTimersByTime(100);
    expect(lagging()).toEqual(["a"]);

    source(["b"]);
    vi.advanceTimersByTime(100);
    expect(lagging()).toEqual(["b"]);
    lagging.stop();
  });

  it("stop freezes the read at its last delivery", () => {
    vi.useFakeTimers();
    const source = state("A");
    const lagging = settled(source, 100);
    source("B");
    lagging.stop();
    vi.advanceTimersByTime(100);
    expect(lagging()).toBe("A");
  });
});

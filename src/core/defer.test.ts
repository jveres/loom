import { describe, expect, it, vi } from "vitest";
import { configure, effect, scope, state } from "../loom.js";
import "./defer.js";

describe("deferred synchronous scheduling", () => {
  it("runs a dirty parent before disposing its already-queued child", () => {
    const previous = configure({
      deferScheduler: (run) => {
        run(() => true);
        return () => {};
      },
    });
    const shared = state(0);
    let parentRuns = 0;
    let childRuns = 0;

    const stop = effect(
      () => {
        // Subscribe the child first, making propagation encounter it before the parent. The
        // deferred queue must still reverse their ownership chain to parent→child.
        effect(
          () => {
            shared();
            childRuns++;
          },
          { defer: true },
        );
        shared();
        parentRuns++;
      },
      { defer: true },
    );

    try {
      expect({ parentRuns, childRuns }).toEqual({
        parentRuns: 1,
        childRuns: 1,
      });
      shared(1);
      expect({ parentRuns, childRuns }).toEqual({
        parentRuns: 2,
        childRuns: 2,
      });
    } finally {
      stop();
      configure(previous);
    }
  });

  it("notifies every sibling before an inline scheduler can commit their shared state", () => {
    const previous = configure({
      deferScheduler: (drain) => {
        drain(() => true);
        return () => {};
      },
    });
    const shared = state(0);
    const left: number[] = [];
    const right: number[] = [];
    const stopLeft = effect(() => left.push(shared()), { defer: true });
    const stopRight = effect(() => right.push(shared()), { defer: true });

    try {
      shared(1);
      expect(left).toEqual([0, 1]);
      expect(right).toEqual([0, 1]);
    } finally {
      stopLeft();
      stopRight();
      configure(previous);
    }
  });

  it("yields a zero-budget inline continuation instead of rescheduling recursively", async () => {
    vi.useFakeTimers();
    let schedules = 0;
    const previous = configure({
      deferScheduler: (drain) => {
        schedules++;
        drain(() => schedules > 1);
        return () => {};
      },
    });
    const value = state(0);
    const seen: number[] = [];
    const stop = effect(() => seen.push(value()), { defer: true });

    try {
      value(1);
      expect(schedules).toBe(1);
      expect(seen).toEqual([0]);

      await vi.runOnlyPendingTimersAsync();

      expect(schedules).toBe(2);
      expect(seen).toEqual([0, 1]);
    } finally {
      stop();
      configure(previous);
      vi.useRealTimers();
    }
  });

  it("drains a long cascading update without recursive scheduler entry", () => {
    const previous = configure({
      deferScheduler: (drain) => {
        drain(() => true);
        return () => {};
      },
    });
    const length = 3_000;
    const values = Array.from({ length }, () => state(0));
    const stops: Array<() => void> = [];

    try {
      for (let index = 0; index < length - 1; index++) {
        const current = values[index] as ReturnType<typeof state<number>>;
        const next = values[index + 1] as ReturnType<typeof state<number>>;
        stops.push(
          effect(
            () => {
              next(current());
            },
            { defer: true },
          ),
        );
      }

      expect(() => {
        (values[0] as ReturnType<typeof state<number>>)(1);
      }).not.toThrow();
      expect((values.at(-1) as ReturnType<typeof state<number>>)()).toBe(1);
    } finally {
      for (const stop of stops) stop();
      configure(previous);
    }
  });

  it("does not skip a sibling removed from a resumed scope during enqueue", () => {
    const previous = configure({
      deferScheduler: (drain) => {
        drain(() => true);
        return () => {};
      },
    });
    const a = state(0);
    const b = state(0);
    let aRuns = 0;
    let bRuns = 0;
    let stopA!: () => void;
    const owner = scope(() => {
      stopA = effect(
        () => {
          if (a() === 1) stopA();
          aRuns++;
        },
        { defer: true },
      );
      effect(
        () => {
          b();
          bRuns++;
        },
        { defer: true },
      );
    });

    try {
      owner.pause();
      a(1);
      b(1);
      owner.resume();

      expect({ aRuns, bRuns }).toEqual({ aRuns: 2, bRuns: 2 });
    } finally {
      owner.stop();
      configure(previous);
    }
  });
});

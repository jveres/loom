import { describe, expect, it } from "vitest";
import {
  batch,
  computed,
  effect,
  fields,
  mutate,
  state,
  trigger,
  untrack,
  update,
} from "./loom.js";

describe("loom core", () => {
  it("creates callable state cells", () => {
    const count = state(0);

    expect(count()).toBe(0);
    count(1);
    expect(count()).toBe(1);

    update(count, (value) => value + 1);
    expect(count()).toBe(2);
  });

  it("runs computed values and effects", () => {
    const count = state(1);
    const doubled = computed(() => count() * 2);
    const seen: number[] = [];

    const stop = effect(() => {
      seen.push(doubled());
    });

    expect(seen).toEqual([2]);

    batch(() => {
      count(2);
      count(3);
    });

    expect(seen).toEqual([2, 6]);
    stop();
  });

  it("runs effect cleanup callbacks", () => {
    const count = state(0);
    let cleanups = 0;

    const stop = effect(() => {
      count();
      return () => {
        cleanups++;
      };
    });

    count(1);
    expect(cleanups).toBe(1);

    stop();
    expect(cleanups).toBe(2);
  });

  it("supports untracked reads", () => {
    const tracked = state(0);
    const ignored = state(0);
    let runs = 0;

    const stop = effect(() => {
      runs++;
      tracked();
      untrack(() => ignored());
    });

    ignored(1);
    expect(runs).toBe(1);

    tracked(1);
    expect(runs).toBe(2);
    stop();
  });

  it("supports manual triggers for in-place mutation", () => {
    const values = state<number[]>([]);
    const length = computed(() => values().length);
    const seen: number[] = [];

    const stop = effect(() => {
      seen.push(length());
    });

    values().push(1);
    expect(seen).toEqual([0]);

    trigger(values);
    expect(seen).toEqual([0, 1]);
    stop();
  });

  it("provides a mutate helper for object state", () => {
    const model = state({ count: 0 });
    const seen: number[] = [];

    const stop = effect(() => {
      seen.push(model().count);
    });

    mutate(model, (value) => {
      value.count = 1;
    });

    expect(seen).toEqual([0, 1]);
    stop();
  });

  it("creates fine-grained object fields", () => {
    const model = fields({ left: 0, right: 0 });
    let leftRuns = 0;
    let rightRuns = 0;

    const stopLeft = effect(() => {
      leftRuns++;
      model.left();
    });
    const stopRight = effect(() => {
      rightRuns++;
      model.right();
    });

    model.left(1);

    expect(leftRuns).toBe(2);
    expect(rightRuns).toBe(1);

    stopLeft();
    stopRight();
  });

  it("rejects non-plain field sources", () => {
    expect(() => fields([])).toThrow(TypeError);
    expect(() => fields(new Date())).toThrow(TypeError);
  });
});

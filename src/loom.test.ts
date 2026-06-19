import { afterEach, describe, expect, it, vi } from "vitest";
import {
  batch,
  computed,
  depsOf,
  type EffectFn,
  effect,
  fields,
  inspect,
  mutate,
  type ObserveEvent,
  observe,
  polled,
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

  it("accepts reusable void effect callbacks", () => {
    const count = state(0);
    let seen = -1;
    const syncSeen: EffectFn = () => {
      seen = count();
    };

    const stop = effect(syncSeen);

    expect(seen).toBe(0);
    count(1);
    expect(seen).toBe(1);
    stop();
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

  it("creates fields from string keys only", () => {
    const hidden = Symbol("hidden");
    const model = fields({ visible: 1, [hidden]: 2 });

    expect(model.visible()).toBe(1);
    expect(Object.getOwnPropertySymbols(model)).toHaveLength(0);
  });

  it("rejects non-plain field sources", () => {
    expect(() => fields([])).toThrow(TypeError);
    expect(() => fields(new Date())).toThrow(TypeError);
  });

  it("labels inspectable nodes and reports dependencies", () => {
    const count = state(1, { label: "inspect.count", namespace: "unit" });
    const doubled = computed(() => count() * 2, {
      label: "inspect.doubled",
      namespace: "unit",
    });
    let seen = 0;

    const stop = effect(
      () => {
        seen = doubled();
      },
      { label: "inspect.view", namespace: "unit" },
    );

    expect(seen).toBe(2);
    expect(depsOf(doubled).map((node) => node.label)).toEqual([
      "inspect.count",
    ]);
    expect(depsOf(stop).map((node) => node.label)).toEqual(["inspect.doubled"]);

    count(2);

    expect(seen).toBe(4);
    expect(
      inspect().nodes.find((node) => node.label === "inspect.view"),
    ).toMatchObject({
      kind: "effect",
      namespace: "unit",
      runs: 2,
    });

    stop();

    expect(
      inspect().nodes.find((node) => node.label === "inspect.view"),
    ).toBeUndefined();
  });

  it("emits observer events while filtering internal nodes by default", () => {
    const events: ObserveEvent[] = [];
    const stopObserve = observe((event) => events.push(event));

    const visible = state(0, { label: "visible", namespace: "unit" });
    const hidden = state(0, {
      internal: true,
      label: "hidden",
      namespace: "unit",
    });

    visible(1);
    hidden(1);
    stopObserve();
    visible(2);

    expect(events.map((event) => event.kind)).toEqual([
      "state:create",
      "state:set",
    ]);
    expect(events.map((event) => "label" in event && event.label)).toEqual([
      "visible",
      "visible",
    ]);
  });

  it("can include internal observer events explicitly", () => {
    const events: ObserveEvent[] = [];
    const stopObserve = observe((event) => events.push(event), {
      includeInternal: true,
    });
    const hidden = state(0, {
      internal: true,
      label: "hidden.write",
      namespace: "unit",
    });

    hidden(1);
    stopObserve();

    expect(events.filter((event) => event.kind === "state:set")).toEqual([
      expect.objectContaining({
        internal: true,
        kind: "state:set",
        label: "hidden.write",
      }),
    ]);
  });

  it("does not emit flush events for internal-only effect work", () => {
    const events: ObserveEvent[] = [];
    const stopObserve = observe((event) => events.push(event), {
      flushes: true,
    });
    const app = state(0, { label: "app", namespace: "unit" });
    const internal = state(0, {
      internal: true,
      label: "internal",
      namespace: "unit",
    });
    const stopApp = effect(() => {
      app();
    });
    const stopInternal = effect(
      () => {
        internal();
      },
      { internal: true },
    );

    events.length = 0;
    internal(1);
    expect(events).toEqual([]);

    app(1);
    expect(events).toEqual([
      expect.objectContaining({ batchSize: 1, kind: "flush" }),
    ]);

    stopInternal();
    stopApp();
    stopObserve();
  });
});

describe("loom polled", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("samples immediately and re-samples on the interval", () => {
    vi.useFakeTimers();
    let value = 0;
    const p = polled(() => value, 100);
    expect(p.read()).toBe(0);

    value = 1;
    vi.advanceTimersByTime(100);
    expect(p.read()).toBe(1);

    value = 2;
    vi.advanceTimersByTime(250); // two ticks (100, 200), both read 2
    expect(p.read()).toBe(2);

    p.stop();
  });

  it("wakes a dependent effect only when the sampled value changes", () => {
    vi.useFakeTimers();
    let value = 0;
    let runs = 0;
    let seen: number | undefined;
    const p = polled(() => value, 100);
    const stop = effect(() => {
      seen = p.read();
      runs++;
    });
    expect(runs).toBe(1);
    expect(seen).toBe(0);

    // Unchanged sample -> value-dedup -> no re-run.
    vi.advanceTimersByTime(100);
    expect(runs).toBe(1);

    // Changed sample -> re-run.
    value = 5;
    vi.advanceTimersByTime(100);
    expect(runs).toBe(2);
    expect(seen).toBe(5);

    stop();
    p.stop();
  });

  it("stops sampling after stop()", () => {
    vi.useFakeTimers();
    let value = 0;
    const p = polled(() => value, 100);
    p.stop();

    value = 9;
    vi.advanceTimersByTime(500);
    expect(p.read()).toBe(0);
  });

  it("honours state options: an internal source is filtered from observe", () => {
    vi.useFakeTimers();
    const kinds: ObserveEvent["kind"][] = [];
    const stopObserve = observe((event) => kinds.push(event.kind));

    let value = 0;
    // The timer resamples regardless of subscribers, so no effect is needed to drive it.
    const internalSource = polled(() => value, 100, { internal: true });

    value = 1;
    vi.advanceTimersByTime(100);
    expect(internalSource.read()).toBe(1); // value updated
    expect(kinds).toEqual([]); // ...but the internal source emits nothing

    internalSource.stop();
    stopObserve();
  });
});

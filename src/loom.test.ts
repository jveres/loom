import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  batch,
  channel,
  computed,
  configure,
  type EffectFn,
  effect,
  events,
  fields,
  inspect,
  inspectResources,
  type Meter,
  meter,
  mutate,
  type Polled,
  polled,
  type Scope,
  scope,
  source,
  state,
  trigger,
  untrack,
  update,
} from "./loom.js";

// Inspection is opt-in (off by default). Most tests assert on inspect()/channel internal
// filtering, so default it on per-test; the dedicated test below flips it off and relies on this
// to restore it for the next test.
beforeEach(() => {
  configure({ inspect: true, onError: undefined });
});

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
    const count = state(1, { label: "inspect.count" });
    const doubled = computed(() => count() * 2, {
      label: "inspect.doubled",
    });
    let seen = 0;

    const stop = effect(
      () => {
        seen = doubled();
      },
      { label: "inspect.view" },
    );

    expect(seen).toBe(2);

    count(2);

    expect(seen).toBe(4);
    expect(
      inspect().nodes.find((node) => node.label === "inspect.view"),
    ).toMatchObject({
      kind: "effect",
      runs: 2,
    });

    stop();

    expect(
      inspect().nodes.find((node) => node.label === "inspect.view"),
    ).toBeUndefined();
  });

  it("counts non-internal reactive ops on the built-in channels", () => {
    const m = meter([events.read, events.write, events.compute, events.effect]);
    const a = state(0);
    const c = computed(() => a() * 2);
    const stop = effect(() => {
      c();
    });
    a(1);

    const f = m.read();
    expect(f["loom:write"]?.count).toBe(1); // a(1)
    expect(f["loom:read"]?.count ?? 0).toBeGreaterThan(0);
    expect(f["loom:compute"]?.count ?? 0).toBeGreaterThan(0);
    expect(f["loom:effect"]?.count ?? 0).toBeGreaterThan(0);

    stop();
    m.stop();
  });

  it("excludes internal nodes from the built-in channels", () => {
    const m = meter([events.write]);
    const visible = state(0);
    const hidden = state(0, { internal: true });
    visible(1);
    hidden(1); // internal -> not counted
    expect(m.read()["loom:write"]?.count).toBe(1);
    m.stop();
  });

  it("streams id + prev→next on the write samples view, in order", () => {
    const m = meter([events.write], "samples");
    const a = state(5);
    a(6);
    a(7);
    const f = m.read()["loom:write"];
    expect(f?.count).toBe(2); // the two writes (creation isn't a write)
    const rows = f?.samples ?? [];
    // every write captured, in order, with the cell id + the exact prev→next transition
    expect(rows.map((r) => [r["prev"], r["next"]])).toEqual([
      [5, 6],
      [6, 7],
    ]);
    expect(new Set(rows.map((r) => r["id"])).size).toBe(1); // same cell
    m.stop();
  });

  it("records the source — the effect that read or wrote a cell", () => {
    const rm = meter([events.read], "samples");
    const wm = meter([events.write], "samples");
    const a = state(0);
    const b = state(0);
    const stop = effect(() => {
      b(a() + 1);
    });
    rm.read(); // drain the effect's initial run
    wm.read();
    a(5); // top-level write → re-runs the effect (it reads a, writes b)
    const reads = rm.read()["loom:read"]?.samples ?? [];
    const writes = wm.read()["loom:write"]?.samples ?? [];
    const aRead = reads.find((r) => r["id"] !== undefined);
    const bWrite = writes.find((w) => w["next"] === 6);
    const aWrite = writes.find((w) => w["next"] === 5);
    expect(typeof aRead?.["by"]).toBe("number"); // a was read by the effect
    expect(bWrite?.["by"]).toBe(aRead?.["by"]); // the same effect then wrote b
    expect(aWrite?.["by"]).toBeUndefined(); // a's own top-level write has no reactive source
    stop();
    rm.stop();
    wm.stop();
  });

  it("records flush batch size + duration, for app work only", () => {
    const m = meter([events.flush], "samples");
    const app = state(0);
    const internal = state(0, { internal: true });
    const stopApp = effect(() => {
      app();
    });
    const stopInternal = effect(
      () => {
        internal();
      },
      { internal: true },
    );
    m.read(); // drain anything from setup

    internal(1); // internal-only flush -> no record
    expect(m.read()["loom:flush"]?.count).toBe(0);

    app(1); // app flush -> batchSize 1
    const last = m.read()["loom:flush"]?.samples.at(-1) as
      | { batchSize: number; durationMs: number }
      | undefined;
    expect(last?.batchSize).toBe(1);
    expect(typeof last?.durationMs).toBe("number");

    stopApp();
    stopInternal();
    m.stop();
  });

  it("propagates an effect throw without an error handler", () => {
    const a = state(0);
    const stop = effect(() => {
      if (a() === 1) throw new Error("boom");
    });
    expect(() => a(1)).toThrow("boom"); // surfaces at the setter that triggered the flush
    stop();
  });

  it("disposes the partial subscription when a first effect run throws without a handler", () => {
    const a = state(0);
    // The first run reads `a` then throws, so the caller never receives a disposer.
    expect(() =>
      effect(() => {
        a();
        throw new Error("boom");
      }),
    ).toThrow("boom");
    // The dead effect must not remain subscribed to `a` — writing must not re-trigger (re-throw) it.
    expect(() => a(1)).not.toThrow();
  });

  it("routes effect errors to configure({ onError }) and continues the flush", () => {
    const errors: unknown[] = [];
    configure({
      onError: (error, node) => errors.push({ error, label: node?.label }),
    });
    const a = state(0);
    let otherRuns = 0;
    const stopBad = effect(
      () => {
        if (a() === 1) throw new Error("boom");
      },
      { label: "bad-effect" },
    );
    const stopOther = effect(() => {
      a();
      otherRuns++;
    });
    otherRuns = 0;

    expect(() => a(1)).not.toThrow(); // isolated, not propagated to the setter
    expect(errors).toHaveLength(1);
    expect((errors[0] as { error: Error }).error.message).toBe("boom");
    expect((errors[0] as { label?: string }).label).toBe("bad-effect"); // node context
    expect(otherRuns).toBe(1); // the other effect still ran in the same flush

    stopBad();
    stopOther();
  });

  it("allocates no inspect metadata while inspection is disabled", () => {
    configure({ inspect: false });
    const before = inspectResources();

    const off = state(0); // created while disabled -> no metadata
    let seen = -1;
    const stop = effect(() => {
      seen = off();
    });
    off(7);
    expect(seen).toBe(7); // fully reactive without any inspect metadata

    const after = inspectResources();
    expect(after.states).toBe(before.states); // invisible to the census
    expect(after.effects).toBe(before.effects);
    stop();

    configure({ inspect: true });
    const node = state(0, { label: "re-enabled" });
    expect(inspect().nodes.find((n) => n.label === "re-enabled")).toBeDefined(); // visible again once re-enabled
    void node;
  });
});

describe("loom channels", () => {
  it("is zero-cost until metered, then records up to four detail fields", () => {
    const ch = channel("test:multi", {
      capacity: 4,
      fields: ["x", "y", "p", "t"],
    });

    ch.emit(1, 2, 3, 4); // no meter yet -> gated no-op
    expect(ch.active).toBe(false);

    const m = meter([ch], "samples");
    expect(ch.active).toBe(true);
    ch.emit(10, 20, 30, 40);
    ch.emit(11, 21, 31, 41);

    const f = m.read()["test:multi"];
    expect(f?.count).toBe(2); // the pre-meter emit is not counted
    expect(f?.dropped).toBe(0);
    expect(f?.samples).toEqual([
      { x: 10, y: 20, p: 30, t: 40 },
      { x: 11, y: 21, p: 31, t: 41 },
    ]);
    m.stop();
    expect(ch.active).toBe(false);
  });

  it("counts everything but drops oldest detail past capacity", () => {
    const ch = channel("test:overflow", { capacity: 2, fields: ["n"] });
    const m = meter([ch], "samples");
    for (let i = 0; i < 5; i++) ch.emit(i);

    const f = m.read()["test:overflow"];
    expect(f?.count).toBe(5); // exact count survives overflow
    expect(f?.dropped).toBe(3); // 5 - capacity(2)
    expect(f?.samples).toEqual([{ n: 3 }, { n: 4 }]); // newest two, oldest→newest
    m.stop();
  });

  it("supports count-only channels (capacity 0, no samples)", () => {
    const ch = channel("test:count");
    const m = meter([ch]);
    ch.emit();
    ch.emit();
    const f = m.read()["test:count"];
    expect(f?.count).toBe(2);
    expect(f?.samples).toEqual([]);
    m.stop();
  });

  it("reads one channel through two views: count (default) vs samples", () => {
    const ch = channel("test:views", { capacity: 4, fields: ["v"] });
    const countView = meter([ch]); // default "count"
    const sampleView = meter([ch], "samples");
    ch.emit(1);
    ch.emit(2);

    const c = countView.read()["test:views"];
    const s = sampleView.read()["test:views"];
    // both see the exact count; only the samples view materialises records
    expect(c?.count).toBe(2);
    expect(c?.samples).toEqual([]); // count view builds nothing (the shared empty)
    expect(s?.count).toBe(2);
    expect(s?.samples).toEqual([{ v: 1 }, { v: 2 }]);
    countView.stop();
    sampleView.stop();
  });

  it("detaches as a scope resource on pause and re-attaches on resume", () => {
    const ch = channel("test:scoped", { capacity: 2, fields: ["n"] });
    let m!: Meter;
    const s = scope(() => {
      m = meter([ch]);
    });
    expect(ch.active).toBe(true); // metered while the scope runs

    s.pause();
    expect(ch.active).toBe(false); // detached -> core emit sites go inactive
    ch.emit(1); // dropped on the floor while detached

    s.resume();
    expect(ch.active).toBe(true); // re-attached fresh
    ch.emit(2);
    expect(m.read()["test:scoped"]?.count).toBe(1); // only the post-resume emit

    s.stop();
    expect(ch.active).toBe(false); // scope teardown detaches too
  });

  it("inspectResources censuses live reactive resources off the hot path", () => {
    const before = inspectResources();
    expect(before.channels).toBeGreaterThanOrEqual(7); // the 7 built-in channels

    const keep: unknown[] = [];
    const s = scope(() => {
      keep.push(state(0));
      keep.push(computed(() => 1));
      keep.push(effect(() => {})); // an app effect
      keep.push(effect(() => {}, { target: {} })); // a view (effect bound to a DOM node)
      keep.push(source(() => () => {}, 0)); // a lazy source
    });

    const after = inspectResources();
    expect(after.states - before.states).toBe(1);
    expect(after.computeds - before.computeds).toBe(1);
    expect(after.effects - before.effects).toBe(1); // app effect only
    expect(after.views - before.views).toBe(1); // the effect with a target counted as a view
    expect(after.sources - before.sources).toBe(1); // counted apart from plain states
    expect(after.scopes - before.scopes).toBe(1);
    // the state + computed have no readers -> both counted unread
    expect(after.unread - before.unread).toBe(2);

    s.stop();
    expect(inspectResources().scopes).toBe(before.scopes); // scope teardown decrements
    expect(keep).toHaveLength(5);
  });

  it("inspect({ active }) skips subscriber-less cells but keeps effects", () => {
    const watched = state(0, { label: "act-watched" });
    const idle = state(0, { label: "act-idle" }); // nothing ever reads it
    const stop = effect(
      () => {
        watched();
      },
      { label: "act-effect" },
    );

    const active = inspect({ active: true }).nodes;
    const has = (label: string) => active.some((n) => n.label === label);
    expect(has("act-watched")).toBe(true); // has a subscriber (the effect)
    expect(has("act-effect")).toBe(true); // effects are always kept
    expect(has("act-idle")).toBe(false); // no subscribers -> skipped

    // the full snapshot still includes the idle cell
    expect(inspect().nodes.some((n) => n.label === "act-idle")).toBe(true);

    stop();
    expect(idle()).toBe(0);
  });

  it("ignores channels it doesn't know", () => {
    const ghost = { name: "test:ghost", active: false, emit: () => {} };
    const m = meter([ghost]);
    expect(m.read()["test:ghost"]).toBeUndefined();
    m.stop();
  });

  it("returns the same channel on redeclare, throws on conflicting options", () => {
    const a = channel("test:redeclare", { capacity: 4, fields: ["v"] });
    const b = channel("test:redeclare", { capacity: 4, fields: ["v"] });
    expect(b.name).toBe(a.name);
    expect(() => channel("test:redeclare")).not.toThrow(); // no options -> just a handle
    expect(() => channel("test:redeclare", { capacity: 8 })).toThrow(
      /different options/,
    );
    expect(() =>
      channel("test:redeclare", { capacity: 4, fields: ["w"] }),
    ).toThrow(/different options/);
  });

  it("rejects the reserved loom: prefix for app channels", () => {
    expect(() => channel("loom:write")).toThrow(/reserved "loom:" prefix/);
    expect(() => channel("loom:custom")).toThrow(/reserved/);
    expect(() => channel("app:loom:x")).not.toThrow(); // only a leading loom: is reserved
  });

  it("rejects out-of-range capacity instead of hanging the pow2 loop", () => {
    expect(() => channel("test:bigcap", { capacity: 2 ** 31 })).toThrow(
      /capacity/,
    );
    expect(() => channel("test:negcap", { capacity: -1 })).toThrow(/capacity/);
    expect(() => channel("test:nancap", { capacity: Number.NaN })).toThrow(
      /capacity/,
    );
    // A valid capacity rounds up to a power of two and works.
    expect(channel("test:okcap", { capacity: 100 }).name).toBe("test:okcap");
  });

  it("rejects more than five fields", () => {
    expect(() =>
      channel("test:6fields", {
        capacity: 4,
        fields: ["a", "b", "c", "d", "e", "f"],
      }),
    ).toThrow(/up to 5 fields/);
    expect(() =>
      channel("test:5fields", {
        capacity: 4,
        fields: ["a", "b", "c", "d", "e"],
      }),
    ).not.toThrow();
  });

  it("records a fifth field (emit's 5th value)", () => {
    const ch = channel("test:5cols", {
      capacity: 4,
      fields: ["a", "b", "c", "d", "e"],
    });
    const m = meter([ch], "samples");
    ch.emit(1, 2, 3, 4, 5);
    expect(m.read()["test:5cols"]?.samples).toEqual([
      { a: 1, b: 2, c: 3, d: 4, e: 5 },
    ]);
    m.stop();
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
    expect(p()).toBe(0);

    value = 1;
    vi.advanceTimersByTime(100);
    expect(p()).toBe(1);

    value = 2;
    vi.advanceTimersByTime(250); // two ticks (100, 200), both read 2
    expect(p()).toBe(2);

    p.stop();
  });

  it("wakes a dependent effect only when the sampled value changes", () => {
    vi.useFakeTimers();
    let value = 0;
    let runs = 0;
    let seen: number | undefined;
    const p = polled(() => value, 100);
    const stop = effect(() => {
      seen = p();
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
    expect(p()).toBe(0);
  });

  it("honours state options: an internal polled is excluded from the channels", () => {
    vi.useFakeTimers();
    const m = meter([events.write]);

    let value = 0;
    // The timer resamples regardless of subscribers, so no effect is needed to drive it.
    const internalSource = polled(() => value, 100, { internal: true });

    value = 1;
    vi.advanceTimersByTime(100);
    expect(internalSource()).toBe(1); // value updated
    expect(m.read()["loom:write"]?.count).toBe(0); // ...but the internal write is not counted

    internalSource.stop();
    m.stop();
  });
});

describe("loom source", () => {
  it("connects on first observe and disconnects on last unobserve", () => {
    let connects = 0;
    let disconnects = 0;
    let push: ((v: number) => void) | undefined;
    const reading = source<number>((set) => {
      connects++;
      push = set;
      return () => {
        disconnects++;
        push = undefined;
      };
    }, 0);

    // Untracked read: not observed -> not connected, returns the initial value.
    expect(reading()).toBe(0);
    expect(connects).toBe(0);

    let seen: number | undefined;
    const stop = effect(() => {
      seen = reading();
    });
    expect(connects).toBe(1);
    expect(seen).toBe(0);

    // The producer pushes a new value -> the subscriber re-runs.
    push?.(5);
    expect(seen).toBe(5);

    // Last subscriber gone -> disconnect runs.
    stop();
    expect(disconnects).toBe(1);
    expect(push).toBeUndefined();
  });

  it("does not wedge a source whose connect() throws; retries on the next observe", () => {
    let attempts = 0;
    let push: ((v: number) => void) | undefined;
    const reading = source<number>((set) => {
      attempts++;
      if (attempts === 1) throw new Error("connect failed");
      push = set;
      return () => {};
    }, 0);

    // First observe triggers connect(), which throws -> surfaces at the reader; not left "active".
    expect(() =>
      effect(() => {
        reading();
      }),
    ).toThrow("connect failed");
    expect(attempts).toBe(1);

    // A later observe must retry connect() (the source wasn't wedged active with no teardown).
    let seen: number | undefined;
    const stop = effect(() => {
      seen = reading();
    });
    expect(attempts).toBe(2);
    push?.(7);
    expect(seen).toBe(7);
    stop();
  });

  it("retains the last value while unobserved and reconnects when observed again", () => {
    let connects = 0;
    let push: ((v: number) => void) | undefined;
    const reading = source<number>((set) => {
      connects++;
      push = set;
      return () => {};
    }, 1);

    const first = effect(() => {
      reading();
    });
    expect(connects).toBe(1);
    push?.(9);
    first();

    // Unobserved: keeps the last value.
    expect(reading()).toBe(9);

    // Observed again: connect runs a second time.
    const second = effect(() => {
      reading();
    });
    expect(connects).toBe(2);
    second();
  });

  it("shares one connection across multiple subscribers", () => {
    let connects = 0;
    let disconnects = 0;
    const reading = source<number>(() => {
      connects++;
      return () => {
        disconnects++;
      };
    }, 0);

    const a = effect(() => {
      reading();
    });
    const b = effect(() => {
      reading();
    });
    expect(connects).toBe(1); // one connection for both

    a();
    expect(disconnects).toBe(0); // still observed by b
    b();
    expect(disconnects).toBe(1); // last subscriber gone
  });
});

describe("loom scope", () => {
  it("stop() disposes every effect created in the scope", () => {
    const a = state(0);
    let runs = 0;
    const s = scope(() => {
      effect(() => {
        a();
        runs++;
      });
    });
    expect(runs).toBe(1); // initial run
    a(1);
    expect(runs).toBe(2);

    s.stop();
    a(2);
    expect(runs).toBe(2); // disposed: no more runs
  });

  it("pause() suspends runs; resume() re-runs once with the latest value", () => {
    const a = state(0);
    let seen = -1;
    let runs = 0;
    const s = scope(() => {
      effect(() => {
        seen = a();
        runs++;
      });
    });
    expect(runs).toBe(1);
    expect(seen).toBe(0);

    s.pause();
    a(1);
    a(2);
    a(3);
    expect(runs).toBe(1); // suspended
    expect(seen).toBe(0); // stale while paused

    s.resume();
    expect(runs).toBe(2); // a single coalesced catch-up run
    expect(seen).toBe(3); // latest value
  });

  it("resume() does not re-run effects that stayed clean", () => {
    const a = state(0);
    let runs = 0;
    const s = scope(() => {
      effect(() => {
        a();
        runs++;
      });
    });
    expect(runs).toBe(1);

    s.pause();
    s.resume(); // nothing changed while paused
    expect(runs).toBe(1);
  });

  it("pausing a parent scope freezes nested child effects", () => {
    const a = state(0);
    let runs = 0;
    const parent = scope(() => {
      scope(() => {
        effect(() => {
          a();
          runs++;
        });
      });
    });
    expect(runs).toBe(1);

    parent.pause();
    a(1);
    expect(runs).toBe(1); // child frozen by the parent

    parent.resume();
    expect(runs).toBe(2); // catches up
  });

  it("resuming a parent leaves an independently-paused child suspended", () => {
    const a = state(0);
    let runs = 0;
    let child!: Scope;
    const parent = scope(() => {
      child = scope(() => {
        effect(() => {
          a();
          runs++;
        });
      });
    });
    expect(runs).toBe(1);

    child.pause();
    parent.pause();
    a(1);
    expect(runs).toBe(1);

    parent.resume(); // parent unpaused, but child is still paused
    expect(runs).toBe(1); // child stays suspended

    child.resume();
    expect(runs).toBe(2); // now it catches up
  });

  it("stop() cascades to nested scopes", () => {
    const a = state(0);
    let runs = 0;
    const parent = scope(() => {
      scope(() => {
        effect(() => {
          a();
          runs++;
        });
      });
    });
    expect(runs).toBe(1);

    parent.stop();
    a(1);
    expect(runs).toBe(1); // nested effect disposed too
  });

  it("suspends a polled() created inside the scope while paused", () => {
    vi.useFakeTimers();
    let samples = 0;
    let p!: Polled<number>;
    const s = scope(() => {
      p = polled(() => ++samples, 100, { internal: true });
    });
    expect(samples).toBe(1); // initial sample at creation
    vi.advanceTimersByTime(200);
    expect(samples).toBe(3); // two ticks

    s.pause();
    vi.advanceTimersByTime(300);
    expect(samples).toBe(3); // timer cleared while paused

    s.resume();
    expect(samples).toBe(4); // immediate catch-up sample on resume
    vi.advanceTimersByTime(100);
    expect(samples).toBe(5); // timer restarted

    p.stop();
    vi.useRealTimers();
  });

  it("stop() clears a polled() timer created inside the scope", () => {
    vi.useFakeTimers();
    let samples = 0;
    scope(() => {
      polled(() => ++samples, 100, { internal: true });
    }).stop();
    vi.advanceTimersByTime(300);
    expect(samples).toBe(1); // only the creation-time sample; timer cleared by stop()
    vi.useRealTimers();
  });

  it("disconnects a source() inside the scope while paused, reconnecting on resume", () => {
    let connects = 0;
    let disconnects = 0;
    let read!: () => number;
    const s = scope(() => {
      read = source<number>(
        () => {
          connects++;
          return () => {
            disconnects++;
          };
        },
        0,
        { internal: true },
      );
    });
    // Observe from outside the scope so the source connects.
    const stop = effect(() => {
      read();
    });
    expect(connects).toBe(1);
    expect(disconnects).toBe(0);

    s.pause();
    expect(disconnects).toBe(1); // disconnected even though still observed

    s.resume();
    expect(connects).toBe(2); // reconnected because it is still observed

    stop();
    expect(disconnects).toBe(2); // last subscriber gone
    s.stop();
  });
});

describe("loom scope options", () => {
  // Verify the inherited options through inspect() (the snapshot carries each node's metadata).
  const node = (
    predicate: (n: ReturnType<typeof inspect>["nodes"][number]) => boolean,
  ) => inspect().nodes.find(predicate);

  it("applies scope options as defaults to nodes created inside", () => {
    const keep: unknown[] = [];
    scope(
      () => {
        keep.push(state(0, { label: "opts-s" }));
        keep.push(effect(() => {}, { label: "opts-e" }));
      },
      { internal: true },
    );
    const sn = node((n) => n.kind === "state" && n.label === "opts-s");
    const en = node((n) => n.kind === "effect" && n.label === "opts-e");
    expect(sn?.internal).toBe(true);
    expect(en?.internal).toBe(true);
    expect(keep).toHaveLength(2);
  });

  it("lets a node's own options override the scope defaults", () => {
    const keep: unknown[] = [];
    scope(
      () => {
        keep.push(state(0, { label: "own-x", internal: false }));
      },
      { internal: true },
    );
    const sn = node((n) => n.label === "own-x");
    expect(sn?.internal).toBe(false); // the node's own internal overrides the scope default
    expect(keep).toHaveLength(1);
  });

  it("merges options through nested scopes", () => {
    const keep: unknown[] = [];
    scope(
      () => {
        scope(
          () => {
            keep.push(state(0)); // no own options -> inherits both scope defaults
          },
          { internal: true },
        );
      },
      { label: "outer-default" },
    );
    const sn = node((n) => n.label === "outer-default");
    expect(sn?.internal).toBe(true); // from the nested scope
    expect(sn?.label).toBe("outer-default"); // from the outer scope
    expect(keep).toHaveLength(1);
  });

  it("applies scope options to fields() cells", () => {
    const keep: unknown[] = [];
    scope(
      () => {
        keep.push(fields({ a: 1, b: 2 }, { label: "form" }));
      },
      { internal: true },
    );
    const cells = inspect().nodes.filter(
      (n) => n.label === "form.a" || n.label === "form.b",
    );
    expect(cells).toHaveLength(2);
    expect(cells.every((n) => n.internal)).toBe(true);
  });
});

describe("loom scope edge cases", () => {
  it("disposes a throwing scope's already-created effects instead of orphaning them", () => {
    // alien-signals #118.3: a scope body that throws after creating effects must not leak them — the
    // caller never receives a disposer, so a top-level scope would otherwise orphan live effects.
    const a = state(0);
    let runs = 0;
    expect(() =>
      scope(() => {
        effect(() => {
          a();
          runs++;
        });
        throw new Error("boom");
      }),
    ).toThrow("boom");
    const afterCreate = runs; // the effect ran once on creation
    a(1); // a leaked, still-subscribed effect would re-run here
    expect(runs).toBe(afterCreate);
  });

  it("pause/resume/stop are idempotent", () => {
    const a = state(0);
    let runs = 0;
    const s = scope(() => {
      effect(() => {
        a();
        runs++;
      });
    });
    expect(runs).toBe(1);

    s.pause();
    s.pause(); // second pause is a no-op
    a(1);
    expect(runs).toBe(1);

    s.resume();
    s.resume(); // second resume is a no-op (already running)
    expect(runs).toBe(2);

    s.stop();
    s.stop(); // second stop is a no-op
    a(2);
    expect(runs).toBe(2);
  });

  it("does not connect a source that nothing observes when resumed", () => {
    let connects = 0;
    const s = scope(() => {
      source<number>(
        () => {
          connects++;
          return () => {};
        },
        0,
        { internal: true },
      );
    });
    expect(connects).toBe(0); // never observed -> never connected

    s.pause();
    s.resume();
    expect(connects).toBe(0); // resume must not connect an unobserved source
    s.stop();
  });

  it("stopping a child scope directly detaches it from its parent", () => {
    const a = state(0);
    let parentRuns = 0;
    let childRuns = 0;
    let child!: Scope;
    const parent = scope(() => {
      effect(() => {
        a();
        parentRuns++;
      });
      child = scope(() => {
        effect(() => {
          a();
          childRuns++;
        });
      });
    });
    expect(parentRuns).toBe(1);
    expect(childRuns).toBe(1);

    child.stop(); // dispose + detach the child only
    a(1);
    expect(childRuns).toBe(1); // child disposed
    expect(parentRuns).toBe(2); // parent still live

    parent.stop();
    a(2);
    expect(parentRuns).toBe(2); // parent now disposed too (no double-free on the child)
  });

  it("resuming a child while its parent is paused keeps it suspended", () => {
    const a = state(0);
    let runs = 0;
    let child!: Scope;
    const parent = scope(() => {
      child = scope(() => {
        effect(() => {
          a();
          runs++;
        });
      });
    });
    expect(runs).toBe(1);

    parent.pause();
    child.pause();
    a(1);
    child.resume(); // parent still paused -> the chain stays suspended
    expect(runs).toBe(1);

    parent.resume(); // chain now fully unpaused -> the child catches up
    expect(runs).toBe(2);
  });
});

describe("loom coverage", () => {
  it("records every built-in channel and excludes internal nodes", () => {
    const m = meter([
      events.read,
      events.write,
      events.compute,
      events.effect,
      events.flush,
      events.create,
      events.dispose,
    ]);

    const a = state(1); // create
    const c = computed(() => a() * 2); // create
    const e = effect(() => {
      c();
    }); // create + run -> read + compute
    a(5); // write -> flush -> effect run

    const hidden = state(0, { internal: true }); // internal create (not counted)
    hidden(1); // internal write (not counted)

    e(); // dispose

    const f = m.read();
    expect(f["loom:create"]?.count).toBe(3); // a, c, e (hidden excluded)
    expect(f["loom:write"]?.count).toBe(1); // a(5) (hidden's write excluded)
    expect(f["loom:read"]?.count ?? 0).toBeGreaterThan(0);
    expect(f["loom:compute"]?.count ?? 0).toBeGreaterThan(0);
    expect(f["loom:effect"]?.count ?? 0).toBeGreaterThan(0);
    expect(f["loom:flush"]?.count ?? 0).toBeGreaterThan(0);
    expect(f["loom:dispose"]?.count).toBe(1); // e disposed
    m.stop();
  });

  it("disposes child effects when the parent re-runs", () => {
    const outer = state(0);
    const inner = state(0);
    let childRuns = 0;
    let childCleanups = 0;
    const stop = effect(() => {
      outer();
      effect(() => {
        inner();
        childRuns++;
        return () => {
          childCleanups++;
        };
      });
    });
    expect(childRuns).toBe(1);

    inner(1); // child re-runs
    expect(childRuns).toBe(2);

    outer(1); // parent re-runs -> previous child disposed, a fresh one created
    expect(childCleanups).toBeGreaterThan(0);
    const before = childRuns;
    inner(2); // only the current child reacts (old one disposed)
    expect(childRuns).toBe(before + 1);
    stop();
  });

  it("covers fields() option combinations", () => {
    const keep: unknown[] = [];
    keep.push(fields({ a: 9001 })); // no options
    keep.push(fields({ b: 9002 }, { label: "fcomb" })); // label only
    keep.push(fields({ c: 9003 }, { internal: true })); // internal only
    keep.push(fields({ d: 9004 }, { internal: false, label: "fd" })); // internal flag + label
    const byVal = (v: number) => inspect().nodes.find((n) => n.value === v);
    expect(byVal(9001)?.key).toBe("a"); // no options -> still grouped, key is the field name
    expect(byVal(9002)?.label).toBe("fcomb.b"); // label prefixes the key
    expect(byVal(9003)?.internal).toBe(true); // internal
    expect(byVal(9004)?.label).toBe("fd.d"); // internal flag + label prefix
    expect(keep).toHaveLength(4);
  });

  it("now() falls back to Date.now when performance is missing at load", async () => {
    // The clock is resolved once at module load, so the fallback needs a fresh module instance
    // imported while `performance` is absent — deleting it at runtime wouldn't be seen.
    const original = globalThis.performance;
    // @ts-expect-error force the fallback branch in now()
    globalThis.performance = undefined;
    vi.resetModules();
    try {
      const loom = await import("./loom.js");
      const m = loom.meter([loom.events.flush]); // a flush meter makes now() run for the timing
      const a = loom.state(0);
      const e = loom.effect(() => {
        a();
      });
      a(1); // flush with timing -> now() runs on the Date.now fallback
      e();
      expect(m.read()["loom:flush"]?.count ?? 0).toBeGreaterThan(0);
      m.stop();
    } finally {
      globalThis.performance = original;
      vi.resetModules();
    }
  });

  it("trigger re-runs subscribers after an in-place mutation", () => {
    const list = state<number[]>([]);
    let seen = 0;
    const stop = effect(() => {
      seen = list().length;
    });
    expect(seen).toBe(0);
    list().push(1);
    trigger(list);
    expect(seen).toBe(1);
    stop();
  });

  it("recomputes computeds lazily through a conditional dependency", () => {
    const toggle = state(true);
    const a = state(1);
    const b = state(2);
    const c = computed(() => (toggle() ? a() : b()));
    const d = computed(() => c() + 1);
    let out = 0;
    const stop = effect(() => {
      out = d();
    });
    expect(out).toBe(2);
    a(10);
    expect(out).toBe(11);
    toggle(false); // now depends on b, not a
    expect(out).toBe(3);
    a(20); // a no longer a dependency -> no recompute of the value
    expect(out).toBe(3);
    b(5);
    expect(out).toBe(6);
    stop();
  });

  it("orders multiple queued effects deterministically", () => {
    const a = state(0);
    const order: number[] = [];
    const s1 = effect(() => {
      a();
      order.push(1);
    });
    const s2 = effect(() => {
      a();
      order.push(2);
    });
    const s3 = effect(() => {
      a();
      order.push(3);
    });
    order.length = 0;
    a(1); // all three re-run in a single flush
    expect(order).toEqual([1, 2, 3]);
    s1();
    s2();
    s3();
  });

  it("inspect exposes the graph", () => {
    const a = state(1, { label: "a" });
    const c = computed(() => a() + 1);
    const stop = effect(() => c());
    const snap = inspect();
    expect(snap.nodes.some((n) => n.label === "a")).toBe(true);
    expect(snap.nodes.some((n) => n.deps.length > 0)).toBe(true);
    stop();
  });
});

describe("loom coverage — operators and edges", () => {
  it("creates and updates a source under a meter", () => {
    const m = meter([events.create]);
    let push: ((v: number) => void) | undefined;
    const s = source<number>((set) => {
      push = set;
      return () => {};
    }, 0);
    expect(m.read()["loom:create"]?.count).toBe(1); // source create counted
    m.stop();

    let seen = -1;
    const stop = effect(() => {
      seen = s();
    });
    expect(seen).toBe(0);
    push?.(1); // producer pushes -> propagate + flush
    expect(seen).toBe(1);
    push?.(1); // same value -> sourceSet dedupe
    expect(seen).toBe(1);

    stop(); // unobserved
    push?.(2); // no subscribers -> set value without propagation
    expect(s()).toBe(2); // unobserved dirty read returns the latest value
  });

  it("flushes once after a nested batch", () => {
    const a = state(0);
    let runs = 0;
    const stop = effect(() => {
      a();
      runs++;
    });
    runs = 0;
    batch(() => {
      a(1);
      batch(() => {
        a(2); // inner batch decrement !== 0 -> no flush yet
      });
      a(3);
    });
    expect(runs).toBe(1); // single flush for the whole nested batch
    stop();
  });

  it("ignores a second meter stop and reports node metadata", () => {
    const m = meter([events.write]);
    m.stop();
    m.stop(); // idempotent

    const target = { tag: "host" };
    const s = effect(() => {}, { label: "with-target", target });
    const node = inspect().nodes.find((n) => n.label === "with-target");
    expect(node?.target).toBe(target);
    s();
  });

  it("exposes deps and subs ids in inspect snapshots", () => {
    const a = state(1, { label: "dep-a" });
    const c = computed(() => a() + 1, { label: "dep-c" });
    const stop = effect(() => c(), { label: "dep-e" });
    const snap = inspect();
    const computedNode = snap.nodes.find((n) => n.label === "dep-c");
    // computed has a as a dep and the effect as a sub
    expect(computedNode?.deps.length).toBeGreaterThan(0);
    expect(computedNode?.subs.length).toBeGreaterThan(0);
    stop();
  });
});

describe("loom deferred effects", () => {
  // A manual scheduler: capture the drain so the test fires it deterministically (no real timers).
  let fire: ((hasBudget: () => boolean) => void) | null = null;
  beforeEach(() => {
    fire = null;
    configure({
      deferScheduler: (drain) => {
        fire = drain;
        return () => {
          fire = null;
        };
      },
    });
  });
  afterEach(() => {
    // Drain any pending deferred work so the module-level drain-scheduled state (correct in prod,
    // where the real scheduler always fires) doesn't leak into the next test's coalescing.
    while (fire) {
      const f = fire;
      fire = null;
      f(() => true);
    }
  });

  it("runs the first pass synchronously but defers re-runs, coalesced to the latest value", () => {
    const a = state(0);
    const seen: number[] = [];
    const stop = effect(() => seen.push(a()), { defer: true });
    expect(seen).toEqual([0]); // initial run is synchronous (deps tracked, first output immediate)
    a(1);
    a(2);
    a(3);
    expect(seen).toEqual([0]); // re-runs did NOT happen synchronously
    expect(fire).not.toBeNull(); // a drain was scheduled
    fire?.(() => true);
    expect(seen).toEqual([0, 3]); // one re-run, coalesced — saw the latest value, skipped 1 and 2
    stop();
  });

  it("the scheduler controls timing — a synchronous scheduler makes deferred effects run at once", () => {
    configure({
      deferScheduler: (drain) => {
        drain(() => true);
        return () => {};
      },
    });
    const a = state(0);
    const seen: number[] = [];
    const stop = effect(() => seen.push(a()), { defer: true });
    a(1);
    expect(seen).toEqual([0, 1]); // ran synchronously because the scheduler ran the drain inline
    stop();
  });

  it("uses the default maxStale (200), overridable per effect", () => {
    let captured = -1;
    configure({
      deferScheduler: (drain, maxStale) => {
        captured = maxStale;
        fire = drain;
        return () => {};
      },
    });
    const a = state(0);
    const stopA = effect(() => a(), { defer: true });
    a(1);
    expect(captured).toBe(200); // the default floor
    fire?.(() => true);
    const b = state(0);
    const stopB = effect(() => b(), { defer: true, maxStale: 50 });
    b(1);
    expect(captured).toBe(50); // per-effect override
    stopA();
    stopB();
  });

  it("suspends with its scope: pause skips the drain, resume re-runs it", () => {
    const a = state(0);
    const seen: number[] = [];
    const s = scope(() => {
      effect(() => seen.push(a()), { defer: true });
    });
    expect(seen).toEqual([0]);
    s.pause();
    a(1);
    expect(fire).toBeNull(); // nothing scheduled while the scope is paused
    s.resume(); // re-queues the now-dirty deferred effect into the lane
    fire?.(() => true);
    expect(seen).toEqual([0, 1]); // ran on resume
    s.stop();
  });

  it("a stopped deferred effect is dropped from the queue before it drains", () => {
    const a = state(0);
    const seen: number[] = [];
    const stop = effect(() => seen.push(a()), { defer: true });
    a(1);
    stop(); // disposes + removes from the deferred queue
    fire?.(() => true);
    expect(seen).toEqual([0]); // the pending re-run never happened
  });

  it("processes only what fits the budget and reschedules the rest", () => {
    const cells = [state(0), state(0), state(0)];
    const ran: number[] = [];
    const stops = cells.map((c, i) =>
      effect(
        () => {
          c();
          ran.push(i);
        },
        { defer: true },
      ),
    );
    ran.length = 0;
    for (const c of cells) c(1); // all three queued
    let budget = 2;
    fire?.(() => budget-- > 0); // budget for 2
    expect(ran).toEqual([0, 1]); // only two ran; the third was rescheduled
    expect(fire).not.toBeNull(); // a follow-up drain is pending
    fire?.(() => true);
    expect(ran).toEqual([0, 1, 2]); // the leftover ran next time
    for (const s of stops) s();
  });

  it("a budget-exhausted leftover reschedules with the time remaining, not a fresh maxStale", () => {
    let captured = -1;
    configure({
      deferScheduler: (drain, maxStale) => {
        captured = maxStale;
        fire = drain;
        return () => {};
      },
    });
    let t = 0;
    const clock = vi.spyOn(performance, "now").mockImplementation(() => t);
    try {
      const a = state(0);
      const stop = effect(() => a(), { defer: true });
      a(1);
      expect(captured).toBe(200); // scheduled with the full floor at enqueue
      t = 150; // 150ms pass before the drain fires, with no budget to run anything
      fire?.(() => false);
      expect(captured).toBe(50); // the remainder of the original deadline — total staleness stays ≤ 200
      fire?.(() => true);
      stop();
    } finally {
      clock.mockRestore();
    }
  });
});

describe("loom scope bookkeeping", () => {
  // Regression for the audit finding: manually stopping an effect inside a long-lived scope must
  // release the EffectNode so it can be GC'd, not retain it in scope.effects until the scope stops.
  // The marker is reachable only through the effect's fn closure, so it survives a forced GC iff the
  // node is still retained. stopEffect now swap-removes from scope.effects, so it's collectable.
  // Needs a real forced GC (the `test` script sets NODE_OPTIONS=--expose-gc); skip rather than run a
  // non-deterministic assertion when vitest is invoked without it (e.g. a bare `npx vitest run`).
  it.skipIf(typeof globalThis.gc !== "function")(
    "releases a manually-stopped effect from its long-lived scope's bookkeeping",
    async () => {
      let ref!: WeakRef<object>;
      const s = scope(() => {
        const marker = {};
        const stop = effect(() => void marker);
        ref = new WeakRef(marker);
        stop(); // manual stop while the scope stays alive
      });
      for (let i = 0; i < 6; i++) {
        globalThis.gc?.();
        await new Promise((r) => setTimeout(r, 0));
      }
      expect(ref.deref()).toBeUndefined();
      s.stop();
    },
  );
});

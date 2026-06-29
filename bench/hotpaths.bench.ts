import { bench, describe } from "vitest";
import {
  computed,
  configure,
  effect,
  mutate,
  scope,
  state,
  trigger,
} from "../src/loom.js";

// Focused benches for the hot paths flagged by the API/perf audit. Baselines to measure the fixes
// against: deferred-queue O(n²), create-only WeakMap registration, trigger/mutate watcher alloc,
// and deep scope pause/resume ancestor walks.

// 1. Deferred queue — build the queue to N (deferEffect.includes ×N), then one drain (shift ×N).
describe("deferred queue", () => {
  for (const N of [1000, 10000]) {
    bench(`${N} deferred effects: enqueue all + single drain`, () => {
      let fire: ((b: () => boolean) => void) | undefined;
      configure({
        deferScheduler: (drain) => {
          fire = drain;
          return () => {};
        },
      });
      const cells = Array.from({ length: N }, () => state(0));
      const stops = cells.map((c) => effect(() => void c(), { defer: true }));
      for (let i = 0; i < N; i++) (cells[i] as (v: number) => void)(i + 1);
      fire?.(() => true);
      for (const s of stops) s();
    });
  }
});

// 2. Create-only throughput — node creation + the always-on stateNodes/computedNodes/effectNodes.
describe("create-only", () => {
  bench("create 10k states", () => {
    const out: unknown[] = [];
    for (let i = 0; i < 10_000; i++) out.push(state(i));
    if (out.length < 0) throw new Error("sink");
  });
  bench("create 10k computeds", () => {
    const s = state(0);
    const out: unknown[] = [];
    for (let i = 0; i < 10_000; i++) out.push(computed(() => s()));
    if (out.length < 0) throw new Error("sink");
  });
  bench("create 10k effects", () => {
    const s = state(0);
    const stops = Array.from({ length: 10_000 }, () => effect(() => void s()));
    for (const st of stops) st();
  });
});

// 3. mutate/trigger-heavy object updates — the per-call temporary watcher allocation.
describe("mutate / trigger", () => {
  bench("mutate 50k object updates", () => {
    const obj = state({ n: 0 });
    let sink = 0;
    const stop = effect(() => {
      sink = obj().n;
    });
    for (let i = 0; i < 50_000; i++)
      mutate(obj, (o) => {
        o.n = i;
      });
    stop();
    if (sink < 0) throw new Error("sink");
  });
  bench("trigger 50k", () => {
    const obj = state({ n: 0 });
    const stop = effect(() => void obj());
    for (let i = 0; i < 50_000; i++) trigger(obj);
    stop();
  });
});

// 4. Deep scope pause/resume — scopePaused ancestor walk (notify-while-paused) + flushScope.
describe("deep scope pause/resume", () => {
  bench("depth 50: dirty-while-paused + resume x300", () => {
    const cells: Array<(v: number) => void> = [];
    const build = (depth: number) =>
      scope(() => {
        const c = state(0);
        cells.push(c as (v: number) => void);
        effect(() => void c());
        if (depth > 0) build(depth - 1);
      });
    const root = build(50);
    for (let i = 0; i < 300; i++) {
      root.pause();
      for (const c of cells) c(i);
      root.resume();
    }
    root.stop();
  });
});

import { bench, describe } from "vitest";
import { computed, effect, state } from "../src/loom.js";

// Store results on globalThis so V8 cannot prove the benchmark's work is unobservable and fold the
// loops away. A module-local impossible guard is not a sufficient black box for an optimizing JIT.
const benchGlobal = globalThis as typeof globalThis & {
  __loomBenchmarkSink?: unknown;
};

// Isolates the per-call accessor cost (read entry, write entry) away from the chaos workload.
describe("state accessor throughput", () => {
  // Rotate through independent closures with runtime-derived values. A single constant signal lets
  // V8 hoist/invariant-fold the entire loop even when the final sum escapes.
  const accessors = Array.from({ length: 1024 }, (_, index) =>
    state((Date.now() + index) & 255),
  );
  bench("read x100k (no sub)", () => {
    let x = 0;
    for (let i = 0; i < 100_000; i++) {
      const read = accessors[i & 1023] as (typeof accessors)[number];
      x += read();
    }
    benchGlobal.__loomBenchmarkSink = x;
  });
  bench("write x100k", () => {
    const salt = performance.now() | 0;
    for (let i = 0; i < 100_000; i++) {
      const write = accessors[i & 1023] as (typeof accessors)[number];
      write(i ^ salt);
    }
    let x = 0;
    for (const read of accessors) x += read();
    benchGlobal.__loomBenchmarkSink = x;
  });
  // Read inside a live effect dep — exercises link + the channel-emit guard on the read path.
  const a = state(0);
  const d = computed(() => (a() as number) * 2);
  let sink = 0;
  effect(() => {
    sink = d() as number;
  });
  bench("write->effect x50k", () => {
    for (let i = 0; i < 50_000; i++) a(i);
    benchGlobal.__loomBenchmarkSink = sink;
  });
});

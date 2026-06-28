import { bench, describe } from "vitest";
import { computed, effect, state } from "../src/loom.js";

// Isolates the per-call accessor cost (read entry, write entry) away from the chaos workload.
describe("state accessor throughput", () => {
  const s = state(0);
  bench("read x100k (no sub)", () => {
    let x = 0;
    for (let i = 0; i < 100_000; i++) x += s() as number;
    if (x === -1) throw new Error("sink");
  });
  bench("write x100k", () => {
    for (let i = 0; i < 100_000; i++) s(i);
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
    if (sink === -1) throw new Error("sink");
  });
});

// Measure the built ESM package without Vitest's source-module instrumentation.
// Run once per checkout: node bench/core-production.mjs [path/to/dist/loom/loom.js]
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const file = resolve(process.argv[2] ?? "dist/loom/loom.js");
const { state, computed, effect, scope, mutate, trigger } = await import(
  pathToFileURL(file)
);
const cases = {
  "create/10000-states": () => {
    const nodes = [];
    for (let i = 0; i < 10000; i++) nodes.push(state(i));
    return nodes;
  },
  "create/10000-computeds": () => {
    const nodes = [];
    for (let i = 0; i < 10000; i++) nodes.push(computed(() => i));
    return nodes;
  },
  "create-stop/10000-effects": () => {
    const stops = [];
    for (let i = 0; i < 10000; i++) stops.push(effect(() => {}));
    for (const stop of stops) stop();
  },
  "mutate/50000": () => {
    const value = state({ n: 0 });
    const stop = effect(() => value());
    for (let i = 0; i < 50000; i++)
      mutate(value, (x) => {
        x.n++;
      });
    stop();
  },
  "trigger/50000": () => {
    const value = state(0);
    const stop = effect(() => value());
    for (let i = 0; i < 50000; i++) trigger(value);
    stop();
  },
  "scope/10000-effects": () => {
    const owner = scope(() => {
      for (let i = 0; i < 10000; i++) effect(() => {});
    });
    owner.pause();
    owner.resume();
    owner.stop();
  },
};
const results = [];
for (const [name, run] of Object.entries(cases)) {
  for (let i = 0; i < 40; i++) run();
  const times = [];
  for (let sample = 0; sample < 21; sample++) {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const start = performance.now();
    for (let i = 0; i < 10; i++) run();
    times.push((performance.now() - start) / 10);
  }
  times.sort((a, b) => a - b);
  results.push({
    name,
    medianMs: times[10],
    minMs: times[0],
    maxMs: times[20],
  });
}
console.log(JSON.stringify({ node: process.version, file, results }, null, 2));

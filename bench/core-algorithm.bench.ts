import {
  computed as alienComputed,
  effect as alienEffect,
  signal as alienSignal,
  endBatch,
  startBatch,
} from "alien-signals";
import { bench, describe } from "vitest";
import { batch, computed, effect, scope, state } from "../src/loom.js";

let sink = 0;
const consume = (value: number): void => {
  sink = (sink + value) | 0;
};

const loomDirect = directGraph(state, effect);
const alienDirect = directGraph(alienSignal, alienEffect);
const loomFanout = fanoutGraph(state, effect);
const alienFanout = fanoutGraph(alienSignal, alienEffect);
const loomChain = loomComputedChain();
const alienChain = alienComputedChain();
const loomDynamic = dynamicGraph(state, effect);
const alienDynamic = dynamicGraph(alienSignal, alienEffect);
const loomBatched = loomBatchGraph();
const alienBatched = alienBatchGraph();
const loomRepeatedWrites = repeatedWriteGraph(state, effect, batch);
const alienRepeatedWrites = repeatedWriteGraph(
  alienSignal,
  alienEffect,
  alienBatch,
);
const loomCascade = cascadeGraph(state, effect);
const alienCascade = cascadeGraph(alienSignal, alienEffect);
const loomScoped = scopedGraph();

describe("core algorithm: loom vs alien-signals", () => {
  bench("loom: direct write -> effect", loomDirect);
  bench("alien: direct write -> effect", alienDirect);
  bench("loom: fanout 100 effects", loomFanout);
  bench("alien: fanout 100 effects", alienFanout);
  bench("loom: computed chain depth 25", loomChain);
  bench("alien: computed chain depth 25", alienChain);
  bench("loom: dynamic deps 64 of 128", loomDynamic);
  bench("alien: dynamic deps 64 of 128", alienDynamic);
  bench("loom: batch 100 sources -> effect", loomBatched);
  bench("alien: batch 100 sources -> effect", alienBatched);
  bench("loom: batch 100 writes -> 100 effects", loomRepeatedWrites);
  bench("alien: batch 100 writes -> 100 effects", alienRepeatedWrites);
  bench("loom: effect cascade depth 100", loomCascade);
  bench("alien: effect cascade depth 100", alienCascade);
  bench("loom: scoped write -> effect", loomScoped);
});

interface Signal<T> {
  (): T;
  (value: T): void;
}

function directGraph(
  makeSignal: (initial: number) => Signal<number>,
  makeEffect: (fn: () => void) => () => void,
): () => void {
  const source = makeSignal(0);
  makeEffect(() => consume(source()));
  let value = 0;
  return () => source(++value);
}

function fanoutGraph(
  makeSignal: (initial: number) => Signal<number>,
  makeEffect: (fn: () => void) => () => void,
): () => void {
  const source = makeSignal(0);
  for (let index = 0; index < 100; index++) {
    makeEffect(() => consume(source() + index));
  }
  let value = 0;
  return () => source(++value);
}

function loomComputedChain(): () => void {
  const source = state(0);
  let tail: () => number = source;
  for (let index = 0; index < 25; index++) {
    const previous = tail;
    tail = computed(() => previous() + 1);
  }
  effect(() => consume(tail()));
  let value = 0;
  return () => source(++value);
}

function alienComputedChain(): () => void {
  const source = alienSignal(0);
  let tail: () => number = source;
  for (let index = 0; index < 25; index++) {
    const previous = tail;
    tail = alienComputed(() => previous() + 1);
  }
  alienEffect(() => consume(tail()));
  let value = 0;
  return () => source(++value);
}

function dynamicGraph(
  makeSignal: (initial: number) => Signal<number>,
  makeEffect: (fn: () => void) => () => void,
): () => void {
  const mode = makeSignal(0);
  const values = Array.from({ length: 128 }, (_, index) => makeSignal(index));
  makeEffect(() => {
    const parity = mode() & 1;
    let total = 0;
    for (let index = parity; index < values.length; index += 2) {
      total += (values[index] as Signal<number>)();
    }
    consume(total);
  });
  let value = 0;
  return () => mode(++value);
}

function loomBatchGraph(): () => void {
  const values = Array.from({ length: 100 }, () => state(0));
  effect(() => {
    let total = 0;
    for (const value of values) total += value();
    consume(total);
  });
  let next = 0;
  return () => {
    next++;
    batch(() => {
      for (const value of values) value(next);
    });
  };
}

function alienBatchGraph(): () => void {
  const values = Array.from({ length: 100 }, () => alienSignal(0));
  alienEffect(() => {
    let total = 0;
    for (const value of values) total += value();
    consume(total);
  });
  let next = 0;
  return () => {
    next++;
    startBatch();
    for (const value of values) value(next);
    endBatch();
  };
}

function alienBatch<T>(fn: () => T): T {
  startBatch();
  try {
    return fn();
  } finally {
    endBatch();
  }
}

function repeatedWriteGraph(
  makeSignal: (initial: number) => Signal<number>,
  makeEffect: (fn: () => void) => () => void,
  runBatch: <T>(fn: () => T) => T,
): () => void {
  const source = makeSignal(0);
  for (let index = 0; index < 100; index++) {
    makeEffect(() => consume(source() + index));
  }
  let value = 0;
  return () => {
    runBatch(() => {
      for (let index = 0; index < 100; index++) source(++value);
    });
  };
}

function cascadeGraph(
  makeSignal: (initial: number) => Signal<number>,
  makeEffect: (fn: () => void) => () => void,
): () => void {
  const values = Array.from({ length: 100 }, () => makeSignal(0));
  for (let index = 0; index < values.length - 1; index++) {
    const current = values[index] as Signal<number>;
    const next = values[index + 1] as Signal<number>;
    makeEffect(() => next(current()));
  }
  makeEffect(() => consume((values.at(-1) as Signal<number>)()));
  let value = 0;
  return () => (values[0] as Signal<number>)(++value);
}

function scopedGraph(): () => void {
  const source = state(0);
  scope(() => {
    effect(() => consume(source()));
  });
  let value = 0;
  return () => source(++value);
}

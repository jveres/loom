import {
  computed as alienComputed,
  effect as alienEffect,
  signal as alienSignal,
  endBatch,
  startBatch,
} from "alien-signals";
import { expect, it } from "vitest";
import { batch, computed, effect, state } from "../loom.js";

interface Signal {
  (): number;
  (value: number): void;
}

interface ReactiveApi {
  state(initial: number): Signal;
  computed(getter: () => number): () => number;
  effect(fn: () => void): () => void;
  batch<T>(fn: () => T): T;
}

const loomApi: ReactiveApi = { state, computed, effect, batch };
const alienApi: ReactiveApi = {
  state: alienSignal,
  computed: alienComputed,
  effect: alienEffect,
  batch<T>(fn: () => T): T {
    startBatch();
    try {
      return fn();
    } finally {
      endBatch();
    }
  },
};

it("matches alien-signals across deterministic dynamic batch churn", () => {
  let seed = 0x6d2b79f5;
  const random = (): number => {
    seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
    return (seed ^ (seed >>> 14)) >>> 0;
  };
  const actions = Array.from({ length: 500 }, () =>
    Array.from({ length: 1 + (random() % 6) }, () => ({
      index: random() % 16,
      value: (random() % 17) - 8,
    })),
  );

  const run = (api: ReactiveApi): number[][] => {
    const values = Array.from({ length: 16 }, (_, index) => api.state(index));
    const mode = api.state(0);
    const derived = Array.from({ length: 8 }, (_, index) =>
      api.computed(() => {
        const offset = mode() & 1 ? 1 : 3;
        return (
          (values[index] as Signal)() +
          (values[(index + offset) & 15] as Signal)()
        );
      }),
    );
    const log: number[][] = [];
    let step = -1;
    const stops = Array.from({ length: 12 }, (_, index) =>
      api.effect(() => {
        const selected = (derived[index & 7] as () => number)();
        const raw = (values[(index * 5 + mode()) & 15] as Signal)();
        log.push([step, index, selected, raw]);
      }),
    );

    for (step = 0; step < actions.length; step++) {
      const writes = actions[step] as Array<{
        readonly index: number;
        readonly value: number;
      }>;
      api.batch(() => {
        mode(step & 3);
        for (const write of writes)
          (values[write.index] as Signal)(write.value);
      });
    }
    for (const stop of stops) stop();
    return log;
  };

  expect(run(loomApi)).toEqual(run(alienApi));
});

import { effect, scope, source } from "loom";
import { expect, it, onTestFinished } from "vitest";
import type { Read } from "./loom.js";

it("does not connect a scoped source first observed while its owner is paused", () => {
  let connections = 0;
  let read!: Read<number>;
  const owner = scope(() => {
    read = source((set) => {
      connections++;
      set(42);
      return () => {};
    }, 0);
  });
  onTestFinished(owner.stop);
  owner.pause();
  const seen: number[] = [];
  const stop = effect(() => {
    seen.push(read());
  });
  onTestFinished(stop);
  expect(connections).toBe(0);
  expect(seen).toEqual([0]);
  owner.resume();
  expect(connections).toBe(1);
  expect(seen).toEqual([0, 42]);
});
it("never connects an escaped source after its owner has stopped", () => {
  let connections = 0;
  let read!: Read<number>;
  const owner = scope(() => {
    read = source(() => {
      connections++;
      return () => {};
    }, 42);
  });
  owner.stop();
  const stop = effect(() => {
    expect(read()).toBe(42);
  });
  stop();
  const again = effect(() => {
    expect(read()).toBe(42);
  });
  again();
  expect(connections).toBe(0);
});
it("ignores disconnected callbacks even after a newer connection starts", () => {
  const pushes: Array<(value: number) => void> = [];
  let read!: Read<number>;
  const owner = scope(() => {
    read = source((set) => {
      pushes.push(set);
      return () => {};
    }, 0);
  });
  onTestFinished(owner.stop);
  const seen: number[] = [];
  const stop = effect(() => {
    seen.push(read());
  });
  onTestFinished(stop);
  pushes[0]?.(1);
  owner.pause();
  pushes[0]?.(2);
  expect(read()).toBe(1);
  owner.resume();
  pushes[1]?.(3);
  pushes[0]?.(4);
  owner.stop();
  pushes[1]?.(5);
  expect(seen).toEqual([0, 1, 3]);
  expect(read()).toBe(3);
});
it("retains a producer's synchronous teardown value but rejects later callbacks", () => {
  let push!: (value: number) => void;
  const read = source((set) => {
    push = set;
    set(1);
    return () => {
      set(0);
    };
  }, 0);
  const stop = effect(() => read());
  stop();
  push(2);
  expect(read()).toBe(0);
});
it.each(["pause", "stop"] as const)(
  "releases a connection when its owner calls %s during connect",
  (action) => {
    let connections = 0;
    let disconnections = 0;
    let read!: Read<number>;
    const owner = scope(() => {
      read = source(() => {
        connections++;
        if (connections === 1) owner[action]();
        return () => {
          disconnections++;
        };
      }, 0);
    });
    onTestFinished(owner.stop);
    const stop = effect(() => read());
    onTestFinished(stop);
    expect(disconnections).toBe(1);
    owner.resume();
    stop();
    expect(connections).toBe(action === "pause" ? 2 : 1);
    expect(disconnections).toBe(connections);
  },
);
it("keeps sources suspended until both nested scope pauses are lifted", () => {
  let connections = 0;
  let read!: Read<number>;
  let child!: ReturnType<typeof scope>;
  const parent = scope(() => {
    child = scope(() => {
      read = source(() => {
        connections++;
        return () => {};
      }, 0);
    });
  });
  onTestFinished(parent.stop);
  child.pause();
  parent.pause();
  const stop = effect(() => read());
  onTestFinished(stop);
  parent.resume();
  expect(connections).toBe(0);
  child.resume();
  expect(connections).toBe(1);
});
it("blocks a new connection during another producer's pause teardown", () => {
  let connections = 0;
  let read!: Read<number>;
  let stopLate: (() => void) | undefined;
  const owner = scope(() => {
    const first = source(
      () => () => {
        stopLate = effect(() => read());
      },
      0,
    );
    effect(() => first());
    read = source(() => {
      connections++;
      return () => {};
    }, 0);
  });
  onTestFinished(() => {
    stopLate?.();
    owner.stop();
    stopLate?.();
  });
  owner.pause();
  expect(connections).toBe(0);
  owner.resume();
  expect(connections).toBe(1);
});
it("keeps the newer teardown when connect synchronously pauses and resumes its owner", () => {
  let connections = 0;
  const disconnected: number[] = [];
  let read!: Read<number>;
  const owner = scope(() => {
    read = source(() => {
      const id = ++connections;
      if (id === 1) {
        owner.pause();
        owner.resume();
      }
      return () => {
        disconnected.push(id);
      };
    }, 0);
  });
  onTestFinished(owner.stop);
  const stop = effect(() => read());
  onTestFinished(stop);
  expect(disconnected).toEqual([1]);
  owner.stop();
  expect(connections).toBe(2);
  expect(disconnected).toEqual([1, 2]);
});
it("keeps a connection started during the previous connection's teardown", () => {
  const pushes: Array<(value: number) => void> = [];
  const disconnected: number[] = [];
  let stopNext: (() => void) | undefined;
  const read = source<number>((set) => {
    const id = pushes.push(set);
    return () => {
      disconnected.push(id);
      if (id === 1) stopNext = effect(() => read());
    };
  }, 0);
  const stop = effect(() => read());
  onTestFinished(() => {
    stop();
    stopNext?.();
  });
  stop();
  pushes[1]?.(42);
  pushes[0]?.(99);
  expect(read()).toBe(42);
  stopNext?.();
  expect(disconnected).toEqual([1, 2]);
});
it("retires callbacks even when producer teardown throws", () => {
  const pushes: Array<(value: number) => void> = [];
  let read!: Read<number>;
  const owner = scope(() => {
    read = source((set) => {
      const first = pushes.length === 0;
      pushes.push(set);
      return () => {
        if (first) throw new Error("teardown failed");
      };
    }, 0);
  });
  onTestFinished(owner.stop);
  const stop = effect(() => read());
  onTestFinished(stop);
  expect(owner.pause).toThrow("teardown failed");
  pushes[0]?.(99);
  expect(read()).toBe(0);
  owner.resume();
  pushes[1]?.(42);
  expect(read()).toBe(42);
});

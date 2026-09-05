import { computed, configure, effect, scope, source, state } from "loom";
import { expect, it, onTestFinished } from "vitest";

it("rethrows an initial computed failure until a dependency changes", () => {
  const ready = state(false);
  const failure = new Error("not ready");
  const value = computed(() => {
    if (!ready()) throw failure;
    return 42;
  });
  expect(value).toThrow(failure);
  expect(value).toThrow(failure);
  ready(true);
  expect(value()).toBe(42);
});
it("preserves thrown undefined instead of treating it as a cached value", () => {
  const value = computed(() => {
    throw undefined;
  });
  expect(value).toThrow();
  expect(value).toThrow();
});
it("recovers an effect whose first computed read fails under a boundary", () => {
  const errors: unknown[] = [];
  const previous = configure({ onError: (error) => errors.push(error) });
  onTestFinished(() => {
    configure(previous);
  });
  const ready = state(false);
  const failure = new Error("not ready");
  const value = computed(() => {
    if (!ready()) throw failure;
    return 42;
  });
  const seen: number[] = [];
  const stop = effect(() => {
    seen.push(value());
  });
  onTestFinished(stop);
  ready(true);
  expect(errors).toEqual([failure]);
  expect(seen).toEqual([42]);
});
it.each([
  { handled: false, nested: false },
  { handled: false, nested: true },
  { handled: true, nested: false },
  { handled: true, nested: true },
])(
  "recovers after an update failure (handled=$handled, nested=$nested)",
  ({ handled, nested }) => {
    const errors: unknown[] = [];
    const previous = configure({
      onError: handled
        ? (error) => {
            errors.push(error);
          }
        : undefined,
    });
    onTestFinished(() => {
      configure(previous);
    });
    const input = state(0);
    const failure = new Error("invalid input");
    const derived = computed(() => {
      if (input() === 1) throw failure;
      return input() * 2;
    });
    const value = nested ? computed(() => derived() + 10) : derived;
    const seen: number[] = [];
    const sibling: number[] = [];
    const owner = scope(() => {
      effect(() => {
        seen.push(value());
      });
      effect(() => {
        sibling.push(input());
      });
    });
    onTestFinished(owner.stop);
    if (handled) expect(() => input(1)).not.toThrow();
    else expect(() => input(1)).toThrow(failure);
    expect(value).toThrow(failure);
    if (handled) expect(sibling).toEqual([0, 1]);
    input(2);
    expect(errors).toEqual(handled ? [failure] : []);
    expect(seen).toEqual(nested ? [10, 14] : [0, 4]);
    expect(sibling.at(-1)).toBe(2);
  },
);
it("delivers recovery even when the result equals the last successful value", () => {
  const previous = configure({ onError: () => {} });
  onTestFinished(() => {
    configure(previous);
  });
  const invalid = state(false);
  const value = computed((previousValue?: number) => {
    if (invalid()) throw new Error("invalid");
    return previousValue ?? 42;
  });
  const seen: number[] = [];
  const stop = effect(() => {
    seen.push(value());
  });
  onTestFinished(stop);
  invalid(true);
  invalid(false);
  expect(seen).toEqual([42, 42]);
});
it("disconnects dependencies after an unhandled initial effect failure", () => {
  const previous = configure({ onError: undefined });
  onTestFinished(() => {
    configure(previous);
  });
  let connected = false;
  const external = source(() => {
    connected = true;
    return () => {
      connected = false;
    };
  }, 0);
  const value = computed(() => {
    external();
    throw new Error("failed");
  });
  expect(() => effect(() => value())).toThrow("failed");
  expect(connected).toBe(false);
});
it("invalidates a computed fallback after the failed dependency recovers", () => {
  const ready = state(false);
  const value = computed(() => {
    if (!ready()) throw new Error("not ready");
    return "loaded";
  });
  const display = computed(() => {
    try {
      return value();
    } catch {
      return "fallback";
    }
  });
  const seen: string[] = [];
  const stop = effect(() => {
    seen.push(display());
  });
  onTestFinished(stop);
  ready(true);
  expect(seen).toEqual(["fallback", "loaded"]);
});
it("releases obsolete producer dependencies during failed reevaluation", () => {
  const previous = configure({ onError: () => {} });
  onTestFinished(() => {
    configure(previous);
  });
  const invalid = state(false);
  let connected = false;
  const external = source(() => {
    connected = true;
    return () => {
      connected = false;
    };
  }, 42);
  const value = computed(() => {
    if (invalid()) throw new Error("invalid");
    return external();
  });
  const seen: number[] = [];
  const stop = effect(() => {
    seen.push(value());
  });
  onTestFinished(stop);
  invalid(true);
  expect(connected).toBe(false);
  invalid(false);
  expect(connected).toBe(true);
  expect(seen).toEqual([42, 42]);
  stop();
  expect(connected).toBe(false);
});

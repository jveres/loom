import { describe, expect, it, vi } from "vitest";
import { frameCoalesced } from "./frame-coalesced.js";

const fakeClock = () => {
  const queue = new Map<number, () => void>();
  let nextId = 1;
  return {
    window: {
      requestAnimationFrame: (fn: () => void): number => {
        const id = nextId++;
        queue.set(id, fn);
        return id;
      },
      cancelAnimationFrame: (id: number): void => {
        queue.delete(id);
      },
    },
    tick: (): void => {
      const fns = [...queue.values()];
      queue.clear();
      for (const fn of fns) fn();
    },
    pending: (): number => queue.size,
  };
};

describe("frameCoalesced", () => {
  it("many requests before the frame run fn once, on the frame", () => {
    const clock = fakeClock();
    const fn = vi.fn();
    const request = frameCoalesced(fn, { window: clock.window });
    request();
    request();
    request();
    expect(fn).not.toHaveBeenCalled();
    expect(clock.pending()).toBe(1);
    clock.tick();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("re-arms after a flush — one run per frame, not one ever", () => {
    const clock = fakeClock();
    const fn = vi.fn();
    const request = frameCoalesced(fn, { window: clock.window });
    request();
    clock.tick();
    request();
    clock.tick();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("stop() cancels the pending run and retires the request", () => {
    const clock = fakeClock();
    const fn = vi.fn();
    const request = frameCoalesced(fn, { window: clock.window });
    request();
    request.stop();
    expect(clock.pending()).toBe(0);
    clock.tick();
    request();
    clock.tick();
    expect(fn).not.toHaveBeenCalled();
  });

  it("runs on the GIVEN clock, never the ambient one", () => {
    const clock = fakeClock();
    const ambient = vi.fn();
    vi.stubGlobal("requestAnimationFrame", ambient);
    const fn = vi.fn();
    const request = frameCoalesced(fn, { window: clock.window });
    request();
    expect(ambient).not.toHaveBeenCalled();
    clock.tick();
    expect(fn).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("falls back to a microtask where the realm has no rAF", async () => {
    const fn = vi.fn();
    const request = frameCoalesced(fn, { window: {} });
    request();
    request();
    await Promise.resolve();
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

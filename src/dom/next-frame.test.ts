// @vitest-environment happy-dom

import { onUnmount, remove } from "loom/dom";
import { afterFrames } from "loom/schedule";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});
// happy-dom's requestAnimationFrame runs on a timer; fake timers drive it.
describe("nextFrame", () => {
  it("runs once before the next frame; the Stop cancels it", () => {
    vi.useFakeTimers();
    const ran = vi.fn();
    afterFrames(1, ran);
    expect(ran).not.toHaveBeenCalled(); // never synchronous
    vi.advanceTimersByTime(50);
    expect(ran).toHaveBeenCalledOnce();
    const cancelled = vi.fn();
    const stop = afterFrames(1, cancelled);
    stop();
    vi.advanceTimersByTime(50);
    expect(cancelled).not.toHaveBeenCalled();
  });
  it("is abandoned with its owner", () => {
    vi.useFakeTimers();
    const owner = document.createElement("div");
    document.body.append(owner);
    const ran = vi.fn();
    onUnmount(
      owner,
      afterFrames(1, ran, {
        window: owner.ownerDocument.defaultView ?? globalThis,
      }),
    );
    remove(owner);
    vi.advanceTimersByTime(50);
    expect(ran).not.toHaveBeenCalled();
  });
});
describe("afterFrames", () => {
  it("chains n frames and cancels the whole chain with one Stop", () => {
    vi.useFakeTimers();
    const ran = vi.fn();
    afterFrames(2, ran);
    vi.advanceTimersByTime(20);
    expect(ran).not.toHaveBeenCalled(); // one frame in
    vi.advanceTimersByTime(40);
    expect(ran).toHaveBeenCalledOnce();
    const cancelled = vi.fn();
    const stop = afterFrames(3, cancelled);
    vi.advanceTimersByTime(20);
    stop(); // mid-chain
    vi.advanceTimersByTime(200);
    expect(cancelled).not.toHaveBeenCalled();
  });
});

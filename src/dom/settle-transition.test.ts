// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { remove } from "./ownership.js";
import { settleTransition } from "./settle-transition.js";

const microtask = (): Promise<void> => Promise.resolve();

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("settleTransition", () => {
  it("settles on a MICROTASK when nothing will transition (reduced motion, no rule)", async () => {
    const el = document.createElement("div");
    document.body.append(el);
    const settled = vi.fn();
    settleTransition(el, "height", settled);
    expect(settled).not.toHaveBeenCalled(); // never synchronous
    await microtask();
    expect(settled).toHaveBeenCalledOnce();
  });

  it("settles on transitionend for THE property, exactly once", () => {
    const el = document.createElement("div");
    el.style.transitionProperty = "height";
    el.style.transitionDuration = "100ms";
    document.body.append(el);
    const settled = vi.fn();
    settleTransition(el, "height", settled);

    // Another property's end is not ours.
    el.dispatchEvent(
      new Event("transitionend", { bubbles: true }) as TransitionEvent,
    );
    const end = new Event("transitionend", { bubbles: true });
    Object.defineProperty(end, "propertyName", { value: "opacity" });
    el.dispatchEvent(end);
    expect(settled).not.toHaveBeenCalled();

    const mine = new Event("transitionend", { bubbles: true });
    Object.defineProperty(mine, "propertyName", { value: "height" });
    el.dispatchEvent(mine);
    expect(settled).toHaveBeenCalledOnce();
    // A late duplicate cannot double-settle.
    el.dispatchEvent(mine);
    expect(settled).toHaveBeenCalledOnce();
  });

  it("an INTERRUPTED transition settles via transitioncancel", () => {
    const el = document.createElement("div");
    el.style.transitionProperty = "height";
    el.style.transitionDuration = "100ms";
    document.body.append(el);
    const settled = vi.fn();
    settleTransition(el, "height", settled);
    const cancel = new Event("transitioncancel", { bubbles: true });
    Object.defineProperty(cancel, "propertyName", { value: "height" });
    el.dispatchEvent(cancel);
    expect(settled).toHaveBeenCalledOnce();
  });

  it("a stalled transition settles on the duration+delay fallback timer", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    el.style.transitionProperty = "height";
    el.style.transitionDuration = "100ms";
    el.style.transitionDelay = "20ms";
    document.body.append(el);
    const settled = vi.fn();
    settleTransition(el, "height", settled);
    vi.advanceTimersByTime(120);
    expect(settled).not.toHaveBeenCalled(); // inside the margin
    vi.advanceTimersByTime(60);
    expect(settled).toHaveBeenCalledOnce();
  });

  it("the returned Stop ABANDONS — even the already-queued microtask settle", async () => {
    const el = document.createElement("div");
    document.body.append(el);
    const settled = vi.fn();
    const stop = settleTransition(el, "height", settled);
    stop();
    await microtask();
    expect(settled).not.toHaveBeenCalled();
  });

  it("a dead node never settles", () => {
    const el = document.createElement("div");
    el.style.transitionProperty = "height";
    el.style.transitionDuration = "100ms";
    document.body.append(el);
    const settled = vi.fn();
    settleTransition(el, "height", settled);
    remove(el);
    const mine = new Event("transitionend", { bubbles: true });
    Object.defineProperty(mine, "propertyName", { value: "height" });
    el.dispatchEvent(mine);
    expect(settled).not.toHaveBeenCalled();
  });
});

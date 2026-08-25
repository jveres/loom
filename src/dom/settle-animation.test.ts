// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { remove } from "./ownership.js";
import { settleAnimation } from "./settle-animation.js";

const microtask = (): Promise<void> => Promise.resolve();
const animationEvent = (type: string, name: string): Event => {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, "animationName", { value: name });
  return event;
};

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("settleAnimation", () => {
  it("settles on a MICROTASK when nothing will animate (animation: none)", async () => {
    const el = document.createElement("div");
    document.body.append(el);
    const settled = vi.fn();
    settleAnimation(el, settled);
    expect(settled).not.toHaveBeenCalled(); // never synchronous
    await microtask();
    expect(settled).toHaveBeenCalledOnce();
  });

  it("settles on animationend for THE named animation, exactly once", () => {
    const el = document.createElement("div");
    el.style.animationName = "enter";
    el.style.animationDuration = "100ms";
    document.body.append(el);
    const settled = vi.fn();
    settleAnimation(el, settled, "enter");

    el.dispatchEvent(animationEvent("animationend", "other"));
    expect(settled).not.toHaveBeenCalled();
    el.dispatchEvent(animationEvent("animationend", "enter"));
    expect(settled).toHaveBeenCalledOnce();
    el.dispatchEvent(animationEvent("animationend", "enter"));
    expect(settled).toHaveBeenCalledOnce();
  });

  it("an INTERRUPTED animation settles via animationcancel", () => {
    const el = document.createElement("div");
    el.style.animationName = "enter";
    el.style.animationDuration = "100ms";
    document.body.append(el);
    const settled = vi.fn();
    settleAnimation(el, settled);
    el.dispatchEvent(animationEvent("animationcancel", "enter"));
    expect(settled).toHaveBeenCalledOnce();
  });

  it("a stalled animation settles from the computed duration+delay fallback", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    el.style.animationName = "enter";
    el.style.animationDuration = "100ms";
    el.style.animationDelay = "50ms";
    document.body.append(el);
    const settled = vi.fn();
    settleAnimation(el, settled);
    vi.advanceTimersByTime(190);
    expect(settled).not.toHaveBeenCalled();
    vi.advanceTimersByTime(20);
    expect(settled).toHaveBeenCalledOnce();
  });

  it("the Stop abandons the wait, and a dead node never settles", () => {
    vi.useFakeTimers();
    const el = document.createElement("div");
    el.style.animationName = "enter";
    el.style.animationDuration = "100ms";
    document.body.append(el);
    const settled = vi.fn();
    const stop = settleAnimation(el, settled);
    stop();
    el.dispatchEvent(animationEvent("animationend", "enter"));
    vi.advanceTimersByTime(500);
    expect(settled).not.toHaveBeenCalled();

    const dead = document.createElement("div");
    dead.style.animationName = "enter";
    dead.style.animationDuration = "100ms";
    document.body.append(dead);
    const never = vi.fn();
    settleAnimation(dead, never);
    remove(dead);
    dead.dispatchEvent(animationEvent("animationend", "enter"));
    vi.advanceTimersByTime(500);
    expect(never).not.toHaveBeenCalled();
  });
});

// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { onDoublePress, onTap } from "./index.js";

const press = (node: Element, id = 1, x = 10, y = 10): void => {
  node.dispatchEvent(
    new PointerEvent("pointerdown", {
      bubbles: true,
      pointerId: id,
      clientX: x,
      clientY: y,
    }),
  );
};
const release = (node: Element, id = 1, x = 10, y = 10): void => {
  node.dispatchEvent(
    new PointerEvent("pointerup", {
      bubbles: true,
      pointerId: id,
      clientX: x,
      clientY: y,
    }),
  );
};

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("onTap's voice", () => {
  it("recent() is true inside the ghost-click window after a handled tap, false before any tap and after the window", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "Date"] });
    const node = document.createElement("button");
    document.body.append(node);
    const handler = vi.fn();
    const tap = onTap(node, handler);
    expect(tap.recent()).toBe(false);
    press(node);
    release(node);
    expect(handler).toHaveBeenCalledOnce();
    expect(tap.recent()).toBe(true);
    vi.advanceTimersByTime(599);
    expect(tap.recent()).toBe(true);
    vi.advanceTimersByTime(2);
    expect(tap.recent()).toBe(false);
    expect(tap.recent(1000)).toBe(true);
  });
});

describe("onDoublePress", () => {
  it("fires on two taps within the window, resets after firing, and a drag between them breaks the pair", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "Date"] });
    const node = document.createElement("div");
    document.body.append(node);
    const handler = vi.fn();
    onDoublePress(node, handler, { within: 350 });
    press(node);
    release(node);
    vi.advanceTimersByTime(100);
    press(node);
    release(node);
    expect(handler).toHaveBeenCalledOnce();
    // The pair reset: a third tap alone does not fire.
    vi.advanceTimersByTime(100);
    press(node);
    release(node);
    expect(handler).toHaveBeenCalledOnce();
    // Too slow.
    vi.advanceTimersByTime(400);
    press(node);
    release(node);
    expect(handler).toHaveBeenCalledOnce();
    // A drag is not a tap.
    vi.advanceTimersByTime(100);
    press(node, 1, 10, 10);
    release(node, 1, 40, 10);
    expect(handler).toHaveBeenCalledOnce();
  });
});

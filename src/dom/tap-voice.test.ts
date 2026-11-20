// @vitest-environment happy-dom
import { effect, state } from "loom";
import { remove } from "loom/dom";
import { onDoubleTap, onPress, onTap } from "loom/events";
import { afterEach, describe, expect, it, vi } from "vitest";

const press = (node: Element, id = 1, x = 10, y = 10): void => {
  node.dispatchEvent(
    new PointerEvent("pointerdown", {
      isPrimary: true,
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
      isPrimary: true,
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
    tap.stop();
  });
});
describe("onDoubleTap", () => {
  it("fires on two taps within the window, resets after firing, and a drag between them breaks the pair", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "Date"] });
    const node = document.createElement("div");
    document.body.append(node);
    const handler = vi.fn();
    onDoubleTap(node, handler, { withinMs: 350 });
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

const pointerClick = (node: Element, x = 10, y = 10): void => {
  node.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      detail: 1,
      clientX: x,
      clientY: y,
    }),
  );
};

describe("onPress", () => {
  it("fires immediately on tap, suppresses the follow-up click, and still handles keyboard or programmatic clicks", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "Date"] });
    const node = document.createElement("button");
    document.body.append(node);
    const handler = vi.fn();
    const stop = onPress(node, handler);

    press(node);
    release(node);
    expect(handler).toHaveBeenCalledTimes(1);

    pointerClick(node);
    expect(handler).toHaveBeenCalledTimes(1);

    node.click();
    expect(handler).toHaveBeenCalledTimes(2);

    stop();
  });

  it("suppresses a late ghost click after the tapped control unmounts, without blocking clicks elsewhere or after the window", () => {
    vi.useFakeTimers({ toFake: ["performance", "setTimeout", "Date"] });
    const under = document.createElement("button");
    const close = document.createElement("button");
    document.body.append(under, close);

    const opened = vi.fn();
    const stopUnder = onPress(under, opened);
    onPress(close, () => {
      remove(close);
    });

    press(close, 1, 10, 10);
    release(close, 1, 10, 10);
    // Ghost click lands on the button revealed underneath at the same coordinates.
    pointerClick(under, 10, 10);
    expect(opened).toHaveBeenCalledTimes(0);

    // Next click on the revealed button fires normally.
    under.click();
    expect(opened).toHaveBeenCalledTimes(1);

    // Click at distant coordinates right after a tap is not suppressed.
    const save = document.createElement("button");
    document.body.append(save);
    onPress(save, () => {});
    press(save, 1, 10, 10);
    release(save, 1, 10, 10);
    pointerClick(under, 200, 300);
    expect(opened).toHaveBeenCalledTimes(2);

    // Click at the same coordinates after suppressMs expires is not suppressed.
    press(save, 1, 10, 10);
    release(save, 1, 10, 10);
    vi.advanceTimersByTime(601);
    pointerClick(under, 10, 10);
    expect(opened).toHaveBeenCalledTimes(3);

    stopUnder();
    remove(save);
  });

  it("leaves the follow-up click to the page when the handler returns false", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const pageClick = vi.fn();
    document.body.addEventListener("click", pageClick, { once: true });

    const stop = onPress(host, () => false);
    press(host, 1, 10, 10);
    release(host, 1, 10, 10);
    pointerClick(host, 10, 10);
    expect(pageClick).toHaveBeenCalledOnce();

    stop();
  });

  it("blurs an unintentionally ghost-focused contenteditable host while keeping intentional focus", () => {
    const host = document.createElement("div");
    host.contentEditable = "true";
    host.tabIndex = 0;
    const pill = document.createElement("button");
    document.body.append(host, pill);

    onPress(pill, () => {
      remove(pill);
    });
    press(pill, 1, 10, 10);
    release(pill, 1, 10, 10);
    host.focus();
    expect(document.activeElement).toBe(host);
    pointerClick(host, 10, 10);
    expect(document.activeElement).not.toBe(host);

    const edit = document.createElement("button");
    document.body.append(edit);
    onPress(edit, () => {
      host.focus();
      remove(edit);
    });
    press(edit, 1, 10, 10);
    release(edit, 1, 10, 10);
    expect(document.activeElement).toBe(host);
    pointerClick(host, 10, 10);
    expect(document.activeElement).toBe(host);
  });

  it("respects slop, stop, AbortSignal, Loom disposal, untracked execution, and option validation", () => {
    const node = document.createElement("button");
    document.body.append(node);

    expect(() => onPress(node, () => {}, { slop: -1 })).toThrow(RangeError);
    expect(() => onPress(node, () => {}, { suppressMs: Number.NaN })).toThrow(
      RangeError,
    );

    const aborted = vi.fn();
    onPress(node, aborted, { signal: AbortSignal.abort() });
    node.click();
    expect(aborted).not.toHaveBeenCalled();

    const value = state(0);
    const handler = vi.fn(() => {
      value();
    });
    const controller = new AbortController();
    onPress(node, handler, { signal: controller.signal, slop: 8 });

    // Drag beyond slop does not fire.
    press(node, 1, 10, 10);
    release(node, 1, 30, 10);
    expect(handler).toHaveBeenCalledTimes(0);

    // Runs untracked inside an effect.
    let runs = 0;
    const stopEffect = effect(() => {
      runs++;
      node.click();
    });
    value(1);
    expect(runs).toBe(1);
    expect(handler).toHaveBeenCalledTimes(1);

    controller.abort();
    node.click();
    expect(handler).toHaveBeenCalledTimes(1);

    stopEffect();
  });
});

// @vitest-environment happy-dom

import { effect, scope, state } from "loom";
import {
  bind,
  bindAttr,
  bindClass,
  bindStyle,
  h,
  keyedChild,
  list,
  onUnmount,
  pause,
  remove,
  resume,
} from "loom/dom";
import { hoverClass, listen, onTap, pressClass } from "loom/events";
import { afterAnimation, heightFold } from "loom/motion";
import {
  afterFrames,
  frameCoalescer,
  microtaskCoalescer,
  watchSettled,
} from "loom/schedule";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});

describe("consolidated lifecycle contracts", () => {
  it("should keep DOM bindings independent of ambient scope teardown and preserve node pause", () => {
    const value = state(0);
    const node = h("div");
    let stop = () => {};
    const owner = scope(() => {
      stop = bind(node, () => {
        node.textContent = String(value());
      });
    });
    owner.stop();
    value(1);
    expect(node.textContent).toBe("1");
    pause(node);
    value(2);
    expect(node.textContent).toBe("1");
    resume(node);
    expect(node.textContent).toBe("2");
    stop();
    value(3);
    expect(node.textContent).toBe("2");
    remove(node);
  });
  it("should terminate all explicit binding forms on abort", () => {
    const value = state("a");
    const node = h("div");
    const abort = new AbortController();
    const options = { signal: abort.signal };
    bindAttr(node, "title", value, options);
    bindClass(node, "selected", () => value() === "a", options);
    bindStyle(node, "--value", value, options);
    abort.abort();
    value("b");
    expect(node.title).toBe("a");
    expect(node.classList.contains("selected")).toBe(true);
    expect(node.style.getPropertyValue("--value")).toBe("a");
    remove(node);
  });
  it("should install nothing for an already aborted binding", () => {
    const node = h("div");
    const read = vi.fn(() => "a");
    bindAttr(node, "title", read, { signal: AbortSignal.abort() });
    expect(read).not.toHaveBeenCalled();
    expect(node.hasAttribute("title")).toBe(false);
    remove(node);
  });
  it("should run keyed render callbacks untracked", () => {
    const rows = state([1]);
    const incidental = state("a");
    const host = h("div");
    const render = vi.fn(() => h("span", null, incidental()));
    const stop = list(host, rows, { key: (value) => value, render });
    incidental("b");
    expect(render).toHaveBeenCalledTimes(1);
    expect(host.textContent).toBe("a");
    rows([1, 2]);
    expect(render).toHaveBeenCalledTimes(2);
    expect(host.textContent).toBe("ab");
    stop();
    remove(host);
  });
  it("should retry a failed keyed build without retaining abandoned bindings", () => {
    const host = h("div");
    const value = state(0);
    const render = keyedChild(host);
    const reads = vi.fn(() => {
      value();
    });
    expect(() =>
      render("a", () => {
        bind(h("span"), reads);
        throw new Error("build");
      }),
    ).toThrow("build");
    value(1);
    expect(reads).toHaveBeenCalledTimes(1);
    render("a", () => h("span", null, "ready"));
    expect(host.textContent).toBe("ready");
    remove(host);
  });
  it("should preserve a committed keyed replacement when old cleanup throws", () => {
    const old = h("span", null, "old");
    onUnmount(old, () => {
      throw new Error("cleanup");
    });
    const host = h("div", null, old);
    const render = keyedChild(host);
    const build = vi.fn(() => h("span", null, "new"));
    expect(() => render("new", build)).toThrow("cleanup");
    render("new", build);
    expect(build).toHaveBeenCalledTimes(1);
    expect(host.textContent).toBe("new");
    remove(host);
  });
  it("should run native event callbacks untracked and stop them independently of the node", () => {
    const host = h("div");
    const value = state(0);
    let runs = 0;
    const stopListen = listen(
      host,
      "click",
      () => {
        value();
      },
      { owner: host },
    );
    const stopEffect = effect(() => {
      runs++;
      host.dispatchEvent(new Event("click"));
    });
    value(1);
    expect(runs).toBe(1);
    stopListen();
    stopEffect();
    remove(host);
  });
  it("should make event controllers inert after stop", () => {
    const host = h("button");
    const run = vi.fn();
    const tap = onTap(host, run);
    const hover = hoverClass(host);
    const stopPress = pressClass(host);
    tap.stop();
    hover.stop();
    stopPress();
    hover.set(host);
    host.dispatchEvent(
      new PointerEvent("pointerdown", { pointerId: 1, isPrimary: true }),
    );
    host.dispatchEvent(
      new PointerEvent("pointerup", { pointerId: 1, isPrimary: true }),
    );
    expect(run).not.toHaveBeenCalled();
    expect(tap.recent()).toBe(false);
    expect(host.className).toBe("");
    remove(host);
  });
  it("should restore owned fold styles on stop without overwriting a later consumer write", async () => {
    const node = h("div");
    node.style.height = "20px";
    const fold = heightFold(node);
    fold.set(false);
    await Promise.resolve();
    expect(node.hidden).toBe(true);
    fold.stop();
    expect(node.hidden).toBe(false);
    expect(node.style.height).toBe("20px");
    const later = heightFold(node);
    later.set(false);
    node.style.height = "45px";
    later.stop();
    expect(node.style.height).toBe("45px");
    later.set(true);
    expect(node.style.height).toBe("45px");
    remove(node);
  });
});

describe("timing contracts", () => {
  it("should multiply finite animation iterations and include negative delays", () => {
    vi.useFakeTimers();
    const node = h("div");
    document.body.append(node);
    node.style.animationName = "enter";
    node.style.animationDuration = "1s";
    node.style.animationIterationCount = "3";
    node.style.animationDelay = "-500ms";
    const run = vi.fn();
    afterAnimation(node, run);
    vi.advanceTimersByTime(2549);
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(1);
    remove(node);
  });
  it("should repeat CSS duration lists modulo their length", () => {
    vi.useFakeTimers();
    const node = h("div");
    document.body.append(node);
    node.style.animationName = "a, b, c, d";
    node.style.animationDuration = "1s, 2s";
    node.style.animationIterationCount = "1";
    const run = vi.fn();
    afterAnimation(node, run, { name: "d" });
    vi.advanceTimersByTime(2049);
    expect(run).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(run).toHaveBeenCalledTimes(1);
    remove(node);
  });
  it("should not invent a timeout for an infinite animation", () => {
    vi.useFakeTimers();
    const node = h("div");
    document.body.append(node);
    node.style.animationName = "loop";
    node.style.animationDuration = "1s";
    node.style.animationIterationCount = "infinite";
    const run = vi.fn();
    const abort = new AbortController();
    afterAnimation(node, run, { signal: abort.signal });
    vi.advanceTimersByTime(100_000);
    abort.abort();
    expect(run).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    remove(node);
  });
  it("should cancel a microtask without allowing its stale delivery to consume a new request", async () => {
    const run = vi.fn();
    const task = microtaskCoalescer(run);
    task.request();
    task.cancel();
    task.request();
    await Promise.resolve();
    expect(run).toHaveBeenCalledTimes(1);
    task.request();
    task.stop();
    task.request();
    await Promise.resolve();
    expect(run).toHaveBeenCalledTimes(1);
  });
  it("should cancel selected-window frames on abort", () => {
    const cancel = vi.fn();
    const run = vi.fn();
    const abort = new AbortController();
    const task = frameCoalescer(run, {
      signal: abort.signal,
      window: { requestAnimationFrame: () => 42, cancelAnimationFrame: cancel },
    });
    task.request();
    abort.abort();
    task.request();
    expect(cancel).toHaveBeenCalledExactlyOnceWith(42);
    expect(run).not.toHaveBeenCalled();
  });
  it.each([0, -1, 1.5, Infinity, NaN])(
    "should reject invalid frame count %s",
    (count) => {
      expect(() => afterFrames(count, () => {})).toThrow(RangeError);
    },
  );
  it("should cancel quiet-period deliveries on abort", () => {
    vi.useFakeTimers();
    const value = state(0);
    const run = vi.fn();
    const abort = new AbortController();
    const watcher = watchSettled(value, run, {
      delayMs: 20,
      signal: abort.signal,
    });
    value(1);
    abort.abort();
    watcher.flush();
    vi.advanceTimersByTime(30);
    expect(run).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});

it.skipIf(typeof globalThis.gc !== "function")(
  "manual binding stop releases captured values while the target and stop stay live",
  async () => {
    const node = h("div");
    document.body.append(node);
    let reference!: WeakRef<object>;
    const stop = (() => {
      const marker = {};
      reference = new WeakRef(marker);
      return bind(node, () => {
        void marker;
      });
    })();
    stop();
    for (let i = 0; i < 6; i++) {
      await new Promise((resolve) => setTimeout(resolve, 0));
      globalThis.gc?.();
    }
    expect(reference.deref()).toBeUndefined();
    stop();
    remove(node);
  },
);

it("a binding stopping during resume does not skip its sibling", () => {
  const node = h("div");
  const value = state(0);
  let first = 0;
  let second = 0;
  let stopFirst = () => {};
  stopFirst = bind(node, () => {
    first = value();
    if (first > 0) stopFirst();
  });
  bind(node, () => {
    second = value();
  });
  pause(node);
  value(1);
  resume(node);
  expect([first, second]).toEqual([1, 1]);
  value(2);
  expect([first, second]).toEqual([1, 2]);
  remove(node);
});

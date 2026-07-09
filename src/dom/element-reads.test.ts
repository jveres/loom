// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { effect, state } from "../loom.js";
import { attr, classed, h, remove, style } from "./index.js";

describe("attr(el, name) — reactive reads", () => {
  it("tracks attribute set, change, and removal", async () => {
    const el = document.createElement("div");
    const seen: Array<string | null> = [];
    const stop = effect(() => {
      seen.push(attr(el, "data-mode")());
    });
    expect(seen).toEqual([null]);

    el.setAttribute("data-mode", "compact");
    await vi.waitFor(() => expect(seen).toEqual([null, "compact"]));

    el.setAttribute("data-mode", "full");
    await vi.waitFor(() => expect(seen).toEqual([null, "compact", "full"]));

    el.removeAttribute("data-mode");
    await vi.waitFor(() =>
      expect(seen).toEqual([null, "compact", "full", null]),
    );
    stop();
  });

  it("pools per (element, attribute) and filters to subscribed names", async () => {
    const el = document.createElement("div");
    expect(attr(el, "hidden")).toBe(attr(el, "hidden"));
    expect(attr(el, "hidden")).not.toBe(attr(el, "title"));

    const hiddenSeen: Array<string | null> = [];
    const titleSeen: Array<string | null> = [];
    const stopHidden = effect(() => {
      hiddenSeen.push(attr(el, "hidden")());
    });
    const stopTitle = effect(() => {
      titleSeen.push(attr(el, "title")());
    });

    el.setAttribute("hidden", "");
    el.setAttribute("class", "x"); // unsubscribed attribute: filtered out
    await vi.waitFor(() => expect(hiddenSeen).toEqual([null, ""]));
    expect(titleSeen).toEqual([null]); // untouched by either mutation

    // Dropping one signal keeps the other's filter alive.
    stopHidden();
    el.setAttribute("title", "hello");
    await vi.waitFor(() => expect(titleSeen).toEqual([null, "hello"]));
    expect(hiddenSeen).toEqual([null, ""]);
    stopTitle();
  });

  it("many elements share one observer with per-target filters", async () => {
    const a = document.createElement("div");
    const b = document.createElement("div");
    const aSeen: Array<string | null> = [];
    const bSeen: Array<string | null> = [];
    const stopA = effect(() => {
      aSeen.push(attr(a, "data-a")());
    });
    const stopB = effect(() => {
      bSeen.push(attr(b, "data-b")());
    });

    a.setAttribute("data-a", "1");
    b.setAttribute("data-b", "2");
    a.setAttribute("data-b", "wrong-element"); // b's name on a: filtered out
    await vi.waitFor(() => expect(aSeen).toEqual([null, "1"]));
    await vi.waitFor(() => expect(bSeen).toEqual([null, "2"]));

    // Dropping a's signal must not disturb b's observation (shared observer
    // rebuild keeps the survivors).
    stopA();
    b.setAttribute("data-b", "3");
    await vi.waitFor(() => expect(bSeen).toEqual([null, "2", "3"]));
    expect(aSeen).toEqual([null, "1"]);
    stopB();
  });

  it("resyncs on re-subscribe after changing while unobserved", () => {
    const el = document.createElement("div");
    const stop1 = effect(() => attr(el, "data-x")());
    stop1(); // observer disconnected

    el.setAttribute("data-x", "late");
    let now: string | null = null;
    const stop2 = effect(() => {
      now = attr(el, "data-x")();
    });
    expect(now).toBe("late"); // connect() resync, no mutation event needed
    stop2();
  });

  it("classed(el, name) reads class presence reactively", async () => {
    const el = h("div");
    const seen: boolean[] = [];
    const stop = effect(() => {
      seen.push(classed(el, "active")());
    });
    expect(seen).toEqual([false]);
    el.classList.add("active");
    await vi.waitFor(() => expect(seen).toEqual([false, true]));
    el.classList.remove("active");
    await vi.waitFor(() => expect(seen).toEqual([false, true, false]));
    el.classList.add("other"); // class attribute changes, presence does not
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(seen).toEqual([false, true, false]); // deduped by computed()
    stop();
  });

  it("style(el, prop) reads the inline value reactively", async () => {
    const el = h("div");
    const seen: string[] = [];
    const stop = effect(() => {
      seen.push(style(el, "width")());
    });
    expect(seen).toEqual([""]);
    el.style.width = "10px";
    await vi.waitFor(() => expect(seen).toEqual(["", "10px"]));
    stop();
  });

  it("classed(el, name, read) toggles the class as a node-owned binding", () => {
    const on = state(false);
    const el = h("div");
    classed(el, "active", () => on());
    expect(el.classList.contains("active")).toBe(false);
    on(true);
    expect(el.classList.contains("active")).toBe(true);

    remove(el); // node teardown disposes the binding
    on(false);
    expect(el.classList.contains("active")).toBe(true);
  });

  it("style(el, prop, read) binds inline style, camelCase converted", () => {
    const width = state("10px");
    const el = h("div");
    style(el, "maxWidth", () => width()); // camelCase prop name
    expect(el.style.getPropertyValue("max-width")).toBe("10px");
    width("20px");
    expect(el.style.getPropertyValue("max-width")).toBe("20px");

    remove(el);
    width("30px");
    expect(el.style.getPropertyValue("max-width")).toBe("20px");
  });

  it("adds targets incrementally and batches target removals", async () => {
    // Let a teardown queued by the preceding test finish before measuring this subscription batch.
    await Promise.resolve();
    const observe = vi.spyOn(MutationObserver.prototype, "observe");
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect");
    const elements = Array.from({ length: 100 }, () =>
      document.createElement("div"),
    );

    const stops = elements.map((el) => effect(() => attr(el, "data-x")()));

    expect(observe).toHaveBeenCalledTimes(elements.length);
    expect(disconnect).not.toHaveBeenCalled();

    for (const stop of stops) stop();
    expect(disconnect).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});

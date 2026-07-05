// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { effect } from "../loom.js";
import { attrOf } from "./attr-of.js";

describe("attrOf", () => {
  it("tracks attribute set, change, and removal", async () => {
    const el = document.createElement("div");
    const seen: Array<string | null> = [];
    const stop = effect(() => {
      seen.push(attrOf(el, "data-mode")());
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
    expect(attrOf(el, "hidden")).toBe(attrOf(el, "hidden"));
    expect(attrOf(el, "hidden")).not.toBe(attrOf(el, "title"));

    const hiddenSeen: Array<string | null> = [];
    const titleSeen: Array<string | null> = [];
    const stopHidden = effect(() => {
      hiddenSeen.push(attrOf(el, "hidden")());
    });
    const stopTitle = effect(() => {
      titleSeen.push(attrOf(el, "title")());
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
      aSeen.push(attrOf(a, "data-a")());
    });
    const stopB = effect(() => {
      bSeen.push(attrOf(b, "data-b")());
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
    const stop1 = effect(() => attrOf(el, "data-x")());
    stop1(); // observer disconnected

    el.setAttribute("data-x", "late");
    let now: string | null = null;
    const stop2 = effect(() => {
      now = attrOf(el, "data-x")();
    });
    expect(now).toBe("late"); // connect() resync, no mutation event needed
    stop2();
  });
});

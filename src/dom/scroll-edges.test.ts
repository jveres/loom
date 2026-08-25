// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { effect } from "../loom.js";
import { scrollEdges } from "./index.js";

const microtask = (): Promise<void> => Promise.resolve();

// happy-dom has no layout: the scroll metrics are stubbed per element.
const metrics = (
  el: HTMLElement,
  m: { top?: number; height?: number; client?: number },
): void => {
  Object.defineProperty(el, "scrollTop", {
    value: m.top ?? 0,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(el, "scrollHeight", {
    value: m.height ?? 0,
    configurable: true,
  });
  Object.defineProperty(el, "clientHeight", {
    value: m.client ?? 0,
    configurable: true,
  });
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("scrollEdges", () => {
  it("reads {start, end} from the scroll metrics, resyncs on scroll, dedupes equal verdicts", async () => {
    const el = document.createElement("div");
    document.body.append(el);
    metrics(el, { top: 0, height: 300, client: 100 });
    const seen: string[] = [];
    const stop = effect(() => {
      const edges = scrollEdges(el)();
      seen.push(`${edges.start ? "S" : "-"}${edges.end ? "E" : "-"}`);
    });
    expect(seen).toEqual(["-E"]);

    metrics(el, { top: 50, height: 300, client: 100 });
    el.dispatchEvent(new Event("scroll"));
    expect(seen).toEqual(["-E", "SE"]);

    metrics(el, { top: 52, height: 300, client: 100 });
    el.dispatchEvent(new Event("scroll"));
    expect(seen).toEqual(["-E", "SE"]); // same verdict, no notification

    metrics(el, { top: 200, height: 300, client: 100 });
    el.dispatchEvent(new Event("scroll"));
    expect(seen).toEqual(["-E", "SE", "S-"]);
    await microtask();
    stop();
  });

  it("the horizontal axis and epsilon are options; nothing to scroll is {false, false}", () => {
    const el = document.createElement("div");
    document.body.append(el);
    Object.defineProperty(el, "scrollLeft", { value: 10, configurable: true });
    Object.defineProperty(el, "scrollWidth", {
      value: 100,
      configurable: true,
    });
    Object.defineProperty(el, "clientWidth", {
      value: 100,
      configurable: true,
    });
    const read = scrollEdges(el, { axis: "x", epsilon: 12 });
    const stop = effect(() => {
      read();
    });
    expect(read()).toEqual({ start: false, end: false });
    stop();
  });
});

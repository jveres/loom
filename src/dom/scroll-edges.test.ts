// @vitest-environment happy-dom
import { effect } from "loom";
import { scrollEdges } from "loom/browser";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

const microtask = (): Promise<void> => Promise.resolve();
// happy-dom has no layout: the scroll metrics are stubbed per element.
const metrics = (
  el: HTMLElement,
  m: {
    top?: number;
    height?: number;
    client?: number;
  },
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
  vi.unstubAllGlobals();
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
  it("resyncs when a child grows without a child-list change", () => {
    const observed = new Set<Element>();
    let resized = (): void => {};
    vi.stubGlobal(
      "ResizeObserver",
      class {
        constructor(callback: () => void) {
          resized = callback;
        }
        observe(target: Element): void {
          observed.add(target);
        }
        unobserve(target: Element): void {
          observed.delete(target);
        }
        disconnect(): void {
          observed.clear();
        }
      },
    );
    const el = document.createElement("div");
    const child = document.createElement("section");
    el.append(child);
    document.body.append(el);
    metrics(el, { top: 0, height: 100, client: 100 });
    const read = scrollEdges(el);
    const stop = effect(() => {
      read();
    });
    expect(read().end).toBe(false);
    expect(observed.has(child)).toBe(true);
    metrics(el, { top: 0, height: 300, client: 100 }); // the child expanded in place
    resized();
    expect(read().end).toBe(true);
    stop();
    expect(observed.size).toBe(0);
  });
  it("resyncs on a text edit deep inside the content", async () => {
    const el = document.createElement("div");
    const child = document.createElement("p");
    child.append("short");
    el.append(child);
    document.body.append(el);
    metrics(el, { top: 0, height: 100, client: 100 });
    const read = scrollEdges(el);
    const stop = effect(() => {
      read();
    });
    expect(read().end).toBe(false);
    metrics(el, { top: 0, height: 300, client: 100 });
    (child.firstChild as Text).data = "a much longer paragraph";
    await microtask();
    expect(read().end).toBe(true);
    stop();
  });
});

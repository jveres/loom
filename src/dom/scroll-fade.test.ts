// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scrollFade } from "./scroll-fade.js";

// The reduce-motion pool entry is created on the FIRST animated fade
// (mediaRead pools per query for the module's lifetime; the pooled
// connect captures the list the stub returns) — the beforeEach stub
// covers whichever test creates it, so the flip test can drive it.
const reduceList = {
  matches: false,
  listeners: new Set<() => void>(),
  addEventListener(_type: string, cb: () => void): void {
    this.listeners.add(cb);
  },
  removeEventListener(_type: string, cb: () => void): void {
    this.listeners.delete(cb);
  },
  flip(next: boolean): void {
    this.matches = next;
    for (const cb of [...this.listeners]) cb();
  },
};
const realMatchMedia = globalThis.matchMedia?.bind(globalThis);

// happy-dom has no layout: drive the scroll metrics by hand.
function scrollable(metrics: {
  scrollHeight: number;
  clientHeight: number;
  scrollTop: number;
}): HTMLElement {
  const el = document.createElement("div");
  let top = metrics.scrollTop;
  Object.defineProperties(el, {
    scrollHeight: { get: () => metrics.scrollHeight },
    clientHeight: { get: () => metrics.clientHeight },
    scrollTop: {
      get: () => top,
      set: (value: number) => {
        top = value;
      },
    },
  });
  document.body.append(el);
  return el;
}

beforeEach(() => {
  // afterEach unstubs ALL globals — re-arm the media stub per test.
  vi.stubGlobal("matchMedia", (query: string) =>
    query === "(prefers-reduced-motion: reduce)"
      ? reduceList
      : realMatchMedia(query),
  );
  // happy-dom lacks ResizeObserver; the helper only needs construct/observe.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {}
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("scrollFade", () => {
  it("fades only the edges with content beyond them", () => {
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    });
    const dispose = scrollFade(el);
    expect(el.style.getPropertyValue("--loom-scroll-fade-start")).toBe("0px");
    expect(el.style.getPropertyValue("--loom-scroll-fade-end")).toBe("14px");

    el.scrollTop = 50;
    el.dispatchEvent(new Event("scroll"));
    expect(el.style.getPropertyValue("--loom-scroll-fade-start")).toBe("14px");
    expect(el.style.getPropertyValue("--loom-scroll-fade-end")).toBe("14px");

    el.scrollTop = 200; // at the bottom
    el.dispatchEvent(new Event("scroll"));
    expect(el.style.getPropertyValue("--loom-scroll-fade-start")).toBe("14px");
    expect(el.style.getPropertyValue("--loom-scroll-fade-end")).toBe("0px");
    dispose();
  });

  it("keeps an opaque base mask when nothing scrolls, clears on dispose", () => {
    const el = scrollable({
      scrollHeight: 90,
      clientHeight: 100,
      scrollTop: 0,
    });
    const dispose = scrollFade(el);
    // Opaque, not "": clearing would flip the element off the masked raster
    // path and the next fade-in flashes for a frame.
    expect(el.style.maskImage).not.toBe("");
    expect(el.style.getPropertyValue("--loom-scroll-fade-start")).toBe("0px");
    expect(el.style.getPropertyValue("--loom-scroll-fade-end")).toBe("0px");

    const tall = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 50,
    });
    const disposeTall = scrollFade(tall);
    expect(tall.style.maskImage).not.toBe("");
    disposeTall();
    expect(tall.style.maskImage).toBe("");
    dispose();
  });

  it("honors a custom fade size", () => {
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 50,
    });
    const dispose = scrollFade(el, { size: 24 });
    expect(el.style.getPropertyValue("--loom-scroll-fade-start")).toBe("24px");
    expect(el.style.getPropertyValue("--loom-scroll-fade-end")).toBe("24px");
    dispose();
  });

  it("keeps a CSS-driven sticky-header inset opaque", () => {
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 50,
    });
    el.style.setProperty("--scroll-fade-inset", "32px");

    const dispose = scrollFade(el);

    // The fade layer is the INVERSE of the visible result (exclude
    // subtracts it from the opaque base): solid only inside the fade
    // zones, transparent across the inset and the middle.
    expect(el.style.maskImage).toBe(
      "linear-gradient(to bottom, transparent 0, transparent var(--scroll-fade-inset, 0px), #000 var(--scroll-fade-inset, 0px), transparent calc(var(--scroll-fade-inset, 0px) + var(--loom-scroll-fade-start, 0px)), transparent calc(100% - var(--scroll-fade-inset-end, 0px) - var(--loom-scroll-fade-end, 0px)), #000 calc(100% - var(--scroll-fade-inset-end, 0px)), transparent calc(100% - var(--scroll-fade-inset-end, 0px)), transparent 100%), linear-gradient(#000, #000)",
    );
    dispose();
  });

  it("exempts an END inset from the fade (a pinned trailing region)", () => {
    // A sticky bottom group must stay fully opaque: the subtract layer's
    // end-fade run stops where the pinned region begins, leaving the
    // region a transparent (= unsubtracted, opaque) run to 100%.
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    });
    el.style.setProperty("--scroll-fade-inset-end", "64px");
    const dispose = scrollFade(el);
    expect(el.style.maskImage).toContain(
      "#000 calc(100% - var(--scroll-fade-inset-end, 0px)), transparent calc(100% - var(--scroll-fade-inset-end, 0px)), transparent 100%",
    );
    dispose();
  });

  it("keeps the scrollbar gutter out of the fade layers", () => {
    // The fades subtract from an always-opaque base (mask-composite:
    // exclude); sized short of --scroll-fade-gutter on the cross axis,
    // they never reach a classic scrollbar's gutter — no measurement.
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 50,
    });
    const dispose = scrollFade(el);
    expect(el.style.maskImage).toContain("linear-gradient(#000, #000)");
    expect(el.style.maskSize).toBe(
      "calc(100% - var(--scroll-fade-gutter, 0px)) 100%, 100% 100%",
    );
    expect(el.style.maskComposite).toBe("exclude");
    expect(el.style.webkitMaskComposite).toBe("xor");
    dispose();
    expect(el.style.maskSize).toBe("");
    expect(el.style.maskComposite).toBe("");

    const row = document.createElement("div");
    Object.defineProperties(row, {
      scrollWidth: { get: () => 300 },
      clientWidth: { get: () => 100 },
      scrollLeft: { get: () => 0, set: () => {} },
    });
    document.body.append(row);
    const disposeRow = scrollFade(row, { axis: "x" });
    expect(row.style.maskSize).toBe(
      "100% calc(100% - var(--scroll-fade-gutter, 0px)), 100% 100%",
    );
    disposeRow();
  });

  it("animates an edge when a transition duration is set", () => {
    const registerProperty = vi.fn();
    vi.stubGlobal("CSS", { ...globalThis.CSS, registerProperty });
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    });
    const cancel = vi.fn();
    const animate = vi.fn(() => ({ cancel }));
    Object.defineProperty(el, "animate", {
      configurable: true,
      value: animate,
    });
    const dispose = scrollFade(el, { transition: 120 });

    el.scrollTop = 50;
    el.dispatchEvent(new Event("scroll"));

    expect(animate).toHaveBeenCalledWith(
      [
        { "--loom-scroll-fade-start": "0px" },
        { "--loom-scroll-fade-start": "14px" },
      ],
      { duration: 120, easing: "ease-out" },
    );
    dispose();
    expect(cancel).toHaveBeenCalledOnce();
  });

  it("stops animating when reduced-motion flips ON mid-session", () => {
    // The one-shot read went stale here: a fade built before the OS
    // setting flipped kept animating forever. The gate is LIVE now
    // (loom's own mediaRead, held observed for the fade's lifetime).
    vi.stubGlobal("CSS", {
      ...globalThis.CSS,
      registerProperty: vi.fn(),
    });
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    });
    const cancel = vi.fn();
    const animate = vi.fn(() => ({ cancel }));
    Object.defineProperty(el, "animate", {
      configurable: true,
      value: animate,
    });
    const dispose = scrollFade(el, { transition: 120 });

    el.scrollTop = 50;
    el.dispatchEvent(new Event("scroll"));
    expect(animate).toHaveBeenCalledTimes(1);

    reduceList.flip(true);
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
    // The next stop update fell to the no-animation path.
    expect(animate).toHaveBeenCalledTimes(1);

    dispose();
    reduceList.flip(false);
  });

  it('fades horizontally with axis: "x"', () => {
    const el = document.createElement("div");
    let left = 30;
    Object.defineProperties(el, {
      scrollWidth: { get: () => 300 },
      clientWidth: { get: () => 100 },
      scrollLeft: {
        get: () => left,
        set: (value: number) => {
          left = value;
        },
      },
    });
    document.body.append(el);
    const dispose = scrollFade(el, { axis: "x" });
    expect(el.style.maskImage).toContain("to right");
    expect(el.style.getPropertyValue("--loom-scroll-fade-start")).toBe("14px");
    el.scrollLeft = 200; // at the end
    el.dispatchEvent(new Event("scroll"));
    expect(el.style.getPropertyValue("--loom-scroll-fade-end")).toBe("0px");
    dispose();
  });

  it("updates resize observation incrementally when children change", async () => {
    const observed: Element[] = [];
    const unobserved: Element[] = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe(node: Element): void {
          observed.push(node);
        }
        unobserve(node: Element): void {
          unobserved.push(node);
        }
        disconnect(): void {}
      },
    );
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    });
    const first = document.createElement("span");
    el.append(first);
    const dispose = scrollFade(el);
    expect(observed).toEqual([el, first]);

    const second = document.createElement("span");
    el.append(second);
    await vi.waitFor(() => expect(observed).toEqual([el, first, second]));

    first.remove();
    await vi.waitFor(() => expect(unobserved).toEqual([first]));
    dispose();
  });
});

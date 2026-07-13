// @vitest-environment happy-dom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { scrollFade } from "./scroll-fade.js";

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

    expect(el.style.maskImage).toBe(
      "linear-gradient(to bottom, #000 0, #000 var(--scroll-fade-inset, 0px), transparent var(--scroll-fade-inset, 0px), #000 calc(var(--scroll-fade-inset, 0px) + var(--loom-scroll-fade-start, 0px)), #000 calc(100% - var(--scroll-fade-inset-end, 0px) - var(--loom-scroll-fade-end, 0px)), transparent calc(100% - var(--scroll-fade-inset-end, 0px)), #000 calc(100% - var(--scroll-fade-inset-end, 0px)), #000 100%)",
    );
    dispose();
  });

  it("keeps a classic scrollbar's gutter unmasked", () => {
    // Mask layers composite additively: a solid second layer sized to
    // the measured gutter keeps the scrollbar strip opaque while the
    // fade layer stops where the gutter begins (review: the fade
    // faded the scrollbar's ends with the content).
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 50,
    });
    Object.defineProperty(el, "offsetWidth", { value: 240 });
    Object.defineProperty(el, "clientWidth", { value: 229 });
    const dispose = scrollFade(el);
    expect(el.style.maskImage).toContain("linear-gradient(#000, #000)");
    expect(el.style.getPropertyValue("mask-size")).toBe(
      "calc(100% - 11px) 100%, 11px 100%",
    );
    expect(el.style.getPropertyValue("mask-position")).toBe("0 0, 100% 0");
    dispose();
    expect(el.style.getPropertyValue("mask-size")).toBe("");
  });

  it("exempts an END inset from the fade (a pinned trailing region)", () => {
    // A sticky bottom group must stay fully opaque: the fade zone
    // ends where the pinned region begins, and the region itself is
    // an unmasked #000 run to 100%.
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    });
    el.style.setProperty("--scroll-fade-inset-end", "64px");
    const dispose = scrollFade(el);
    expect(el.style.maskImage).toContain(
      "transparent calc(100% - var(--scroll-fade-inset-end, 0px)), #000 calc(100% - var(--scroll-fade-inset-end, 0px)), #000 100%",
    );
    dispose();
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

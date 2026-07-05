// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, vi } from "vitest";
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

describe("scrollFade", () => {
  it("fades only the edges with content beyond them", () => {
    const el = scrollable({
      scrollHeight: 300,
      clientHeight: 100,
      scrollTop: 0,
    });
    const dispose = scrollFade(el);
    expect(el.style.maskImage).toContain("#000 0px");
    expect(el.style.maskImage).toContain("calc(100% - 14px)");

    el.scrollTop = 50;
    el.dispatchEvent(new Event("scroll"));
    expect(el.style.maskImage).toContain("#000 14px");
    expect(el.style.maskImage).toContain("calc(100% - 14px)");

    el.scrollTop = 200; // at the bottom
    el.dispatchEvent(new Event("scroll"));
    expect(el.style.maskImage).toContain("#000 14px");
    expect(el.style.maskImage).toContain("calc(100% - 0px)");
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
    expect(el.style.maskImage).toBe("linear-gradient(#000 0 0)");

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
    expect(el.style.maskImage).toContain("#000 24px");
    dispose();
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
    expect(el.style.maskImage).toContain("#000 14px");
    el.scrollLeft = 200; // at the end
    el.dispatchEvent(new Event("scroll"));
    expect(el.style.maskImage).toContain("calc(100% - 0px)");
    dispose();
  });
});

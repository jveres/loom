// @vitest-environment happy-dom
import { findScroller, reveal } from "loom/layout";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";

// happy-dom has no layout: rects and scroll metrics are stubbed.
const rect = (el: Element, top: number, bottom: number): void => {
  Object.defineProperty(el, "getBoundingClientRect", {
    value: () => ({
      top,
      bottom,
      left: 0,
      right: 0,
      width: 0,
      height: bottom - top,
    }),
    configurable: true,
  });
};
const scrollBox = (el: HTMLElement, slack: boolean): void => {
  el.style.overflowY = "auto";
  Object.defineProperty(el, "scrollHeight", {
    value: slack ? 1000 : 100,
    configurable: true,
  });
  Object.defineProperty(el, "clientHeight", { value: 100, configurable: true });
};
afterEach(() => {
  document.body.replaceChildren();
});
describe("reveal", () => {
  it("scrollParent stops at the body; nearestScroller wants slack", () => {
    const outer = document.createElement("div");
    const inner = document.createElement("div");
    const leaf = document.createElement("p");
    inner.append(leaf);
    outer.append(inner);
    document.body.append(outer);
    document.body.style.overflowY = "auto";
    expect(findScroller(leaf, {})).toBeNull();
    scrollBox(inner, false);
    scrollBox(outer, true);
    expect(findScroller(leaf, {})).toBe(inner);
    expect(
      findScroller(leaf, {
        requireOverflow: true,
      }),
    ).toBe(outer); // inner has no slack
  });
  it("scrolls the BOX only, by the minimal 'nearest' amount, and centers on request", () => {
    const box = document.createElement("div");
    const row = document.createElement("div");
    box.append(row);
    document.body.append(box);
    scrollBox(box, true);
    box.scrollTop = 50;
    rect(box, 0, 100);
    rect(row, 120, 140); // below the bottom edge
    expect(reveal(row)).toBe(true);
    expect(box.scrollTop).toBe(90);
    rect(row, -30, -10); // above the top edge
    reveal(row);
    expect(box.scrollTop).toBe(60);
    rect(row, 20, 40); // visible: nearest does nothing
    reveal(row);
    expect(box.scrollTop).toBe(60);
    reveal(row, { align: "center" });
    expect(box.scrollTop).toBe(40);
  });
  it("ifHidden leaves any visible sliver alone; a selector picks the scroller; no scroller = no move", () => {
    const box = document.createElement("div");
    box.className = "pane";
    const row = document.createElement("div");
    box.append(row);
    document.body.append(box);
    scrollBox(box, true);
    box.scrollTop = 10;
    rect(box, 0, 100);
    rect(row, 90, 300); // taller than the box, a sliver shows
    expect(reveal(row, { ifHidden: true, scroller: ".pane" })).toBe(true);
    expect(box.scrollTop).toBe(10);
    rect(row, 100, 300); // fully hidden
    reveal(row, { ifHidden: true, scroller: ".pane" });
    expect(box.scrollTop).toBe(110);
    const loose = document.createElement("div");
    document.body.append(loose);
    expect(reveal(loose)).toBe(false);
  });
});
describe("reveal on the x axis (Aug 26 — a tab strip)", () => {
  const rectX = (el: Element, left: number, right: number): void => {
    Object.defineProperty(el, "getBoundingClientRect", {
      value: () => ({
        top: 0,
        bottom: 10,
        left,
        right,
        width: right - left,
        height: 10,
      }),
      configurable: true,
    });
  };
  it("scrollParent/nearestScroller read overflow-x and horizontal slack; scrollNearest keeps `margin` px of clearance and scrolls the box only", () => {
    const strip = document.createElement("div");
    const tab = document.createElement("button");
    strip.append(tab);
    document.body.append(strip);
    strip.style.overflowX = "auto";
    Object.defineProperty(strip, "scrollWidth", {
      value: 1000,
      configurable: true,
    });
    Object.defineProperty(strip, "clientWidth", {
      value: 100,
      configurable: true,
    });
    expect(findScroller(tab, {})).toBeNull(); // y: not a scroller
    expect(
      findScroller(tab, {
        axis: "x",
      }),
    ).toBe(strip);
    expect(
      findScroller(tab, {
        axis: "x",
        requireOverflow: true,
      }),
    ).toBe(strip);
    rectX(strip, 0, 100);
    rectX(tab, 90, 130); // clipped on the right by 30
    strip.scrollLeft = 0;
    expect(reveal(tab, { axis: "x", margin: 8 })).toBe(true);
    expect(strip.scrollLeft).toBe(38); // 30 + 8 of clearance
    rectX(tab, -20, 20); // clipped on the left
    strip.scrollLeft = 50;
    reveal(tab, { axis: "x", margin: 8 });
    expect(strip.scrollLeft).toBe(22); // 50 - 28
  });
  it("`behavior` rides scrollTo when the box has one", () => {
    const strip = document.createElement("div");
    const tab = document.createElement("button");
    strip.append(tab);
    document.body.append(strip);
    rectX(strip, 0, 100);
    rectX(tab, 150, 200);
    const calls: ScrollToOptions[] = [];
    Object.defineProperty(strip, "scrollTo", {
      value: (o: ScrollToOptions) => calls.push(o),
      configurable: true,
    });
    strip.scrollLeft = 0;
    reveal(tab, { axis: "x", scroller: strip, behavior: "smooth" });
    expect(calls).toEqual([{ left: 100, behavior: "smooth" }]);
  });
});

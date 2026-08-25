// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";
import { nearestScroller, reveal, scrollParent } from "./index.js";

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
    expect(scrollParent(leaf)).toBeNull();

    scrollBox(inner, false);
    scrollBox(outer, true);
    expect(scrollParent(leaf)).toBe(inner);
    expect(nearestScroller(leaf)).toBe(outer); // inner has no slack
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

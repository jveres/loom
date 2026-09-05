// @vitest-environment happy-dom
import { offsetIn } from "loom/layout";
// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";

const rect = (
  el: Element,
  left: number,
  top: number,
  w = 100,
  h = 50,
): void => {
  Object.defineProperty(el, "getBoundingClientRect", {
    value: () => ({
      left,
      top,
      right: left + w,
      bottom: top + h,
      width: w,
      height: h,
    }),
    configurable: true,
  });
};
describe("offsetIn", () => {
  it("answers the rect difference corrected for the box's border and scroll", () => {
    const box = document.createElement("div");
    const el = document.createElement("p");
    box.append(el);
    document.body.append(box);
    rect(box, 100, 200, 400, 300);
    rect(el, 130, 250, 80, 40);
    Object.defineProperty(box, "clientLeft", { value: 2, configurable: true });
    Object.defineProperty(box, "clientTop", { value: 3, configurable: true });
    box.scrollLeft = 0;
    box.scrollTop = 0;
    expect(offsetIn(el, box)).toEqual({
      left: 28,
      top: 47,
      width: 80,
      height: 40,
    });
    // A scrolled box: the numbers stay valid as style.left/top of an
    // absolute child (which scrolls with the content).
    box.scrollTop = 60;
    expect(offsetIn(el, box).top).toBe(107);
  });
});

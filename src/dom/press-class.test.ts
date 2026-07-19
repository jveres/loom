// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { pressClass, remove } from "./index.js";

const pointer = (type: string, pointerId: number, button = 0): PointerEvent =>
  new PointerEvent(type, { pointerId, button, bubbles: true });

describe("pressClass", () => {
  it("adds the contact class until the matching pointer ends", () => {
    const el = document.createElement("button");
    document.body.append(el);
    pressClass(el);

    el.dispatchEvent(pointer("pointerdown", 7));
    expect(el.className).toBe("is-pressed");

    window.dispatchEvent(pointer("pointerup", 9));
    expect(el.className).toBe("is-pressed");

    window.dispatchEvent(pointer("pointerup", 7));
    expect(el.className).toBe("");
    remove(el);
  });

  it("ignores secondary buttons and dies with its owner", () => {
    const el = document.createElement("button");
    document.body.append(el);
    pressClass(el, "contact");

    el.dispatchEvent(pointer("pointerdown", 2, 1));
    expect(el.className).toBe("");

    remove(el);
    document.body.append(el);
    el.dispatchEvent(pointer("pointerdown", 2));
    expect(el.className).toBe("");
    el.remove();
  });
});

// @vitest-environment happy-dom
import { effect } from "loom";
import { pointerKind } from "loom/browser";
import { afterEach, describe, expect, it } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
});

function pointer(el: Element, type: string, pointerType: string): void {
  el.dispatchEvent(
    new PointerEvent(type, { bubbles: true, isPrimary: true, pointerType }),
  );
}

describe("pointerKind", () => {
  it("is the pointerType of the last pointerover or pointerdown, '' before any", () => {
    const el = document.createElement("div");
    document.body.append(el);
    const seen: string[] = [];
    const stop = effect(() => {
      seen.push(pointerKind(document)());
    });
    expect(seen).toEqual([""]);
    pointer(el, "pointerover", "mouse");
    expect(seen).toEqual(["", "mouse"]);
    pointer(el, "pointerover", "pen");
    expect(seen).toEqual(["", "mouse", "pen"]);
    pointer(el, "pointerdown", "touch");
    expect(seen).toEqual(["", "mouse", "pen", "touch"]);
    stop();
  });
  it("keeps the last kind when an event names an unknown pointerType", () => {
    const el = document.createElement("div");
    document.body.append(el);
    const seen: string[] = [];
    const stop = effect(() => {
      seen.push(pointerKind(document)());
    });
    pointer(el, "pointerdown", "pen");
    pointer(el, "pointerover", "");
    pointer(el, "pointerdown", "eraser");
    expect(seen.at(-1)).toBe("pen");
    stop();
  });
  it("is pooled per document and idle while unobserved", () => {
    const frame = document.implementation.createHTMLDocument("idle");
    const el = frame.createElement("div");
    frame.body.append(el);
    expect(pointerKind(frame)).toBe(pointerKind(frame));
    expect(pointerKind(document)).toBe(pointerKind());
    // Unobserved: no listener, the read stays at its initial value.
    pointer(el, "pointerdown", "mouse");
    expect(pointerKind(frame)()).toBe("");
  });
});

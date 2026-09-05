// @vitest-environment happy-dom
import { effect } from "loom";
import { focusWithin, hovered } from "loom/browser";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";

const microtask = (): Promise<void> => Promise.resolve();
afterEach(() => {
  document.body.replaceChildren();
});
describe("hovered", () => {
  it("is true from pointerenter to pointerleave for HOVERING pointers, never for touch", () => {
    const el = document.createElement("div");
    document.body.append(el);
    const seen: boolean[] = [];
    const stop = effect(() => {
      seen.push(hovered(el)());
    });
    expect(seen).toEqual([false]);
    el.dispatchEvent(
      new PointerEvent("pointerenter", {
        isPrimary: true,
        pointerType: "mouse",
      }),
    );
    expect(seen).toEqual([false, true]);
    el.dispatchEvent(
      new PointerEvent("pointerleave", {
        isPrimary: true,
        pointerType: "mouse",
      }),
    );
    expect(seen).toEqual([false, true, false]);
    // A finger's contact is not a hover.
    el.dispatchEvent(
      new PointerEvent("pointerenter", {
        isPrimary: true,
        pointerType: "touch",
      }),
    );
    expect(seen).toEqual([false, true, false]);
    // A stylus hovers.
    el.dispatchEvent(
      new PointerEvent("pointerenter", { isPrimary: true, pointerType: "pen" }),
    );
    expect(seen).toEqual([false, true, false, true]);
    el.dispatchEvent(
      new PointerEvent("pointercancel", {
        isPrimary: true,
        pointerType: "pen",
      }),
    );
    expect(seen).toEqual([false, true, false, true, false]);
    stop();
  });
  it("is pooled per element and idle while unobserved", () => {
    const el = document.createElement("div");
    document.body.append(el);
    expect(hovered(el)).toBe(hovered(el));
    // Unobserved: no listener, the read stays at its initial value.
    el.dispatchEvent(
      new PointerEvent("pointerenter", {
        isPrimary: true,
        pointerType: "mouse",
      }),
    );
    expect(hovered(el)()).toBe(false);
  });
});
describe("focusWithin", () => {
  it("mirrors :focus-within — true while focus lives inside, an inside move stays true", async () => {
    const host = document.createElement("div");
    const a = document.createElement("input");
    const b = document.createElement("input");
    const outside = document.createElement("input");
    host.append(a, b);
    document.body.append(host, outside);
    const seen: boolean[] = [];
    const stop = effect(() => {
      seen.push(focusWithin(host)());
    });
    expect(seen).toEqual([false]);
    a.focus();
    await microtask();
    expect(seen).toEqual([false, true]);
    b.focus(); // out-then-in: settles true without a false flash
    await microtask();
    expect(seen).toEqual([false, true]);
    outside.focus();
    await microtask();
    expect(seen).toEqual([false, true, false]);
    stop();
  });
});
describe("focusWithin (synthetic events)", () => {
  it("a focusin IS the verdict; a focusout naming an outside target settles false at once", () => {
    const host = document.createElement("div");
    const input = document.createElement("input");
    host.append(input);
    document.body.append(host);
    const read = focusWithin(host);
    const stop = effect(() => {
      read();
    });
    input.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(read()).toBe(true);
    input.dispatchEvent(
      new FocusEvent("focusout", {
        bubbles: true,
        relatedTarget: document.body,
      }),
    );
    expect(read()).toBe(false);
    stop();
  });
});

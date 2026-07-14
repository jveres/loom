// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { effect, state } from "../loom.js";
import { classed, pressed, remove } from "./index.js";

const pointer = (type: string, pointerId: number, button = 0): PointerEvent =>
  new PointerEvent(type, { pointerId, button, bubbles: true });

describe("pressed", () => {
  it("tracks a primary press from contact to release", () => {
    const el = document.createElement("button");
    document.body.append(el);
    const seen: boolean[] = [];
    const stop = effect(() => {
      seen.push(pressed(el)());
    });

    el.dispatchEvent(pointer("pointerdown", 7));
    window.dispatchEvent(pointer("pointerup", 7));
    expect(seen).toEqual([false, true, false]);

    stop();
    el.remove();
  });

  it("ends on pointercancel and on leaving the element", () => {
    for (const finish of ["pointercancel", "pointerleave"] as const) {
      const el = document.createElement("button");
      document.body.append(el);
      const read = pressed(el);
      const stop = effect(() => {
        read();
      });

      el.dispatchEvent(pointer("pointerdown", 3));
      expect(read()).toBe(true);
      const target = finish === "pointerleave" ? el : window;
      target.dispatchEvent(pointer(finish, 3));
      expect(read()).toBe(false);

      stop();
      el.remove();
    }
  });

  it("ignores secondary buttons, foreign pointers, and second fingers", () => {
    const el = document.createElement("button");
    document.body.append(el);
    const read = pressed(el);
    const stop = effect(() => {
      read();
    });

    el.dispatchEvent(pointer("pointerdown", 1, 2)); // right button
    expect(read()).toBe(false);

    el.dispatchEvent(pointer("pointerdown", 5));
    window.dispatchEvent(pointer("pointerup", 9)); // a different pointer
    expect(read()).toBe(true);
    el.dispatchEvent(pointer("pointerdown", 6)); // second finger mid-press
    window.dispatchEvent(pointer("pointerup", 6));
    expect(read()).toBe(true); // still held by pointer 5
    window.dispatchEvent(pointer("pointerup", 5));
    expect(read()).toBe(false);

    stop();
    el.remove();
  });

  it("shares one signal per element and disconnects when unobserved", () => {
    const el = document.createElement("button");
    document.body.append(el);
    expect(pressed(el)).toBe(pressed(el));

    const read = pressed(el);
    const stop = effect(() => {
      read();
    });
    el.dispatchEvent(pointer("pointerdown", 4));
    expect(read()).toBe(true);
    window.dispatchEvent(pointer("pointerup", 4));
    stop(); // last subscriber gone -> producer disconnected

    el.dispatchEvent(pointer("pointerdown", 4));
    expect(read()).toBe(false); // nothing listens; the press is not seen
    el.remove();
  });

  it("dies with a bound element — the class stops tracking after remove()", () => {
    const el = document.createElement("button");
    document.body.append(el);
    classed(el, "is-pressed", pressed(el));

    el.dispatchEvent(pointer("pointerdown", 2));
    expect(el.classList.contains("is-pressed")).toBe(true);
    window.dispatchEvent(pointer("pointerup", 2));
    expect(el.classList.contains("is-pressed")).toBe(false);

    remove(el); // disposes the binding -> unsubscribes -> disconnects
    document.body.append(el);
    el.dispatchEvent(pointer("pointerdown", 2));
    expect(el.classList.contains("is-pressed")).toBe(false);
  });

  it("keeps effects composable — a press can gate other reads", () => {
    const el = document.createElement("button");
    document.body.append(el);
    const label = state("idle");
    const voice: string[] = [];
    const stop = effect(() => {
      voice.push(pressed(el)() ? `pressing ${label()}` : "idle");
    });
    el.dispatchEvent(pointer("pointerdown", 11));
    label("save");
    window.dispatchEvent(pointer("pointerup", 11));
    expect(voice).toEqual(["idle", "pressing idle", "pressing save", "idle"]);
    stop();
    el.remove();
  });
});

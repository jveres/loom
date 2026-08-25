// hovered(el) / focusWithin(el) — pooled boolean signals for the two
// element states CSS pseudo-classes cannot hand to a program: whether a
// HOVERING pointer is over the element, and whether focus lives inside it.
//
// hovered() is the hover twin of pressed(): true from pointerenter to
// pointerleave (or pointercancel) for pointers that HOVER — mouse and
// pen. Touch never sets it: a finger tap wearing a hover costume reads as
// a flash, and contact is touch's voice (pressed()). Where CSS :hover is
// gated to `@media (hover: hover)`, this signal is the class-driven twin
// that also serves the pointers that gate cannot see (a stylus, or a
// trackpad on a touch-primary device): `classed(el, "is-hover",
// hovered(el))`.
//
// focusWithin() mirrors :focus-within: true while el or any descendant
// holds focus, read from focusin/focusout (both bubble; a focus MOVE
// inside el fires out-then-in and settles true).
//
// Both are source()-backed and pooled per element: listeners exist only
// while a signal is observed, and N readers share one listener set.
import { type Read, source } from "../loom.js";

const hovers = new WeakMap<Element, Read<boolean>>();
const focuses = new WeakMap<Element, Read<boolean>>();

export function hovered(el: Element): Read<boolean> {
  const found = hovers.get(el);
  if (found) return found;
  const signal = source<boolean>((set) => {
    const enter = (event: Event): void => {
      if ((event as PointerEvent).pointerType === "touch") return;
      set(true);
    };
    const leave = (): void => set(false);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    el.addEventListener("pointercancel", leave);
    return () => {
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointercancel", leave);
      set(false);
    };
  }, false);
  hovers.set(el, signal);
  return signal;
}

export function focusWithin(el: Element): Read<boolean> {
  const found = focuses.get(el);
  if (found) return found;
  const signal = source<boolean>((set) => {
    const sync = (): void => {
      const active = el.ownerDocument.activeElement;
      set(active !== null && el.contains(active));
    };
    // focusout fires BEFORE the next element takes focus — read the
    // settled state on a microtask so an inside move stays true.
    const out = (): void => {
      queueMicrotask(sync);
    };
    el.addEventListener("focusin", sync);
    el.addEventListener("focusout", out);
    sync();
    return () => {
      el.removeEventListener("focusin", sync);
      el.removeEventListener("focusout", out);
      set(false);
    };
  }, false);
  focuses.set(el, signal);
  return signal;
}

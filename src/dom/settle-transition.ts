// settleTransition(el, property, onSettle) — wait for a css
// transition on ONE property to finish, robustly. transitionend is
// the happy path; the hard-won cases it alone cannot cover:
// - a transition that CANNOT RUN never fires (transition: none under
//   prefers-reduced-motion, a display:none ancestor mid-flight) —
//   with no computable duration the settle lands on a microtask;
// - a transition that stalls (throttled tab, missed event) — the
//   fallback timer settles from the computed duration+delay;
// - an INTERRUPTED transition fires transitioncancel, not end;
// - either way onSettle runs EXACTLY once.
// Returns a Stop that abandons the wait (no settle). The wait also
// abandons with the node (onUnmount) — never settle on a dead node.
import type { Stop } from "../loom.js";
import { onUnmount } from "./ownership-base.js";

const totalMs = (raw: string, index: number): number => {
  // transition-duration/delay are comma lists aligned with
  // transition-property; pick the matching entry, falling back to
  // the first (the common single-transition case).
  const parts = raw.split(",");
  const part = (parts[index] ?? parts[0] ?? "0s").trim();
  const value = Number.parseFloat(part);
  if (Number.isNaN(value)) return 0;
  return part.endsWith("ms") ? value : value * 1000;
};

export function settleTransition(
  el: HTMLElement,
  property: string,
  onSettle: () => void,
): Stop {
  const style = getComputedStyle(el);
  const names = style.transitionProperty.split(",").map((s) => s.trim());
  let index = names.indexOf(property);
  if (index === -1) index = names.indexOf("all");
  const wait =
    index === -1
      ? 0
      : totalMs(style.transitionDuration, index) +
        totalMs(style.transitionDelay, index);

  // ONE latch for every exit: settle, manual stop, node death — and
  // the subtlety that forced it: onUnmount's returned handle INVOKES
  // the registered stop when called, so an unguarded cleanup chain
  // would re-enter through it.
  let done = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopUnmount: Stop = () => {};
  const cleanup = (): void => {
    if (done) return;
    done = true;
    if (timer !== undefined) clearTimeout(timer);
    el.removeEventListener("transitionend", onEvent);
    el.removeEventListener("transitioncancel", onEvent);
    stopUnmount();
  };
  const settle = (): void => {
    if (done) return; // abandoned (or already settled)
    cleanup();
    onSettle();
  };
  const onEvent = (event: TransitionEvent): void => {
    if (event.target !== el || event.propertyName !== property) return;
    settle();
  };

  stopUnmount = onUnmount(el, cleanup);
  if (wait === 0) {
    // Nothing will transition — settle on a microtask (never
    // synchronously: callers finish their own writes first).
    queueMicrotask(settle);
    return cleanup;
  }
  el.addEventListener("transitionend", onEvent);
  el.addEventListener("transitioncancel", onEvent);
  // The margin absorbs event-loop jitter; the events win the race in
  // every healthy case.
  timer = setTimeout(settle, wait + 50);
  return cleanup;
}

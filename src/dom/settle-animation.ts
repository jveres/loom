// settleAnimation(el, onSettle, name?) — settleTransition's twin for
// CSS ANIMATIONS: wait for an animation on `el` (optionally the one
// named `name`) to finish, robustly. animationend is the happy path;
// the cases it alone cannot cover are built in:
// - an animation that CANNOT RUN never fires (animation: none under
//   prefers-reduced-motion, a display:none ancestor) — with nothing
//   animating the settle lands on a microtask;
// - a stalled one (throttled tab, missed event) settles from the
//   computed duration+delay fallback timer;
// - an INTERRUPTED one fires animationcancel, not end;
// - onSettle runs EXACTLY once.
// Returns a Stop that abandons the wait (no settle); the wait also
// abandons with the node — never settle on a dead node.
import type { Stop } from "../loom.js";
import { onUnmount } from "./ownership-base.js";

const totalMs = (raw: string, index: number): number => {
  const parts = raw.split(",");
  const part = (parts[index] ?? parts[0] ?? "0s").trim();
  const value = Number.parseFloat(part);
  if (Number.isNaN(value)) return 0;
  return part.endsWith("ms") ? value : value * 1000;
};

export function settleAnimation(
  el: HTMLElement,
  onSettle: () => void,
  name?: string,
): Stop {
  const style = getComputedStyle(el);
  const names = style.animationName.split(",").map((s) => s.trim());
  // The named animation's slot, else the first; `none` means nothing
  // will animate.
  let index = name === undefined ? 0 : names.indexOf(name);
  if (index === -1) index = 0;
  // Engines spell "nothing" as `none`; an unset computed value reads "".
  const running =
    names[index] !== undefined &&
    names[index] !== "none" &&
    names[index] !== "";
  const iterations = style.animationIterationCount.split(",")[index]?.trim();
  const wait =
    !running || iterations === "infinite"
      ? 0
      : totalMs(style.animationDuration, index) +
        totalMs(style.animationDelay, index);

  let done = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let stopUnmount: Stop = () => {};
  const cleanup = (): void => {
    if (done) return;
    done = true;
    if (timer !== undefined) clearTimeout(timer);
    el.removeEventListener("animationend", onEvent);
    el.removeEventListener("animationcancel", onEvent);
    stopUnmount();
  };
  const settle = (): void => {
    if (done) return;
    cleanup();
    onSettle();
  };
  const onEvent = (event: AnimationEvent): void => {
    if (event.target !== el) return;
    if (name !== undefined && event.animationName !== name) return;
    settle();
  };

  stopUnmount = onUnmount(el, cleanup);
  if (!running) {
    // Nothing will animate — settle on a microtask (never
    // synchronously: callers finish their own writes first).
    queueMicrotask(settle);
    return cleanup;
  }
  el.addEventListener("animationend", onEvent);
  el.addEventListener("animationcancel", onEvent);
  // An infinite animation settles only through its events (or a stop).
  if (wait > 0) timer = setTimeout(settle, wait + 50);
  return cleanup;
}

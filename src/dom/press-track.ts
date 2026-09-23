import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";

/** Track one primary-button press at a time on `el`: `onChange(true)` at pointerdown, then
 *  `onChange(false)` when that pointer is released, cancelled, or leaves `el`. A second pointer
 *  landing mid-press neither restarts nor steals the sequence. Window listeners exist only during
 *  a press. `when` is read untracked at contact; returning false ignores the press. The returned
 *  stop removes every listener without reporting a final `false`. Shared by pressed() and
 *  pressClass(). */
export function trackPress(
  el: Element,
  onChange: (pressed: boolean) => void,
  when?: () => boolean,
): Stop {
  let active = -1;
  let press: AbortController | undefined;
  const release = (): void => {
    active = -1;
    press?.abort();
    press = undefined;
  };
  const end = (event: Event): void => {
    if ((event as PointerEvent).pointerId !== active) return;
    release();
    onChange(false);
  };
  const down = (event: Event): void => {
    const pointer = event as PointerEvent;
    if (pointer.button !== 0 || active !== -1) return;
    if (when && !untrack(when)) return;
    active = pointer.pointerId;
    press = new AbortController();
    const options = { signal: press.signal };
    const view = el.ownerDocument.defaultView ?? globalThis;
    view.addEventListener("pointerup", end, options);
    view.addEventListener("pointercancel", end, options);
    el.addEventListener("pointerleave", end, options);
    onChange(true);
  };
  el.addEventListener("pointerdown", down);
  return () => {
    el.removeEventListener("pointerdown", down);
    release();
  };
}

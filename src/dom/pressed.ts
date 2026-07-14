// pressed(el) — a reactive press signal: true from a primary-button
// pointerdown on the element until that pointer is released, cancelled, or
// leaves the element. The DETERMINISTIC twin of CSS :active for touch:
// WebKit paints :active during a touch only when its tap heuristics
// ("content observation") decide to — varying with scroll ancestry, prior
// sticky hover, and nearby listeners — so a press voice riding :active
// alone tends to appear at RELEASE on iOS. Pointer events fire at contact,
// always. Style with both selectors (`:active, .is-pressed`): the mouse
// keeps its native semantics, touch gains the guaranteed signal.
//
//   classed(el, "is-pressed", pressed(el));
//
// Deliberately NO pointer capture — a press that slides off and releases
// elsewhere must stay a cancel, exactly like a native button (capture
// would retarget the release into a click). Touch pointers are implicitly
// captured by the platform, so a touch that slides off keeps the press lit
// until release — matching what :active would do there. Global listeners
// exist only DURING a press, the pointerdown listener only while the
// signal is observed (source() connects on first subscriber, disconnects
// on last) — unused, this module costs nothing.
import { type Read, source } from "../loom.js";

// Signal cache: one pooled signal per element, so N readers share one
// listener set. WeakMap — a forgotten element drops its signal with it.
const signals = new WeakMap<Element, Read<boolean>>();

export function pressed(el: Element): Read<boolean> {
  const found = signals.get(el);
  if (found) return found;
  const signal = source<boolean>((set) => {
    let active = -1;
    let press: AbortController | null = null;
    const end = (event: Event): void => {
      if ((event as PointerEvent).pointerId !== active) return;
      active = -1;
      press?.abort();
      press = null;
      set(false);
    };
    const down = (event: Event): void => {
      const pointer = event as PointerEvent;
      // Primary button only, one press at a time — a second finger landing
      // mid-press neither restarts nor steals the sequence.
      if (pointer.button !== 0 || active !== -1) return;
      active = pointer.pointerId;
      press = new AbortController();
      const options = { signal: press.signal };
      const view = el.ownerDocument.defaultView ?? globalThis;
      view.addEventListener("pointerup", end, options);
      view.addEventListener("pointercancel", end, options);
      el.addEventListener("pointerleave", end, options);
      set(true);
    };
    el.addEventListener("pointerdown", down);
    return () => {
      el.removeEventListener("pointerdown", down);
      press?.abort();
      press = null;
      active = -1;
    };
  }, false);
  signals.set(el, signal);
  return signal;
}

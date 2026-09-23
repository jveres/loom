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
//   bindClass(el, "is-pressed", pressed(el));
//
// Deliberately NO pointer capture — a press that slides off and releases
// elsewhere must stay a cancel, exactly like a native button (capture
// would retarget the release into a click). Touch pointers are implicitly
// captured by the platform, so a touch that slides off keeps the press lit
// until release — matching what :active would do there. Global listeners
// exist only DURING a press, the pointerdown listener only while the
// signal is observed (source() connects on first subscriber, disconnects
// on last) — unused, this module costs nothing.
import { type Read, sharedSource } from "../loom.js";
import { trackPress } from "./press-track.js";

// Signal cache: one pooled signal per element, so N readers share one
// listener set. WeakMap — a forgotten element drops its signal with it.
const signals = new WeakMap<Element, Read<boolean>>();

export function pressed(el: Element): Read<boolean> {
  const found = signals.get(el);
  if (found) return found;
  const signal = sharedSource<boolean>((set) => {
    const stop = trackPress(el, set);
    return () => {
      stop();
      // A press cut short by losing the last subscriber must not stay lit on reconnect.
      set(false);
    };
  }, false);
  signals.set(el, signal);
  return signal;
}

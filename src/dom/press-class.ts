import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";

export interface PressClassOptions {
  readonly signal?: AbortSignal;
  readonly name?: string;
  /** A gate read at contact: return false and the press is ignored
   *  (Chrome 119+ dispatches pointer events to disabled controls —
   *  `() => !el.disabled` keeps the voice honest without a signal). */
  readonly when?: () => boolean;
}

export function pressClass(el: Element, options: PressClassOptions = {}): Stop {
  const life = nodeLifetime(el, options.signal);
  if (!life.active) return life.stop;
  const name = options.name ?? "is-pressed";
  let active = -1;
  let route: AbortController | undefined;

  const end = (event: Event): void => {
    if ((event as PointerEvent).pointerId !== active) return;
    active = -1;
    route?.abort();
    route = undefined;
    el.classList.remove(name);
  };

  const down = (event: Event): void => {
    const pointer = event as PointerEvent;
    if (pointer.button !== 0 || active !== -1) return;
    if (options.when && !untrack(options.when)) return;
    active = pointer.pointerId;
    route = new AbortController();
    const listenerOptions = { signal: route.signal };
    const view = el.ownerDocument.defaultView ?? globalThis;
    view.addEventListener("pointerup", end, listenerOptions);
    view.addEventListener("pointercancel", end, listenerOptions);
    el.addEventListener("pointerleave", end, listenerOptions);
    el.classList.add(name);
  };

  el.addEventListener("pointerdown", down);
  life.add(() => {
    el.removeEventListener("pointerdown", down);
    route?.abort();
    route = undefined;
    active = -1;
    el.classList.remove(name);
  });
  return life.stop;
}

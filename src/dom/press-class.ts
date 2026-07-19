// A direct contact voice for the dominant press use case: one element gains a
// class while its primary pointer is held. Unlike pressed()+classed(), this
// action creates no signal, source node, dependency links, or DOM effect.
import { own } from "./ownership-base.js";

export function pressClass(el: Element, name = "is-pressed"): void {
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
    active = pointer.pointerId;
    route = new AbortController();
    const options = { signal: route.signal };
    const view = el.ownerDocument.defaultView ?? globalThis;
    view.addEventListener("pointerup", end, options);
    view.addEventListener("pointercancel", end, options);
    el.addEventListener("pointerleave", end, options);
    el.classList.add(name);
  };

  el.addEventListener("pointerdown", down);
  own(el, () => {
    el.removeEventListener("pointerdown", down);
    route?.abort();
    route = undefined;
    active = -1;
    el.classList.remove(name);
  });
}

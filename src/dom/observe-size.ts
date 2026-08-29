// observeSize(el, cb, options?) — sized observation with the same lifetime treatment events get: the
// callback runs on the element's ResizeObserver clock (including the spec's initial delivery on
// attach, so consumers get their first measurement without a manual call) and is torn down with
// the node — `remove()`/`dispose()`/a keyed row leaving detach it automatically, the forgotten
// `ro.disconnect()` class of leak gone by construction. Returns a Stop for early manual detach.
//
// ONE ResizeObserver serves every observeSize in a REALM, derived from the element's own window
// (proposed from seam's detached-popup preview, Aug 29: a module-global observer constructed in
// the importing realm forced cross-realm delivery for popup/iframe elements — the same hazard
// frameCoalesced's `window` option exists for, solved here without an option because the element
// carries its realm). With nothing observed a realm's observer is disconnected and its seat
// dropped, so a closed popup's window is released with its last observed element.
import type { Stop } from "../loom.js";
import { once } from "./once.js";
import { onUnmount } from "./ownership-base.js";

export type SizeCallback = (entry: ResizeObserverEntry) => void;

interface RealmSeat {
  observer: ResizeObserver;
  /** Observed elements in this realm — zero disconnects the observer
   *  and drops the seat. */
  elements: number;
}

interface Watch {
  callbacks: Set<SizeCallback>;
  seat: RealmSeat;
  realm: object;
}

const watched = new Map<Element, Watch>();
const realms = new Map<object, RealmSeat>();

function deliver(entries: ResizeObserverEntry[]): void {
  for (const entry of entries) {
    const watch = watched.get(entry.target);
    if (!watch) continue;
    for (const cb of watch.callbacks) cb(entry);
  }
}

function seatFor(realm: object): RealmSeat {
  let seat = realms.get(realm);
  if (!seat) {
    const RO =
      (realm as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver ??
      ResizeObserver;
    seat = { observer: new RO(deliver), elements: 0 };
    realms.set(realm, seat);
  }
  return seat;
}

export function observeSize(
  el: Element,
  cb: SizeCallback,
  options?: ResizeObserverOptions,
): Stop {
  let watch = watched.get(el);
  if (!watch) {
    const realm: object = el.ownerDocument?.defaultView ?? globalThis;
    const seat = seatFor(realm);
    seat.elements += 1;
    watch = { callbacks: new Set(), seat, realm };
    watched.set(el, watch);
    seat.observer.observe(el, options);
  } else if (options) {
    // A realm's observer holds ONE observation per element, so an
    // explicit box wins over whatever the element was observed with:
    // re-observing replaces the options (and re-fires the spec's
    // initial delivery — size reads are idempotent). Padding-only
    // changes are invisible on the default content-box; a consumer
    // measuring border boxes must observe { box: "border-box" }.
    watch.seat.observer.unobserve(el);
    watch.seat.observer.observe(el, options);
  }
  const { callbacks, seat, realm } = watch;
  callbacks.add(cb);
  const stop = once(() => {
    const current = watched.get(el);
    if (!current) return;
    current.callbacks.delete(cb);
    if (current.callbacks.size === 0) {
      watched.delete(el);
      seat.observer.unobserve(el);
      seat.elements -= 1;
      if (seat.elements === 0) {
        seat.observer.disconnect();
        realms.delete(realm);
      }
    }
  });
  return onUnmount(el, stop);
}

// hoverClass(host, options?) — the delegated, class-writing hover twin of
// pressClass(): elements under `host` wear a class while a HOVERING
// pointer is over them, resolved per pointerover by `target` (the row
// under the pointer, the ancestor chain, …). Where hovered() hands a
// program one element's state as a signal, this action dresses the DOM
// directly and creates no signal, source node, or effect.
//
// Touch never dresses anything (contact is touch's voice — pressClass);
// a touch sighting CLEARS a stale costume instead. Clearing rides the
// host's own pointerleave, never per-element pointerout: a pen tap
// fires out-to-null BEFORE the browser synthesizes the click, and
// clearing there hides hover-revealed controls mid-tap. `when` gates
// EVERY sighting the channel would act on — a pointer to leave to CSS
// (a mouse where the media gate matches), a touch clear a host refuses
// while an engagement holds. `set` lets a host drive the costume itself (a
// forwarding strip); `current` reads what wears it.
import { own } from "./ownership-base.js";

export interface HoverClassOptions {
  /** The class. Default "is-hover". */
  readonly name?: string;
  /** Which element(s) wear the costume for this pointerover — null
   *  clears. Default: the event target itself. */
  readonly target?: (
    event: PointerEvent,
  ) => Element | readonly Element[] | null;
  /** A gate: return false and the pointer is left to CSS. */
  readonly when?: (event: PointerEvent) => boolean;
  /** Capture-phase listeners — a document-level channel. */
  readonly capture?: boolean;
}

export interface HoverClass {
  /** Dress `next` (and undress the rest); null undresses everything. */
  set(next: Element | readonly Element[] | null): void;
  /** The elements wearing the costume now. */
  current(): readonly Element[];
}

export function hoverClass(
  host: Element,
  options: HoverClassOptions = {},
): HoverClass {
  const name = options.name ?? "is-hover";
  const capture = options.capture === true;
  let dressed: readonly Element[] = [];
  const set = (next: Element | readonly Element[] | null): void => {
    const list: readonly Element[] =
      next === null ? [] : Array.isArray(next) ? next : [next as Element];
    for (const el of dressed) {
      if (!list.includes(el)) el.classList.remove(name);
    }
    for (const el of list) el.classList.add(name);
    dressed = list;
  };
  const over = (event: Event): void => {
    const pointer = event as PointerEvent;
    // The gate answers for EVERY sighting, a touch's included — a
    // host may refuse a touch's clear (a sticky engagement).
    if (options.when && !options.when(pointer)) return;
    if (pointer.pointerType === "touch") {
      if (dressed.length > 0) set(null);
      return;
    }
    set(
      options.target
        ? options.target(pointer)
        : (pointer.target as Element | null),
    );
  };
  const leave = (event: Event): void => {
    if (event.target !== host) return;
    const pointer = event as PointerEvent;
    if (options.when && !options.when(pointer)) return;
    set(null);
  };
  host.addEventListener("pointerover", over, capture);
  host.addEventListener("pointerleave", leave, capture);
  own(host, () => {
    host.removeEventListener("pointerover", over, capture);
    host.removeEventListener("pointerleave", leave, capture);
    set(null);
  });
  return { set, current: () => dressed };
}

import { untrack } from "../core/tracking.js";

import { nodeLifetime } from "./lifetime.js";

export interface HoverClassOptions {
  readonly signal?: AbortSignal;
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
  readonly stop: () => void;
  /** Dress `next` (and undress the rest); null undresses everything. */
  set(next: Element | readonly Element[] | null): void;
  /** The elements wearing the costume now. */
  current(): readonly Element[];
}

export function hoverClass(
  host: Element,
  options: HoverClassOptions = {},
): HoverClass {
  const life = nodeLifetime(host, options.signal);
  const name = options.name ?? "is-hover";
  const capture = options.capture === true;
  let dressed: readonly Element[] = [];
  const set = (next: Element | readonly Element[] | null): void => {
    if (!life.active) return;
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
    if (options.when && untrack(() => options.when?.(pointer)) === false)
      return;
    if (pointer.pointerType === "touch") {
      if (dressed.length > 0) set(null);
      return;
    }
    set(
      options.target
        ? untrack(() => options.target?.(pointer) ?? null)
        : (pointer.target as Element | null),
    );
  };
  const leave = (event: Event): void => {
    if (event.target !== host) return;
    const pointer = event as PointerEvent;
    if (options.when && untrack(() => options.when?.(pointer)) === false)
      return;
    set(null);
  };
  if (life.active) {
    host.addEventListener("pointerover", over, capture);
    host.addEventListener("pointerleave", leave, capture);
    life.add(() => {
      host.removeEventListener("pointerover", over, capture);
      host.removeEventListener("pointerleave", leave, capture);
      for (const el of dressed) el.classList.remove(name);
      dressed = [];
    });
  }
  return { set, current: () => dressed, stop: life.stop };
}

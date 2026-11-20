import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";

export interface TapOptions {
  readonly signal?: AbortSignal;
  /** Maximum pointer travel in CSS pixels. Default 10. */
  readonly slop?: number;
  /** Recent-tap interval in milliseconds. Default 600. */
  readonly recentMs?: number;
}
export interface TapController {
  readonly stop: Stop;
  readonly recent: () => boolean;
}
export interface DoubleTapOptions extends TapOptions {
  /** Maximum interval between taps in milliseconds. Default 350. */
  readonly withinMs?: number;
}
export interface PressOptions {
  readonly signal?: AbortSignal;
  /** Maximum pointer travel in CSS pixels. Default 10. */
  readonly slop?: number;
  /** Window in milliseconds to suppress the tap's follow-up click. Default 600. */
  readonly suppressMs?: number;
}

function docNow(doc: Document): number {
  return (doc.defaultView?.performance ?? performance).now();
}

function now(node: Element): number {
  return docNow(node.ownerDocument);
}

function bindTap(
  node: Element,
  life: ReturnType<typeof nodeLifetime>,
  slop: number,
  handler: (event: PointerEvent) => void,
  reset: () => void,
): void {
  let id: number | undefined;
  let x = 0;
  let y = 0;
  const cancel = (): void => {
    id = undefined;
    reset();
  };
  const down = (event: Event): void => {
    if (!life.active) return;
    const pointer = event as PointerEvent;
    if (
      pointer.button !== 0 ||
      pointer.isPrimary === false ||
      id !== undefined
    ) {
      cancel();
      return;
    }
    id = pointer.pointerId;
    x = pointer.clientX;
    y = pointer.clientY;
  };
  const up = (event: Event): void => {
    if (!life.active) return;
    const pointer = event as PointerEvent;
    if (pointer.pointerId !== id) return;
    id = undefined;
    if ((pointer.clientX - x) ** 2 + (pointer.clientY - y) ** 2 > slop ** 2) {
      reset();
      return;
    }
    handler(pointer);
  };
  if (life.active) {
    node.addEventListener("pointerdown", down);
    node.addEventListener("pointerup", up);
    node.addEventListener("pointercancel", cancel);
    node.addEventListener("pointerleave", cancel);
    life.add(() => {
      node.removeEventListener("pointerdown", down);
      node.removeEventListener("pointerup", up);
      node.removeEventListener("pointercancel", cancel);
      node.removeEventListener("pointerleave", cancel);
      cancel();
    });
  }
}

function taps(
  node: Element,
  handler: (event: PointerEvent) => void,
  reset: () => void,
  options: TapOptions,
): TapController {
  const slop = options.slop ?? 10;
  const recentMs = options.recentMs ?? 600;
  if (
    !Number.isFinite(slop) ||
    slop < 0 ||
    !Number.isFinite(recentMs) ||
    recentMs < 0
  )
    throw new RangeError(
      "Tap distances and durations must be finite and non-negative.",
    );
  const life = nodeLifetime(node, options.signal);
  let last = Number.NEGATIVE_INFINITY;
  bindTap(
    node,
    life,
    slop,
    (pointer) => {
      last = now(node);
      untrack(() => handler(pointer));
    },
    reset,
  );
  return {
    stop: life.stop,
    recent: () => life.active && now(node) - last < recentMs,
  };
}

interface PendingClick {
  readonly x: number;
  readonly y: number;
  readonly slop: number;
  readonly until: number;
  readonly focused: Element | null;
}

interface ClickSuppressor {
  pending: PendingClick | undefined;
  readonly onClick: (event: Event) => void;
}

const suppressors = new WeakMap<Document, ClickSuppressor>();

function isEditable(element: Element | null): element is HTMLElement {
  if (element === null || typeof (element as HTMLElement).blur !== "function")
    return false;
  if ((element as HTMLElement).isContentEditable) return true;
  const attr = element.getAttribute("contenteditable");
  return attr !== null && attr.toLowerCase() !== "false";
}

/** Suppresses the single delayed synthetic click that touch browsers (notably
 *  iOS Safari) dispatch after a handled pointer tap, and blurs any newly
 *  focused editable host underneath if the tapped control unmounted. */
function armClickSuppressor(doc: Document, next: PendingClick): void {
  const existing = suppressors.get(doc);
  if (existing !== undefined) {
    existing.pending = next;
    return;
  }
  const clear = (): void => {
    doc.removeEventListener("click", entry.onClick, true);
    suppressors.delete(doc);
  };
  const entry: ClickSuppressor = {
    pending: next,
    onClick: (event) => {
      const pending = entry.pending;
      if (pending === undefined) {
        clear();
        return;
      }
      if (docNow(doc) > pending.until) {
        entry.pending = undefined;
        clear();
        return;
      }
      const mouse = event as MouseEvent;
      if (
        mouse.detail <= 0 ||
        (mouse.clientX - pending.x) ** 2 + (mouse.clientY - pending.y) ** 2 >
          pending.slop ** 2
      )
        return;
      const prior = pending.focused;
      entry.pending = undefined;
      clear();
      event.preventDefault();
      event.stopImmediatePropagation();
      const active = doc.activeElement;
      if (active !== prior && isEditable(active)) {
        doc.defaultView?.getSelection?.()?.removeAllRanges();
        active.blur();
      }
    },
  };
  suppressors.set(doc, entry);
  doc.addEventListener("click", entry.onClick, true);
}

/** Runs `handler` on a pointer tap (`pointerup` within `slop`) or a native
 *  `click` (keyboard activation, programmatic `.click()`, or an unconsumed
 *  pointer click). When `handler` handles a pointer tap (returns anything
 *  other than `false`), its follow-up synthetic `click` is suppressed so
 *  overlays or controls that unmount on tap do not click or focus whatever
 *  sits underneath. */
export function onPress(
  node: Element,
  handler: (event: PointerEvent | MouseEvent) => unknown,
  options: PressOptions = {},
): Stop {
  const slop = options.slop ?? 10;
  const suppressMs = options.suppressMs ?? 600;
  if (
    !Number.isFinite(slop) ||
    slop < 0 ||
    !Number.isFinite(suppressMs) ||
    suppressMs < 0
  )
    throw new RangeError(
      "Press distances and durations must be finite and non-negative.",
    );
  const life = nodeLifetime(node, options.signal);
  if (!life.active) return life.stop;
  const doc = node.ownerDocument;
  bindTap(
    node,
    life,
    slop,
    (pointer) => {
      if (untrack(() => handler(pointer)) !== false)
        armClickSuppressor(doc, {
          x: pointer.clientX,
          y: pointer.clientY,
          slop,
          until: docNow(doc) + suppressMs,
          focused: doc.activeElement,
        });
    },
    () => {},
  );
  const click = (event: Event): void => {
    if (!life.active) return;
    untrack(() => handler(event as MouseEvent));
  };
  node.addEventListener("click", click);
  life.add(() => {
    node.removeEventListener("click", click);
  });
  return life.stop;
}

export function onTap(
  node: Element,
  handler: (event: PointerEvent) => void,
  options: TapOptions = {},
): TapController {
  return taps(node, handler, () => {}, options);
}
export function onDoubleTap(
  node: Element,
  handler: (event: PointerEvent) => void,
  options: DoubleTapOptions = {},
): Stop {
  const withinMs = options.withinMs ?? 350;
  if (!Number.isFinite(withinMs) || withinMs < 0)
    throw new RangeError(
      "Double tap interval must be finite and non-negative.",
    );
  let last = Number.NEGATIVE_INFINITY;
  return taps(
    node,
    (event) => {
      const time = now(node);
      if (time - last < withinMs) {
        last = Number.NEGATIVE_INFINITY;
        handler(event);
      } else last = time;
    },
    () => {
      last = Number.NEGATIVE_INFINITY;
    },
    options,
  ).stop;
}

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
  const now = (): number =>
    (node.ownerDocument.defaultView?.performance ?? performance).now();
  let id: number | undefined;
  let x = 0;
  let y = 0;
  let last = Number.NEGATIVE_INFINITY;
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
    last = now();
    untrack(() => handler(pointer));
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
  return {
    stop: life.stop,
    recent: () => life.active && now() - last < recentMs,
  };
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
      const now = (
        node.ownerDocument.defaultView?.performance ?? performance
      ).now();
      if (now - last < withinMs) {
        last = Number.NEGATIVE_INFINITY;
        handler(event);
      } else last = now;
    },
    () => {
      last = Number.NEGATIVE_INFINITY;
    },
    options,
  ).stop;
}

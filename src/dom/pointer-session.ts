import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import { onUnmount } from "./ownership-base.js";

export type PointerSessionEndReason =
  | "pointerup"
  | "pointercancel"
  | "lostpointercapture"
  | "stopped";

export interface PointerSessionOptions {
  readonly signal?: AbortSignal;
  /** Receives matching pointer moves while the session is active. */
  readonly move: (event: PointerEvent) => void;
  /** Runs once, after listeners and capture have been released. */
  readonly end?: (
    reason: PointerSessionEndReason,
    event?: PointerEvent,
  ) => void;
}

/**
 * Start one pointer-ID-filtered gesture on `handle`. Capture is best-effort; pointer up, cancel,
 * lost capture, manual stop, or Loom-managed unmount finishes the session exactly once.
 */
export function startPointerSession(
  handle: Element,
  start: PointerEvent,
  options: PointerSessionOptions,
): Stop {
  if (options.signal?.aborted) return () => {};
  const pointerId = start.pointerId;
  let active = true;
  let captured = false;
  let route: EventTarget = handle;
  let unregisterOwner: Stop = () => {};

  const onMove: EventListener = (rawEvent) => {
    const event = rawEvent as PointerEvent;
    if (active && event.pointerId === pointerId)
      untrack(() => options.move(event));
  };
  const onEnd: EventListener = (rawEvent) => {
    const event = rawEvent as PointerEvent;
    if (event.pointerId === pointerId)
      finish(event.type as PointerSessionEndReason, event);
  };

  const attach = (): void => {
    route.addEventListener("pointermove", onMove);
    route.addEventListener("pointerup", onEnd);
    route.addEventListener("pointercancel", onEnd);
    route.addEventListener("lostpointercapture", onEnd);
  };
  const detach = (): void => {
    route.removeEventListener("pointermove", onMove);
    route.removeEventListener("pointerup", onEnd);
    route.removeEventListener("pointercancel", onEnd);
    route.removeEventListener("lostpointercapture", onEnd);
  };

  function finish(reason: PointerSessionEndReason, event?: PointerEvent): void {
    if (!active) return;
    active = false;
    detach();
    unregisterOwner();
    if (captured) {
      try {
        handle.releasePointerCapture?.(pointerId);
      } catch {
        // The browser may already have released capture before dispatching its terminal event.
      }
    }
    options.signal?.removeEventListener("abort", stop);
    untrack(() => options.end?.(reason, event));
  }

  const stop = (): void => finish("stopped");
  options.signal?.addEventListener("abort", stop, { once: true });
  attach();
  unregisterOwner = onUnmount(handle, () => finish("stopped"));
  try {
    if (typeof handle.setPointerCapture === "function") {
      handle.setPointerCapture(pointerId);
      captured = true;
    }
  } catch {
    // Synthetic events and disconnected handles can reject capture.
  }
  if (!captured) {
    // Without capture, route on the document so leaving the handle cannot strand the session.
    detach();
    route = handle.ownerDocument;
    attach();
  }

  return stop;
}

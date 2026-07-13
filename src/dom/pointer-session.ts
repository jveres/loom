import type { Stop } from "../loom.js";
import { onUnmount } from "./ownership-base.js";

export type PointerSessionEndReason =
  | "pointerup"
  | "pointercancel"
  | "lostpointercapture"
  | "stopped";

export interface PointerSessionOptions {
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
  const pointerId = start.pointerId;
  let active = true;
  let captured = false;
  let route: EventTarget = handle;
  let unregisterOwner: Stop = () => {};

  const onMove: EventListener = (rawEvent) => {
    const event = rawEvent as PointerEvent;
    if (event.pointerId === pointerId) options.move(event);
  };
  const onUp: EventListener = (rawEvent) => {
    const event = rawEvent as PointerEvent;
    if (event.pointerId === pointerId) finish("pointerup", event);
  };
  const onCancel: EventListener = (rawEvent) => {
    const event = rawEvent as PointerEvent;
    if (event.pointerId === pointerId) finish("pointercancel", event);
  };
  const onLostCapture: EventListener = (rawEvent) => {
    const event = rawEvent as PointerEvent;
    if (event.pointerId === pointerId) finish("lostpointercapture", event);
  };

  const attach = (): void => {
    route.addEventListener("pointermove", onMove);
    route.addEventListener("pointerup", onUp);
    route.addEventListener("pointercancel", onCancel);
    route.addEventListener("lostpointercapture", onLostCapture);
  };
  const detach = (): void => {
    route.removeEventListener("pointermove", onMove);
    route.removeEventListener("pointerup", onUp);
    route.removeEventListener("pointercancel", onCancel);
    route.removeEventListener("lostpointercapture", onLostCapture);
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
    options.end?.(reason, event);
  }

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

  return () => finish("stopped");
}

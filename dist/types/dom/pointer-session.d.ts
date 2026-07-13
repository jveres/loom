import type { Stop } from "../loom.js";
export type PointerSessionEndReason = "pointerup" | "pointercancel" | "lostpointercapture" | "stopped";
export interface PointerSessionOptions {
    /** Receives matching pointer moves while the session is active. */
    readonly move: (event: PointerEvent) => void;
    /** Runs once, after listeners and capture have been released. */
    readonly end?: (reason: PointerSessionEndReason, event?: PointerEvent) => void;
}
/**
 * Start one pointer-ID-filtered gesture on `handle`. Capture is best-effort; pointer up, cancel,
 * lost capture, manual stop, or Loom-managed unmount finishes the session exactly once.
 */
export declare function startPointerSession(handle: Element, start: PointerEvent, options: PointerSessionOptions): Stop;

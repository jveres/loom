import { pauseEffectStop, resumeEffectStop } from "../loom.js";
import { forEachOwnedStop } from "./ownership-base.js";

export { dispose, onUnmount, remove } from "./ownership-base.js";

/** Suspend every effect-backed binding owned by a subtree. Pause operations nest. */
export function pause(root: Node): void {
  forEachOwnedStop(root, pauseEffectStop);
}

/** Resume every effect-backed binding owned by a subtree. */
export function resume(root: Node): void {
  forEachOwnedStop(root, resumeEffectStop);
}

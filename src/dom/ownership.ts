import {
  type EffectNode,
  pauseEffectNode,
  resumeEffectNode,
  stopEffectNode,
} from "../loom.js";
import {
  installOwnedResourceDriver,
  pauseOwnedResources,
  resumeOwnedResources,
} from "./ownership-base.js";

installOwnedResourceDriver({
  stop: (resource) => stopEffectNode(resource as EffectNode),
  pause: (resource) => {
    pauseEffectNode(resource as EffectNode);
  },
  resume: (resource) => {
    resumeEffectNode(resource as EffectNode);
  },
  requiresOrderedStop: (resource) =>
    (resource as EffectNode).cleanup !== undefined,
});

export {
  dispose,
  onUnmount,
  type ResourceGroup,
  remove,
  resourceGroup,
} from "./ownership-base.js";

/** Suspend every effect-backed binding owned by a subtree. Pause operations nest. */
export function pause(root: Node): void {
  pauseOwnedResources(root);
}

/** Resume every effect-backed binding owned by a subtree. */
export function resume(root: Node): void {
  resumeOwnedResources(root);
}

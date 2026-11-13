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
  onStop: (resource, release) => {
    const node = resource as EffectNode;
    if (!node.flags) release();
    else {
      const previous = node.releaseOwnership;
      node.releaseOwnership = previous
        ? () => {
            previous();
            release();
          }
        : release;
    }
  },
  stop: stopEffectNode as (resource: object) => void,
  pause: pauseEffectNode as (resource: object) => void,
  resume: resumeEffectNode as (resource: object) => void,
  requiresOrderedStop: (resource) => Boolean((resource as EffectNode).cleanup),
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

export { dispose, onUnmount, type ResourceGroup, remove, resourceGroup, } from "./ownership-base.js";
/** Suspend every effect-backed binding owned by a subtree. Pause operations nest. */
export declare function pause(root: Node): void;
/** Resume every effect-backed binding owned by a subtree. */
export declare function resume(root: Node): void;

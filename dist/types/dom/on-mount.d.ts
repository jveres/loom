import type { Stop } from "../loom.js";
export interface OnMountOptions {
    readonly signal?: AbortSignal;
}
export declare function onMount(node: Node, fn: (node: Node) => void, options?: OnMountOptions): Stop;

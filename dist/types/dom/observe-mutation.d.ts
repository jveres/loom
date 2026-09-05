import type { Stop } from "../loom.js";
export type MutationsCallback = (records: MutationRecord[]) => void;
export interface ObserveMutationOptions extends MutationObserverInit {
    readonly signal?: AbortSignal;
}
/** @internal Connection-owned observation, independent of node disposal. */
export declare function connectMutation(el: Node, callback: MutationsCallback, options: MutationObserverInit): Stop;
export declare function observeMutation(el: Node, callback: MutationsCallback, options: ObserveMutationOptions): Stop;

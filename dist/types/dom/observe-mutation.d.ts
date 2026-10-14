import type { Stop } from "../loom.js";
export type MutationsCallback = (records: MutationRecord[]) => void;
export interface ObserveMutationOptions extends MutationObserverInit {
    readonly signal?: AbortSignal;
}
export declare function observeMutation(el: Node, callback: MutationsCallback, options: ObserveMutationOptions): Stop;

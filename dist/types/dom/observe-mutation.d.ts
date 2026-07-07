import type { Stop } from "../loom.js";
export type MutationsCallback = (records: MutationRecord[]) => void;
export declare function observeMutation(el: Node, cb: MutationsCallback, options: MutationObserverInit): Stop;

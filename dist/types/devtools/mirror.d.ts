import { type InspectNode } from "loom/observe";
interface MirrorSync {
    readonly revision: number;
    readonly setRevision: number;
    readonly nodes: ReadonlyMap<number, InspectNode>;
}
export declare function startMirror(): void;
export declare function stopMirror(): void;
export declare function mirrorSync(): MirrorSync;
export declare function labelOf(id: number): string;
export {};

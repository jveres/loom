import { type NodeInfo, type State } from "../loom.js";
export interface InspectNode extends NodeInfo {
    readonly internal: boolean;
    readonly deps: readonly number[];
    readonly subs: readonly number[];
    readonly runs: number;
    readonly disposed: boolean;
    readonly target?: object;
    readonly value?: unknown;
    readonly source?: State<unknown>;
    readonly group?: number;
    readonly key?: string;
}
export interface InspectSnapshot {
    readonly nodes: readonly InspectNode[];
}
/**
 * Snapshot the reactive graph. With `{ active: true }`, skip state/computed cells that have no
 * subscribers — these are either idle (nothing reads them) or "ghosts": cells of a removed object
 * that are unreachable from the app but still alive until GC clears their WeakRef. Effects are
 * always kept. There is no way to detect a not-yet-collected ghost directly (reachability is the
 * GC's business), so the subscriber count is the proxy: a live cell is one something still reads.
 */
export declare function inspect(options?: {
    readonly active?: boolean;
}): InspectSnapshot;
export interface ResourceCounts {
    readonly states: number;
    readonly computeds: number;
    readonly effects: number;
    readonly targetedEffects: number;
    readonly sources: number;
    readonly scopes: number;
    readonly channels: number;
    readonly unread: number;
}
export declare function inspectResources(): ResourceCounts;

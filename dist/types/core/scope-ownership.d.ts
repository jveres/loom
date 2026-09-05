import type { EffectNode, NodeOptions } from "../loom.js";
export interface ScopeResource {
    pause(): void;
    resume(): void;
    stop(): void;
}
export interface OwnedScopeResource extends ScopeResource {
    owner: ScopeNode | undefined;
    ownerIndex: number;
    stopped: boolean;
}
export interface ScopeNode {
    readonly effects: EffectNode[];
    readonly resources: OwnedScopeResource[];
    readonly children: ScopeNode[];
    readonly parent: ScopeNode | undefined;
    childIndex: number;
    readonly options: NodeOptions | undefined;
    paused: boolean;
    pausedCount: number;
    stopped: boolean;
}
export declare function bumpPausedCount(node: ScopeNode, delta: number): void;
export declare function stopScopeResource(resource: OwnedScopeResource): void;
export declare function swapRemove<T>(list: T[], i: number, reindex: (moved: T, index: number) => void): void;
export declare function walkResources(node: ScopeNode, act: (resource: OwnedScopeResource) => void): void;

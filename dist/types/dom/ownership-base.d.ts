export type OwnershipStop = () => void;
export type OwnedResource = object;
interface OwnedResourceDriver {
    readonly onStop: (resource: OwnedResource, release: OwnershipStop) => void;
    readonly stop: (resource: OwnedResource) => void;
    readonly pause: (resource: OwnedResource) => void;
    readonly resume: (resource: OwnedResource) => void;
    readonly requiresOrderedStop: (resource: OwnedResource) => boolean;
}
/** @internal Install operations for raw resources stored by the reactive DOM layer. */
export declare function installOwnedResourceDriver(driver: OwnedResourceDriver): void;
/** Register a stop that is only driven by ownership (no separately exposed manual stop). */
export declare function own(node: Node, stop: OwnershipStop): void;
/** Register a raw resource without allocating a public/manual stop handle. */
export declare function ownResource(node: Node, resource: OwnedResource): void;
/** A manually stoppable raw binding still participates in DOM pause/resume. */
export declare function ownStoppableResource(node: Node, resource: OwnedResource, signal?: AbortSignal): OwnershipStop;
/** @internal Release resources created by a failed synchronous render, including
 * nodes the renderer never returned. Nested renders share a rollback journal;
 * successful construction leaves lifetime management with the owning nodes. */
export declare function withConstructionRollback<T>(build: () => T): T;
/** @internal Remove every node before reporting disposal or insertion failures. */
export declare function removeNodes(nodes: Iterable<Node>, errors?: unknown[]): void;
export interface ResourceGroup<T> {
    readonly value: T;
    readonly dispose: OwnershipStop;
}
type SyncResult<T> = T extends PromiseLike<unknown> ? never : T;
/**
 * Capture node-owned resources and lifecycle stops created by `fn` in a flat
 * ownership arena. Node ownership remains intact for granular removal;
 * disposing the arena is the fast path for tearing down an entire view before
 * native DOM replacement. Construction is synchronous, arenas cannot nest,
 * and observable cleanup retains descendant-first DOM order.
 */
export declare function resourceGroup<T>(fn: () => SyncResult<T>): ResourceGroup<T>;
/**
 * Attach a disposer to a node's Loom-managed lifetime. The returned stop also unregisters itself,
 * allowing early manual teardown without retaining the stopped resource on a long-lived node.
 */
export declare function onUnmount(node: Node, stop: OwnershipStop): OwnershipStop;
/** @internal Suspend raw resources without exposing their concrete representation. */
export declare function pauseOwnedResources(root: Node): void;
/** @internal Resume raw resources without exposing their concrete representation. */
export declare function resumeOwnedResources(root: Node): void;
/** Dispose every owned resource in a subtree, descendants before ancestors. */
export declare function dispose(root: Node): void;
/** Dispose a subtree and detach it even when one of its disposers fails. */
export declare function remove(node: Node): void;
export {};

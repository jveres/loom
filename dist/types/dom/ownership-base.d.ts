export type OwnershipStop = () => void;
/** Register a stop that is only driven by ownership (no separately exposed manual stop). */
export declare function own(node: Node, stop: OwnershipStop): void;
/**
 * Attach a disposer to a node's Loom-managed lifetime. The returned stop also unregisters itself,
 * allowing early manual teardown without retaining the stopped resource on a long-lived node.
 */
export declare function onUnmount(node: Node, stop: OwnershipStop): OwnershipStop;
/** @internal Visit active raw stops without clearing the shared ownership registry. */
export declare function forEachOwnedStop(root: Node, fn: (stop: OwnershipStop) => void): void;
/** Dispose every owned resource in a subtree, descendants before ancestors. */
export declare function dispose(root: Node): void;
/** Dispose a subtree and detach it even when one of its disposers fails. */
export declare function remove(node: Node): void;

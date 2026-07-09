export type OwnershipStop = () => void;

interface RegisteredStop {
  active: boolean;
  owner: Node | undefined;
  stop: OwnershipStop | undefined;
  dispose: OwnershipStop;
}

type OwnedEntry = OwnershipStop | RegisteredStop;
type OwnedEffects = OwnedEntry | OwnedEntry[];

// Store ownership on the node itself. A private symbol keeps the slot invisible to normal DOM
// enumeration, preserves the same lifetime semantics as a WeakMap (the entry dies with its node),
// and avoids a WeakMap lookup for every binding. That lookup is particularly expensive in
// JavaScriptCore on large initial mounts.
const OWNED = Symbol("loom.owned");
type OwnedNode = Node & { [OWNED]?: OwnedEffects | undefined };

function runOwned(
  root: Node,
  fn: (owned: OwnedEntry) => void,
  clear: boolean,
): void {
  // Collect with one growing array, pushing siblings right-to-left. Reverse iteration then visits
  // descendants before their ancestors while retaining left-to-right sibling disposal order.
  const nodes: Node[] = [root];
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index] as Node;
    for (let child = node.lastChild; child; child = child.previousSibling) {
      nodes.push(child);
    }
  }
  let errors: unknown[] | undefined;
  for (let index = nodes.length - 1; index >= 0; index--) {
    const node = nodes[index] as Node;
    const target = node as OwnedNode;
    const owned = target[OWNED];
    if (!owned) continue;
    if (clear) target[OWNED] = undefined;

    if (Array.isArray(owned)) {
      for (const entry of owned) {
        if (typeof entry !== "function" && !entry.active) continue;
        try {
          fn(entry);
        } catch (error) {
          if (errors === undefined) errors = [error];
          else errors.push(error);
        }
      }
    } else {
      const entry = owned;
      if (typeof entry !== "function" && !entry.active) continue;
      try {
        fn(entry);
      } catch (error) {
        if (errors === undefined) errors = [error];
        else errors.push(error);
      }
    }
  }

  if (errors?.length === 1) throw errors[0];
  if (errors && errors.length > 1) {
    throw new AggregateError(errors, "Multiple Loom DOM disposers failed.");
  }
}

function addOwned(node: Node, entry: OwnedEntry): void {
  const target = node as OwnedNode;
  const owned = target[OWNED];
  if (!owned) target[OWNED] = entry;
  else if (Array.isArray(owned)) owned.push(entry);
  else target[OWNED] = [owned, entry];
}

function unregister(node: Node, entry: RegisteredStop): void {
  const target = node as OwnedNode;
  const owned = target[OWNED];
  if (!owned) return;
  if (!Array.isArray(owned)) {
    if (owned === entry) target[OWNED] = undefined;
    return;
  }
  const index = owned.indexOf(entry);
  if (index < 0) return;
  const last = owned.pop() as OwnedEntry;
  if (index < owned.length) owned[index] = last;
  if (owned.length === 1) target[OWNED] = owned[0] as OwnedEntry;
  else if (owned.length === 0) target[OWNED] = undefined;
}

/** Register a stop that is only driven by ownership (no separately exposed manual stop). */
export function own(node: Node, stop: OwnershipStop): void {
  const target = node as OwnedNode;
  const owned = target[OWNED];
  if (!owned) target[OWNED] = stop;
  else if (Array.isArray(owned)) owned.push(stop);
  else target[OWNED] = [owned, stop];
}

/**
 * Attach a disposer to a node's Loom-managed lifetime. The returned stop also unregisters itself,
 * allowing early manual teardown without retaining the stopped resource on a long-lived node.
 */
export function onUnmount(node: Node, stop: OwnershipStop): OwnershipStop {
  const entry: RegisteredStop = {
    active: true,
    owner: node,
    stop,
    dispose: () => undefined,
  };
  entry.dispose = () => {
    if (!entry.active) return;
    entry.active = false;
    const owner = entry.owner;
    const current = entry.stop;
    // A caller may retain the returned handle indefinitely. Clear its captured resource graph
    // before cleanup so a stopped handle does not keep the DOM node or callback alive.
    entry.owner = undefined;
    entry.stop = undefined;
    if (owner !== undefined) unregister(owner, entry);
    current?.();
  };
  addOwned(node, entry);
  return entry.dispose;
}

/** @internal Visit active raw stops without clearing the shared ownership registry. */
export function forEachOwnedStop(
  root: Node,
  fn: (stop: OwnershipStop) => void,
): void {
  runOwned(
    root,
    (owned) => {
      const stop = typeof owned === "function" ? owned : owned.stop;
      if (stop !== undefined) fn(stop);
    },
    false,
  );
}

/** Dispose every owned resource in a subtree, descendants before ancestors. */
export function dispose(root: Node): void {
  runOwned(
    root,
    (owned) => {
      if (typeof owned === "function") owned();
      else owned.dispose();
    },
    true,
  );
}

/** Dispose a subtree and detach it even when one of its disposers fails. */
export function remove(node: Node): void {
  let disposalFailed = false;
  let disposalError: unknown;
  try {
    dispose(node);
  } catch (error) {
    disposalFailed = true;
    disposalError = error;
  }

  let removalFailed = false;
  let removalError: unknown;
  try {
    node.parentNode?.removeChild(node);
  } catch (error) {
    removalFailed = true;
    removalError = error;
  }

  if (disposalFailed && removalFailed) {
    throw new AggregateError(
      [disposalError, removalError],
      "Loom DOM disposal and removal both failed.",
    );
  }
  if (disposalFailed) throw disposalError;
  if (removalFailed) throw removalError;
}

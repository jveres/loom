export type OwnershipStop = () => void;
export type OwnedResource = object;

interface OwnedResourceDriver {
  readonly stop: (resource: OwnedResource) => void;
  readonly pause: (resource: OwnedResource) => void;
  readonly resume: (resource: OwnedResource) => void;
  readonly requiresOrderedStop: (resource: OwnedResource) => boolean;
}

let resourceDriver: OwnedResourceDriver | undefined;
let activeResourceGroup: GroupEntry[] | undefined;

/** @internal Install operations for raw resources stored by the reactive DOM layer. */
export function installOwnedResourceDriver(driver: OwnedResourceDriver): void {
  resourceDriver = driver;
}

interface RegisteredStop {
  readonly [REGISTERED_STOP]: true;
  active: boolean;
  owner: Node | undefined;
  stop: OwnershipStop | undefined;
  dispose: OwnershipStop;
}

const REGISTERED_STOP = Symbol("loom.registered-stop");
type OwnedEntry = OwnershipStop | RegisteredStop | OwnedResource;
type OwnedEffects = OwnedEntry | OwnedEntry[];
interface GroupEntry {
  readonly owner: Node;
  readonly resource: OwnedEntry;
  readonly index: number;
}

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
        if (isRegisteredStop(entry) && !entry.active) continue;
        try {
          fn(entry);
        } catch (error) {
          if (errors === undefined) errors = [error];
          else errors.push(error);
        }
      }
    } else {
      const entry = owned;
      if (isRegisteredStop(entry) && !entry.active) continue;
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
  const group = activeResourceGroup;
  if (group !== undefined) {
    group.push({ owner: node, resource: entry, index: group.length });
  }
}

function isRegisteredStop(entry: OwnedEntry): entry is RegisteredStop {
  return typeof entry !== "function" && REGISTERED_STOP in entry;
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
  if (activeResourceGroup !== undefined) {
    void onUnmount(node, stop);
    return;
  }
  const target = node as OwnedNode;
  const owned = target[OWNED];
  if (!owned) target[OWNED] = stop;
  else if (Array.isArray(owned)) owned.push(stop);
  else target[OWNED] = [owned, stop];
}

/** Register a raw resource without allocating a public/manual stop handle. */
export function ownResource(node: Node, resource: OwnedResource): void {
  addOwned(node, resource);
}

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
export function resourceGroup<T>(fn: () => SyncResult<T>): ResourceGroup<T> {
  if (activeResourceGroup !== undefined) {
    throw new TypeError(
      "resourceGroup() cannot be nested; use one flat group per replaceable region.",
    );
  }
  if (Object.prototype.toString.call(fn) === "[object AsyncFunction]") {
    throw new TypeError("resourceGroup() callbacks must be synchronous.");
  }
  const resources: GroupEntry[] = [];
  activeResourceGroup = resources;
  let value: T;
  try {
    value = fn() as T;
    if (isPromiseLike(value)) {
      void Promise.resolve(value).catch(() => undefined);
      throw new TypeError("resourceGroup() callbacks must be synchronous.");
    }
  } catch (error) {
    activeResourceGroup = undefined;
    try {
      stopResourceGroup(resources);
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Loom resource group creation and cleanup both failed.",
      );
    }
    throw error;
  } finally {
    activeResourceGroup = undefined;
  }
  let active = true;
  return {
    value,
    dispose: () => {
      if (!active) return;
      active = false;
      stopResourceGroup(resources);
    },
  };
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    (typeof value === "object" || typeof value === "function") &&
    value !== null &&
    "then" in value &&
    typeof value.then === "function"
  );
}

function compareGroupEntries(left: GroupEntry, right: GroupEntry): number {
  if (left.owner === right.owner) return left.index - right.index;
  if (left.owner.contains(right.owner)) return 1;
  if (right.owner.contains(left.owner)) return -1;
  const position = left.owner.compareDocumentPosition(right.owner);
  if ((position & Node.DOCUMENT_POSITION_DISCONNECTED) !== 0) {
    return left.index - right.index;
  }
  return (position & Node.DOCUMENT_POSITION_FOLLOWING) !== 0 ? -1 : 1;
}

function stopResourceGroup(resources: GroupEntry[]): void {
  let errors: unknown[] | undefined;
  const driver = resourceDriver;
  const ordered: GroupEntry[] = [];
  const stop = (resource: OwnedEntry): void => {
    try {
      if (typeof resource === "function") resource();
      else if (isRegisteredStop(resource)) resource.dispose();
      else if (driver !== undefined) driver.stop(resource);
      else throw new Error("No Loom DOM resource driver is installed.");
    } catch (error) {
      if (errors === undefined) errors = [error];
      else errors.push(error);
    }
  };
  for (const entry of resources) {
    const resource = entry.resource;
    if (
      isRegisteredStop(resource) ||
      (typeof resource !== "function" &&
        driver?.requiresOrderedStop(resource) === true)
    ) {
      ordered.push(entry);
    } else {
      stop(resource);
    }
  }
  ordered.sort(compareGroupEntries);
  for (const entry of ordered) {
    stop(entry.resource);
  }
  resources.length = 0;
  if (errors?.length === 1) throw errors[0];
  if (errors && errors.length > 1) {
    throw new AggregateError(errors, "Multiple Loom DOM resources failed.");
  }
}

/**
 * Attach a disposer to a node's Loom-managed lifetime. The returned stop also unregisters itself,
 * allowing early manual teardown without retaining the stopped resource on a long-lived node.
 */
export function onUnmount(node: Node, stop: OwnershipStop): OwnershipStop {
  const entry: RegisteredStop = {
    [REGISTERED_STOP]: true,
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

function driveOwnedResources(
  root: Node,
  drive: (driver: OwnedResourceDriver, resource: OwnedResource) => void,
): void {
  runOwned(
    root,
    (owned) => {
      if (typeof owned === "function" || isRegisteredStop(owned)) return;
      if (resourceDriver === undefined) {
        throw new Error("No Loom DOM resource driver is installed.");
      }
      drive(resourceDriver, owned);
    },
    false,
  );
}

/** @internal Suspend raw resources without exposing their concrete representation. */
export function pauseOwnedResources(root: Node): void {
  driveOwnedResources(root, (driver, resource) => driver.pause(resource));
}

/** @internal Resume raw resources without exposing their concrete representation. */
export function resumeOwnedResources(root: Node): void {
  driveOwnedResources(root, (driver, resource) => driver.resume(resource));
}

/** Dispose every owned resource in a subtree, descendants before ancestors. */
export function dispose(root: Node): void {
  runOwned(
    root,
    (owned) => {
      if (typeof owned === "function") owned();
      else if (isRegisteredStop(owned)) owned.dispose();
      else if (resourceDriver !== undefined) resourceDriver.stop(owned);
      else throw new Error("No Loom DOM resource driver is installed.");
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

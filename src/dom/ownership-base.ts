import {
  ignorePromiseRejection,
  isPromiseLike,
  rollbackWith,
  type SyncResult,
  throwCollected,
} from "../core/errors.js";
import { untrack } from "../core/tracking.js";

type OwnershipStop = () => void;
type OwnedResource = object;

interface OwnedResourceDriver {
  readonly onStop: (resource: OwnedResource, release: OwnershipStop) => void;
  readonly stop: (resource: OwnedResource) => void;
  readonly pause: (resource: OwnedResource) => void;
  readonly resume: (resource: OwnedResource) => void;
  readonly requiresOrderedStop: (resource: OwnedResource) => boolean;
}

let resourceDriver: OwnedResourceDriver | undefined;
let activeResourceGroup: ResourceArena | undefined;
let activeConstruction: GroupEntry[] | undefined;

/** @internal Install operations for raw resources stored by the reactive DOM layer. */
export function installOwnedResourceDriver(driver: OwnedResourceDriver): void {
  resourceDriver = driver;
}

type TrackedResource = OwnershipStop | OwnedResource;
type OwnedEntry = TrackedResource;
type OwnedEffects = OwnedEntry | OwnedEntry[];
interface GroupEntry {
  owner: Node | undefined;
  resource: TrackedResource | undefined;
  readonly index: number;
}

interface ArenaEntry extends GroupEntry {
  slot: number;
}

interface ResourceArena {
  readonly entries: ArenaEntry[];
  nextIndex: number;
  stopping: boolean;
}

let ownedKey: symbol | undefined;
type OwnedNode = Record<symbol, OwnedEffects | undefined>;

function runOwned(
  root: Node,
  fn: (owned: OwnedEntry) => void,
  clear: boolean,
): void {
  const sym = ownedKey;
  if (sym === undefined) return;
  const onlyChild = root.lastChild;
  const nodes: Node[] | null =
    onlyChild === null ||
    (onlyChild.previousSibling === null &&
      onlyChild.lastChild === null &&
      (onlyChild as unknown as OwnedNode)[sym] === undefined)
      ? null
      : [root];
  if (nodes !== null) {
    for (let index = 0; index < nodes.length; index++) {
      for (
        let child = (nodes[index] as Node).lastChild;
        child;
        child = child.previousSibling
      ) {
        nodes.push(child);
      }
    }
  }
  let errors: unknown[] | undefined;
  const invoke = (entry: OwnedEntry): void => {
    try {
      fn(entry);
    } catch (error) {
      errors ??= [];
      errors.push(error);
    }
  };
  for (let index = nodes === null ? 0 : nodes.length - 1; index >= 0; index--) {
    const target = (nodes === null
      ? root
      : nodes[index]) as unknown as OwnedNode;
    const owned = target[sym];
    if (!owned) continue;
    if (clear) target[sym] = undefined;
    if (Array.isArray(owned)) {
      const list = clear ? owned : [...owned];
      for (let i = 0; i < list.length; i++) invoke(list[i] as OwnedEntry);
    } else {
      invoke(owned);
    }
  }

  throwCollected(errors, "Multiple Loom DOM disposers failed.");
}

function attachOwned(node: Node, entry: OwnedEntry): void {
  ownedKey ??= Symbol();
  const sym = ownedKey;
  const target = node as unknown as OwnedNode;
  const owned = target[sym];
  if (!owned) target[sym] = entry;
  else if (Array.isArray(owned)) owned.push(entry);
  else target[sym] = [owned, entry];
}

function addOwned(
  node: Node,
  entry: TrackedResource,
  skipDriverHook = false,
): OwnershipStop | undefined {
  attachOwned(node, entry);
  let release: OwnershipStop | undefined;
  const group = activeResourceGroup;
  if (group !== undefined) {
    const captured: ArenaEntry = {
      owner: node,
      resource: entry,
      index: group.nextIndex++,
      slot: group.entries.length,
    };
    group.entries.push(captured);
    release = (): void => {
      const slot = captured.slot;
      if (slot < 0) return;
      captured.slot = -1;
      captured.owner = undefined;
      captured.resource = undefined;
      if (group.stopping) return;
      const last = group.entries.pop() as ArenaEntry;
      if (last !== captured) {
        group.entries[slot] = last;
        last.slot = slot;
      }
    };
    if (!skipDriverHook && typeof entry !== "function") {
      resourceDriver?.onStop(entry, release);
    }
  }
  const construction = activeConstruction;
  if (construction !== undefined) {
    construction.push({
      owner: node,
      resource: entry,
      index: construction.length,
    });
  }
  return release;
}

function unregister(node: Node, entry: OwnedEntry): void {
  if (ownedKey === undefined) return;
  const target = node as unknown as OwnedNode;
  const owned = target[ownedKey];
  if (!owned) return;
  if (!Array.isArray(owned)) {
    if (owned === entry) target[ownedKey] = undefined;
    return;
  }
  const index = owned.indexOf(entry);
  if (index < 0) return;
  const last = owned.pop() as OwnedEntry;
  if (index < owned.length) owned[index] = last;
  if (owned.length === 1) target[ownedKey] = owned[0] as OwnedEntry;
  else if (owned.length === 0) target[ownedKey] = undefined;
}

/** Register a stop that is only driven by ownership (no separately exposed manual stop). */
export function own(node: Node, stop: OwnershipStop): void {
  if (activeResourceGroup !== undefined || activeConstruction !== undefined) {
    void onUnmount(node, stop);
    return;
  }
  attachOwned(node, stop);
}

/** Register a raw resource without allocating a public/manual stop handle. */
export function ownResource(node: Node, resource: OwnedResource): void {
  addOwned(node, resource);
}

function requireDriver(): OwnedResourceDriver {
  if (resourceDriver === undefined) {
    throw new Error("No Loom DOM resource driver is installed.");
  }
  return resourceDriver;
}

/** A manually stoppable raw binding still participates in DOM pause/resume. */
export function ownStoppableResource(
  node: Node,
  resource: OwnedResource,
  signal?: AbortSignal,
): OwnershipStop {
  const driver = requireDriver();
  let owner: Node | undefined = node;
  let held: OwnedResource | undefined = resource;
  let release = addOwned(node, resource, true);
  const stop = (): void => {
    if (held !== undefined) driver.stop(held);
  };
  driver.onStop(resource, () => {
    signal?.removeEventListener("abort", stop);
    release?.();
    if (owner !== undefined && held !== undefined) unregister(owner, held);
    owner = held = release = undefined;
  });
  if (signal?.aborted) stop();
  else if (held !== undefined)
    signal?.addEventListener("abort", stop, { once: true });
  return stop;
}

/** @internal Release resources created by a failed synchronous render, including
 * nodes the renderer never returned. Nested renders share a rollback journal;
 * successful construction leaves lifetime management with the owning nodes. */
export function withConstructionRollback<T>(build: () => T): T {
  const previous = activeConstruction;
  const resources = previous ?? [];
  const start = resources.length;
  activeConstruction = resources;
  try {
    return build();
  } catch (error) {
    activeConstruction = previous;
    return rollbackWith(
      () => stopResourceGroup(resources.splice(start)),
      error,
      "Loom DOM construction and cleanup both failed.",
    );
  } finally {
    activeConstruction = previous;
  }
}

/** @internal Remove every node before reporting disposal or insertion failures. */
export function removeNodes(
  nodes: Iterable<Node>,
  errors: unknown[] = [],
): void {
  for (const node of nodes) {
    try {
      remove(node);
    } catch (error) {
      errors.push(error);
    }
  }
  throwCollected(errors, "Multiple Loom DOM operations failed.");
}

export interface ResourceGroup<T> {
  readonly value: T;
  readonly dispose: OwnershipStop;
}

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
  const syncError = (): TypeError =>
    new TypeError("resourceGroup() callbacks must be synchronous.");
  if (Object.prototype.toString.call(fn) === "[object AsyncFunction]") {
    throw syncError();
  }
  const arena: ResourceArena = { entries: [], nextIndex: 0, stopping: false };
  const stopArena = (): void => {
    arena.stopping = true;
    stopResourceGroup(arena.entries);
  };
  activeResourceGroup = arena;
  let value: T;
  try {
    value = fn() as T;
    if (isPromiseLike(value)) {
      ignorePromiseRejection(value);
      throw syncError();
    }
  } catch (error) {
    activeResourceGroup = undefined;
    return rollbackWith(
      stopArena,
      error,
      "Loom resource group creation and cleanup both failed.",
    );
  } finally {
    activeResourceGroup = undefined;
  }
  let active = true;
  return {
    value,
    dispose: () => {
      if (!active) return;
      active = false;
      stopArena();
    },
  };
}

function compareGroupEntries(left: GroupEntry, right: GroupEntry): number {
  const leftOwner = left.owner;
  const rightOwner = right.owner;
  if (leftOwner === rightOwner || !leftOwner || !rightOwner) {
    return left.index - right.index;
  }
  const pos = leftOwner.compareDocumentPosition(rightOwner);
  return pos & 1 ? left.index - right.index : pos & 16 ? 1 : pos & 12 ? -1 : 1;
}

function stopResourceGroup(resources: GroupEntry[]): void {
  if (resources.length === 0) return;
  let errors: unknown[] | undefined;
  let ordered: GroupEntry[] | undefined;
  const stop = (resource: TrackedResource): void => {
    try {
      if (typeof resource === "function") resource();
      else requireDriver().stop(resource);
    } catch (error) {
      errors ??= [];
      errors.push(error);
    }
  };
  for (let i = 0; i < resources.length; i++) {
    const entry = resources[i] as GroupEntry;
    const resource = entry.resource;
    if (resource === undefined) continue;
    if (
      typeof resource === "function" ||
      resourceDriver?.requiresOrderedStop(resource) === true
    ) {
      ordered ??= [];
      ordered.push(entry);
    } else {
      stop(resource);
    }
  }
  if (ordered !== undefined) {
    if (ordered.length > 1) ordered.sort(compareGroupEntries);
    for (let i = 0; i < ordered.length; i++) {
      const resource = (ordered[i] as GroupEntry).resource;
      if (resource !== undefined) stop(resource);
    }
  }
  resources.length = 0;
  throwCollected(errors, "Multiple Loom DOM resources failed.");
}

/**
 * Attach a disposer to a node's Loom-managed lifetime. The returned stop also unregisters itself,
 * allowing early manual teardown without retaining the stopped resource on a long-lived node.
 */
export function onUnmount(node: Node, stop: OwnershipStop): OwnershipStop {
  let owner: Node | undefined = node;
  let current: OwnershipStop | undefined = stop;
  let release: OwnershipStop | undefined;
  const dispose = (): void => {
    const heldStop = current;
    if (!heldStop) return;
    const heldOwner = owner;
    owner = current = undefined;
    release?.();
    release = undefined;
    if (heldOwner) unregister(heldOwner, dispose);
    untrack(heldStop);
  };
  release = addOwned(node, dispose, true);
  return dispose;
}

function driveOwnedResources(
  root: Node,
  drive: (driver: OwnedResourceDriver, resource: OwnedResource) => void,
): void {
  runOwned(
    root,
    (owned) => {
      if (typeof owned !== "function") drive(requireDriver(), owned);
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

function disposeSingleEntry(owned: OwnedEntry): void {
  if (typeof owned === "function") untrack(owned as OwnershipStop);
  else requireDriver().stop(owned);
}

/** Dispose every owned resource in a subtree, descendants before ancestors. */
export function dispose(root: Node): void {
  runOwned(root, disposeSingleEntry, true);
}

/** Dispose a subtree and detach it even when one of its disposers fails. */
export function remove(node: Node): void {
  let errors: unknown[] | undefined;
  try {
    dispose(node);
  } catch (error) {
    errors = [error];
  }
  try {
    node.parentNode?.removeChild(node);
  } catch (error) {
    errors ??= [];
    errors.push(error);
  }
  throwCollected(errors, "Loom DOM disposal and removal both failed.");
}

import type { EffectNode, NodeOptions } from "../loom.js";

// A non-effect resource owned by a scope (a poll timer, a lazy source's connection): suspended
// and resumed with the scope's effects, and torn down when it stops.
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

// An ownership group for effects, resources, and nested scopes. Effects/resources created while a
// scope is active register here; the scope can stop them, or pause/resume them collectively. An
// effect runs (and a resource stays live) only while no scope in its parent chain is paused.
export interface ScopeNode {
  readonly effects: EffectNode[];
  readonly resources: OwnedScopeResource[];
  readonly children: ScopeNode[];
  readonly parent: ScopeNode | undefined;
  // This scope's slot in parent.children — so stopping a child swap-removes in O(1) instead of an
  // indexOf scan + splice (O(siblings) per stop, quadratic across a churned sibling set).
  childIndex: number;
  // Default node options (internal/label) applied to everything created in the scope,
  // already merged with any ancestor scope's defaults.
  readonly options: NodeOptions | undefined;
  paused: boolean;
  // Number of paused scopes in this node's ancestor chain (including itself), maintained on
  // pause/resume so readers never walk to the root.
  pausedCount: number;
  stopped: boolean;
}

// Add `delta` to the paused-ancestor count of `node` and its whole subtree (every descendant gains
// or loses this scope as a paused ancestor). Walks all children, including independently-paused ones.
export function bumpPausedCount(node: ScopeNode, delta: number): void {
  node.pausedCount += delta;
  for (const effectNode of node.effects) {
    effectNode.pausedCount = (effectNode.pausedCount ?? 0) + delta;
  }
  for (const child of node.children) bumpPausedCount(child, delta);
}

export function stopScopeResource(resource: OwnedScopeResource): void {
  if (resource.stopped) return;
  resource.stopped = true;
  const owner = resource.owner;
  if (owner !== undefined && !owner.stopped) {
    swapRemove(owner.resources, resource.ownerIndex, (moved, index) => {
      moved.ownerIndex = index;
    });
  }
  resource.owner = undefined;
  resource.ownerIndex = -1;
  resource.stop();
}

// O(1) list removal: move the last element into slot `i` (telling it its new index via `reindex`)
// and pop. Used by the scope-detach paths so a churned scope/effect set never pays an indexOf scan.
export function swapRemove<T>(
  list: T[],
  i: number,
  reindex: (moved: T, index: number) => void,
): void {
  const last = list.length - 1;
  if (i < 0 || i > last) return;
  const moved = list[last] as T;
  list[i] = moved;
  reindex(moved, i);
  list.pop();
}

// Snapshot every resource before invoking user hooks: a hook may stop itself, a sibling resource,
// or a child scope, all of which swap-remove live ownership arrays. Complete every still-live hook
// in the snapshot before surfacing the first failure.
export function walkResources(
  node: ScopeNode,
  act: (resource: OwnedScopeResource) => void,
): void {
  const resources: OwnedScopeResource[] = [];
  collectResources(node, resources);
  let caught: [unknown] | undefined;
  for (const resource of resources) {
    if (resource.stopped) continue;
    try {
      act(resource);
    } catch (error) {
      caught ??= [error];
    }
  }
  if (caught !== undefined) throw caught[0];
}

// Independently-paused child subtrees are already in the matching resource state.
function collectResources(
  node: ScopeNode,
  resources: OwnedScopeResource[],
): void {
  for (const resource of node.resources) resources.push(resource);
  for (const child of node.children) {
    if (!child.paused) collectResources(child, resources);
  }
}

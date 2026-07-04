// The inspection subsystem (the loom/observe surface): per-node metadata registration, the live
// node registry, and the graph snapshot/census reads. Installed into the core via
// installInspectHooks() when THIS module is imported — apps that never import loom/observe (or the
// devtools that pull it in) bundle none of it, and node creation stays metadata-free.

import {
  ambientOptions,
  type ComputedNode,
  type EffectOptions,
  type InspectMeta,
  installInspectHooks,
  liveScopeCount,
  mergeOptions,
  type NodeBase,
  type NodeInfo,
  type NodeKind,
  type NodeOptions,
  type State,
  type StateNode,
} from "../loom.js";
import { channelRegistry } from "./channels.js";
import type { Link } from "./graph.js";

type Writable<T> = { -readonly [K in keyof T]: T[K] };

// The full graph-node record produced by inspect() / inspectResources() (the loom/observe surface).
export interface InspectNode extends NodeInfo {
  readonly internal: boolean;
  readonly deps: readonly number[];
  readonly subs: readonly number[];
  readonly runs: number;
  readonly disposed: boolean;
  readonly target?: object;
  readonly value?: unknown;
  // The live setter for a state cell, for tooling that writes back (the inspector). Deliberately
  // erased to State<unknown>: the concrete T is unrecoverable at snapshot time, so a write here is
  // unchecked by construction — callers own that unsoundness.
  readonly source?: State<unknown>;
  // Cells from one fields() call share a `group` id; `key` is the property name within it.
  readonly group?: number;
  readonly key?: string;
}

export interface InspectSnapshot {
  readonly nodes: readonly InspectNode[];
}

let inspectId = 0;
let fieldsGroup = 0; // shared id stamped on the cells of each fields() call (for inspector grouping)
// Inspection is opt-in: off by default so node creation allocates no metadata (zero cost). Turn it
// on with configure({ inspect: true }) BEFORE creating the nodes you want visible to inspect()/the
// inspector — nodes created while it's off carry no metadata and never appear. NOTE: enabling also
// requires this module to be loaded (import anything from loom/observe); configure() alone can't
// reach machinery that was never bundled.
let inspectEnabled = false;
const inspectRefs = new Map<number, WeakRef<NodeBase>>();
// Reclaims a churned node's registry entry as soon as GC collects it — inspect()'s lazy pruning
// only runs on pulls, so inspection left on without an inspector polling would otherwise
// accumulate dead WeakRefs indefinitely. Inspection-mode only (registered in registerNode).
const inspectReaper: FinalizationRegistry<number> | undefined =
  typeof FinalizationRegistry === "undefined"
    ? undefined
    : new FinalizationRegistry((id) => {
        inspectRefs.delete(id);
      });

function registerNode(
  node: NodeBase,
  kind: NodeKind,
  options: NodeOptions | EffectOptions | undefined,
): InspectMeta | undefined {
  // Opt-in: when inspection is off, skip all metadata work — this is the per-node allocation
  // (InspectMeta + WeakRef + Map insert) that dominates create-heavy workloads.
  if (!inspectEnabled) return undefined;
  // Apply the active scope's ambient defaults (internal/label) under any explicit ones.
  const opts = mergeOptions(ambientOptions(), options);
  const id = ++inspectId;
  const meta: InspectMeta = {
    id,
    disposed: false,
    internal: opts?.internal === true,
    kind,
    label: opts?.label ?? `${kind} #${id}`,
    runs: 0,
    target:
      opts && "target" in opts && opts.target
        ? new WeakRef(opts.target)
        : undefined,
  };
  node.meta = meta;
  inspectRefs.set(id, new WeakRef(node));
  inspectReaper?.register(node, id);
  return meta;
}

// Wire this subsystem into the core. Runs at module load — importing loom/observe is what turns
// the core's inspect hook sites from no-ops into registrations.
installInspectHooks({
  register: registerNode,
  unregister(id) {
    inspectRefs.delete(id);
  },
  setEnabled(on) {
    inspectEnabled = on;
  },
  nextGroup() {
    return inspectEnabled ? ++fieldsGroup : 0;
  },
  trackedWrite,
});

// Dev diagnostic: a tracked run wrote a cell — if the writer also SUBSCRIBES to that cell, it
// re-triggers itself (the `v(v() + 1)` phantom-write). Warn once per writer/cell pair, naming
// both, with the fix. Internal (inspector-owned) nodes are exempt; intentional self-stabilizing
// loops exist, hence a warning rather than a throw.
const warnedSelfDeps = new Set<string>();
function trackedWrite(node: NodeBase, writer: NodeBase): void {
  if (!inspectEnabled) return;
  const cellMeta = node.meta;
  const writerMeta = writer.meta;
  if (!cellMeta || !writerMeta || cellMeta.internal || writerMeta.internal)
    return;
  for (let link = node.subs; link !== undefined; link = link.nextSub) {
    if (link.sub === writer) {
      const key = `${cellMeta.id}:${writerMeta.id}`;
      if (warnedSelfDeps.has(key)) return;
      warnedSelfDeps.add(key);
      console.warn(
        `[loom] "${writerMeta.label}" writes "${cellMeta.label}" which it also reads — it will re-trigger itself. If unintended, read it untracked: update(cell, fn) or untrack(() => cell()).`,
      );
      return;
    }
  }
}

/**
 * Snapshot the reactive graph. With `{ active: true }`, skip state/computed cells that have no
 * subscribers — these are either idle (nothing reads them) or "ghosts": cells of a removed object
 * that are unreachable from the app but still alive until GC clears their WeakRef. Effects are
 * always kept. There is no way to detect a not-yet-collected ghost directly (reachability is the
 * GC's business), so the subscriber count is the proxy: a live cell is one something still reads.
 */
export function inspect(options?: {
  readonly active?: boolean;
}): InspectSnapshot {
  const activeOnly = options?.active === true;
  const nodes: InspectNode[] = [];
  for (const [id, ref] of inspectRefs) {
    const node = ref.deref();
    if (!node) {
      inspectRefs.delete(id);
      continue;
    }
    const meta = node.meta;
    if (!meta) continue;
    if (activeOnly && meta.kind !== "effect" && node.subs === undefined) {
      continue;
    }
    nodes.push(inspectNode(node, meta));
  }
  return { nodes };
}

// A live census of the reactive resources, for tooling. Computed by one pull-time walk of the
// node registry (no per-node allocation, unlike inspect()), plus O(1) reads of the scope counter
// and channel registry — nothing here runs on the reactive hot path.
export interface ResourceCounts {
  readonly states: number;
  readonly computeds: number;
  // All live effects; `targetedEffects` is the subset that declared an EffectOptions.target —
  // attribution to an external object. Surfaces tag their rendering bindings with it (loom/dom
  // sets the bound DOM node), so tooling can read targeted effects as "views"; core doesn't
  // assume that meaning.
  readonly effects: number;
  readonly targetedEffects: number;
  readonly sources: number;
  readonly scopes: number;
  readonly channels: number;
  // states/computeds nothing currently reads (no subscribers): idle, or leaked/ghost cells of a
  // removed object not yet GC'd. A rising count under steady state hints at a leak.
  readonly unread: number;
}

export function inspectResources(): ResourceCounts {
  let states = 0;
  let computeds = 0;
  let effects = 0;
  let targetedEffects = 0;
  let sources = 0;
  let unread = 0;
  for (const [id, ref] of inspectRefs) {
    const node = ref.deref();
    if (node === undefined) {
      inspectRefs.delete(id);
      continue;
    }
    const meta = node.meta;
    if (!meta || meta.internal) continue;
    if (meta.kind === "computed") {
      computeds++;
      if (node.subs === undefined) unread++;
    } else if (meta.kind === "effect") {
      effects++;
      if (meta.target !== undefined) targetedEffects++;
    } else if ("connect" in node) {
      sources++; // a state-kind node backed by an external producer
    } else {
      states++;
      if (node.subs === undefined) unread++;
    }
  }
  return {
    states,
    computeds,
    effects,
    targetedEffects,
    sources,
    scopes: liveScopeCount(),
    channels: channelRegistry.size,
    unread,
  };
}

function inspectNode(node: NodeBase, meta: InspectMeta): InspectNode {
  const out: Writable<InspectNode> = {
    id: meta.id,
    deps: linkedIds(node.deps, "nextDep", "dep"),
    disposed: meta.disposed,
    internal: meta.internal,
    kind: meta.kind,
    label: meta.label,
    runs: meta.runs,
    subs: linkedIds(node.subs, "nextSub", "sub"),
  };
  const source =
    meta.kind === "state" ? (node as StateNode<unknown>).source : undefined;
  if (source !== undefined) out.source = source;
  const target = meta.target?.deref();
  if (target !== undefined) out.target = target;
  const value = nodeValue(node, meta);
  if (value !== undefined) out.value = value;
  if (meta.group !== undefined) out.group = meta.group;
  if (meta.key !== undefined) out.key = meta.key;
  return out;
}

// Walk one side of a node's link list (deps via nextDep/dep, subs via nextSub/sub) collecting the
// neighbors' inspect ids. Tooling-only path — never on the reactive hot path.
function linkedIds(
  head: Link | undefined,
  next: "nextDep" | "nextSub",
  peer: "dep" | "sub",
): number[] {
  const ids: number[] = [];
  for (let item = head; item !== undefined; item = item[next]) {
    const meta = (item[peer] as NodeBase).meta;
    if (meta) ids.push(meta.id);
  }
  return ids;
}

// The snapshot's value read, discriminated by the registered kind (watchers are never registered,
// so state/computed are the only value-bearing kinds here).
function nodeValue(node: NodeBase, meta: InspectMeta): unknown {
  switch (meta.kind) {
    case "state":
      return (node as StateNode<unknown>).pendingValue;
    case "computed":
      return (node as ComputedNode<unknown>).value;
    default:
      return undefined;
  }
}

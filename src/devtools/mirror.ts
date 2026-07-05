// The devtools' one node-set mirror: id → InspectNode for the live graph, rebuilt lazily and only
// when the reactive world actually moved — a count meter over create/dispose/write/compute makes
// "did anything change?" a four-integer compare. This is the single staleness authority that
// replaces three ad-hoc heuristics (the Graph tab's rebuild-on-timer, the Trace tab's miss-gated
// label cache, and hover-highlight's TTL snapshot): at idle every consumer pull costs one meter
// read; under activity one inspect() walk is shared by all of them.
//
// Two revisions: `revision` bumps on ANY rebuild (values/edges fresh), `setRevision` only when
// nodes were created/disposed — the Graph tab regroups on the latter and merely re-reads values on
// the former. Labels are merged into a persistent map so rows referencing disposed nodes keep
// their names.
import { type Meter, meter } from "loom";
import { events, type InspectNode, inspect } from "loom/observe";

interface MirrorSync {
  readonly revision: number;
  readonly setRevision: number;
  readonly nodes: ReadonlyMap<number, InspectNode>;
}

// Walk floor: even in full chaos (every pull sees moved counts), consumer pulls — the trace pulls
// per drain, hovers per row — can't turn into a walk storm; dirtiness accumulates across throttled
// pulls and the next eligible pull rebuilds. Consumers therefore read values at most this stale,
// the same contract the Graph tab's old rebuild-on-timer gave.
const MIRROR_MIN_MS = 300;

let churn: Meter | null = null;
let nodes = new Map<number, InspectNode>();
const labels = new Map<number, string>();
let revision = 0;
let setRevision = 0;
let stale = true; // force the first sync after start
let pendingMoved = false;
let pendingSet = false;
let lastWalkAt = 0;

export function startMirror(): void {
  churn = meter([events.create, events.dispose, events.write, events.compute]);
  stale = true;
}

export function stopMirror(): void {
  churn?.stop();
  churn = null;
  nodes = new Map();
  labels.clear();
  revision = 0;
  setRevision = 0;
  stale = true;
  pendingMoved = false;
  pendingSet = false;
  lastWalkAt = 0;
}

// Pull-based: consumers call this at their own cadence (heartbeat, drain, hover); the rebuild runs
// at most once per world-change regardless of how many consumers pull.
export function mirrorSync(): MirrorSync {
  const frame = churn?.read();
  if (frame) {
    const created = frame["loom:create"]?.count ?? 0;
    const disposed = frame["loom:dispose"]?.count ?? 0;
    // The meter read consumed these counts — fold them into the pending flags so a throttled pull
    // can't lose a change.
    pendingSet ||= created !== 0 || disposed !== 0;
    pendingMoved ||=
      pendingSet ||
      (frame["loom:write"]?.count ?? 0) !== 0 ||
      (frame["loom:compute"]?.count ?? 0) !== 0;
    const now = performance.now();
    if (
      (stale || pendingMoved) &&
      (stale || now - lastWalkAt >= MIRROR_MIN_MS)
    ) {
      const first = stale;
      stale = false;
      lastWalkAt = now;
      // Full (unfiltered) snapshot: labels want every node incl. ghosts; the Graph tab applies its
      // own active-only filter when regrouping.
      nodes = new Map(inspect().nodes.map((n) => [n.id, n]));
      for (const n of nodes.values()) labels.set(n.id, n.label);
      revision++;
      if (first || pendingSet) setRevision++;
      pendingMoved = false;
      pendingSet = false;
    }
  }
  return { revision, setRevision, nodes };
}

// id → label; disposed nodes keep their last-known name, never-seen ids fall back to `#id`.
export function labelOf(id: number): string {
  mirrorSync();
  return labels.get(id) ?? `#${id}`;
}

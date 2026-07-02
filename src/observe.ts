// Observability addon (the `loom/observe` entrypoint): watch loom's own internals. `events` is the
// registry of the runtime's built-in event streams (loom:read/write/compute/effect/flush/create/
// dispose) — meter them to get pipeline rates; `inspect`/`inspectResources` snapshot the
// graph. These are an *application* of the generic channel/meter primitives that live in the core
// (`loom`), kept out of the default surface so the core stays lean.

export type {
  InspectNode,
  InspectSnapshot,
  ResourceCounts,
} from "./core/inspect.js";
export { inspect, inspectResources } from "./core/inspect.js";
export type {
  FlushSample,
  ReadSample,
  WriteSample,
} from "./core/meter.js";
export { events, sampleOf } from "./core/meter.js";
export type { NodeKind } from "./loom.js";

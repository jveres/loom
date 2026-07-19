// Observability addon (the `loom/observe` entrypoint): watch loom's own internals. `events` is the
// registry of the runtime's built-in event streams (loom:read/write/compute/effect/flush/create/
// dispose) — meter them to get pipeline rates; `inspect`/`inspectResources` snapshot the
// graph. These are an *application* of the generic channel/meter primitives, kept out of the
// default `loom` entrypoint so the core stays lean.

export type {
  InspectNode,
  InspectSnapshot,
  ResourceCounts,
} from "./core/inspect.js";
export { inspect, inspectResources } from "./core/inspect.js";
export type {
  Channel,
  ChannelOptions,
  FlushSample,
  Frame,
  Meter,
  MeterAggregation,
  ReadSample,
  WriteSample,
} from "./core/meter.js";
export { channel, events, meter, sampleOf } from "./core/meter.js";
export type { NodeKind } from "./loom.js";

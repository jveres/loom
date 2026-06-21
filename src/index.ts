// The lean core surface (the `loom` entrypoint): reactivity, lifecycle, and the generic
// channel/meter messaging primitives. No tooling rides along by default. The observability addon
// — watching loom's own internals via the built-in `events` registry and graph snapshots — is a separate,
// opt-in surface at `loom/observe`. The implementation lives in ./loom.ts; this file just curates
// what the default import exposes.
export {
  batch,
  channel,
  computed,
  configure,
  effect,
  fields,
  meter,
  mutate,
  polled,
  scope,
  source,
  state,
  trigger,
  untrack,
  update,
} from "./loom.js";
export type {
  Channel,
  ChannelOptions,
  EffectFn,
  EffectOptions,
  ErrorHandler,
  Fields,
  Frame,
  InspectNode,
  Meter,
  NodeKind,
  NodeOptions,
  Polled,
  Read,
  Scope,
  SourceConnect,
  State,
  Stop,
} from "./loom.js";

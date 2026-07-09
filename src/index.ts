// The lean core surface (the `loom` entrypoint): reactivity, lifecycle, and the generic
// channel/meter messaging primitives. No tooling rides along by default. The observability addon
// — watching loom's own internals via the built-in `events` registry and graph snapshots — is a separate,
// opt-in surface at `loom/observe`. The implementation lives in ./loom.ts; this file just curates
// what the default import exposes.

export type {
  Channel,
  ChannelOptions,
  Frame,
  Meter,
  MeterAggregation,
} from "./core/meter.js";
export { channel, meter } from "./core/meter.js";
export type {
  CleanupEffectFn,
  ConfigureOptions,
  DeferScheduler,
  EffectFn,
  EffectOptions,
  ErrorHandler,
  NodeInfo,
  NodeKind,
  NodeOptions,
  Polled,
  Props,
  Read,
  Scope,
  SourceConnect,
  State,
  Stop,
} from "./loom.js";
export {
  batch,
  computed,
  configure,
  effect,
  mutate,
  poll,
  props,
  scope,
  source,
  state,
  trigger,
  untrack,
  update,
  watch,
} from "./loom.js";

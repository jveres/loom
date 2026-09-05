// The lean core surface (the `loom` entrypoint): production reactivity and lifecycle only.
// No instrumentation or tooling rides along by default. The observability addon
// — watching loom's own internals via the built-in `events` registry and graph snapshots — is a separate,
// opt-in surface at `loom/observe`. The implementation lives in ./loom.ts; this file just curates
// what the default import exposes.

export {
  type KeyedStates,
  keyedStates,
  type TypedKeyedStates,
} from "./keyed-states.js";
export { lens } from "./lens.js";
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
  writable,
} from "./loom.js";
export {
  type Revisions,
  type RevisionsOptions,
  revisions,
} from "./revisions.js";
export { runtimeSlot } from "./runtime-slot.js";
export { weakMemo } from "./weak-memo.js";

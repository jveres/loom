import {
  createReactiveSystem,
  type Link,
  type ReactiveNode,
} from "alien-signals/system";

const Mutable = 1;
const Watching = 2;
const RecursedCheck = 4;
const Recursed = 8;
const Dirty = 16;
const Pending = 32;
const HasChildEffect = 64;

export interface State<T> {
  (): T;
  (next: T): void;
}

export type Read<T> = () => T;
export type Stop = () => void;
// A scope handle: dispose all owned effects, or suspend/resume their runs as a group.
export interface Scope {
  readonly stop: Stop;
  readonly pause: () => void;
  readonly resume: () => void;
}
export type EffectFn = () => void;
// Global effect error boundary (see configure). Receives the throw and, when inspection is on, the
// offending node. Without one set, a throwing effect propagates to whatever triggered the run.
export type ErrorHandler = (error: unknown, node?: InspectNode) => void;
// Wire an external producer to `set`; return a teardown run when the source goes unobserved.
export type SourceConnect<T> = (set: (value: T) => void) => Stop;
export type NodeKind = "state" | "computed" | "effect";

// Shared creation options for every primitive. `effect` adds `target` (see EffectOptions); the
// others (state/computed/fields/source/polled/scope) take NodeOptions directly.
export interface NodeOptions {
  readonly internal?: boolean;
  readonly label?: string;
}

export interface EffectOptions extends NodeOptions {
  readonly target?: object;
  /**
   * Run this effect in the deferred lane: re-runs happen off the critical path (idle-first,
   * coalesced) instead of in the synchronous flush. The initial run is still synchronous (so deps
   * are tracked and the first output is immediate); only re-runs defer. Coalesced means it sees the
   * latest value, NOT every transition — use a channel for every-transition.
   */
  readonly defer?: boolean;
  /**
   * Deferred lane only: the guaranteed-refresh floor in ms — runs when idle, but at least this often
   * under sustained load. Default: configure({ deferTimeout }) (200ms). Best-effort, not hard
   * real-time: an app task longer than this delays everything.
   */
  readonly maxStale?: number;
}

/**
 * Schedules a deferred drain to run no later than `maxStale` ms, preferring idle time, passing it a
 * `hasBudget()` to poll so it can yield mid-drain. Returns a cancel. Override via
 * configure({ deferScheduler }) — e.g. a synchronous one in tests, a no-op on the server.
 */
export type DeferScheduler = (
  drain: (hasBudget: () => boolean) => void,
  maxStale: number,
) => () => void;

export interface InspectNode {
  readonly id: number;
  readonly kind: NodeKind;
  readonly label: string;
  readonly internal: boolean;
  readonly deps: readonly number[];
  readonly subs: readonly number[];
  readonly runs: number;
  readonly disposed: boolean;
  readonly target?: object;
  readonly value?: unknown;
  readonly source?: State<unknown>;
  // Cells from one fields() call share a `group` id; `key` is the property name within it.
  readonly group?: number;
  readonly key?: string;
}

export interface InspectSnapshot {
  readonly nodes: readonly InspectNode[];
}

type CleanupEffectFn = () => Stop;
type InternalEffectFn = EffectFn | CleanupEffectFn;

type FieldKey<T extends object> = Extract<keyof T, string>;

export type Fields<T extends object> = {
  readonly [K in FieldKey<T>]: State<T[K]>;
};

type Writable<T> = { -readonly [K in keyof T]: T[K] };

type NodeBase = ReactiveNode & {
  deps?: Link | undefined;
  depsTail?: Link | undefined;
  meta?: InspectMeta | undefined;
  subs?: Link | undefined;
  subsTail?: Link | undefined;
};

interface StateNode<T> extends NodeBase {
  currentValue: T;
  pendingValue: T;
  source?: State<unknown> | undefined;
}

// A lazy external source: a state-shaped value cell that runs `connect` when it gains its first
// subscriber and the returned `disconnect` when it loses its last (see sourceOper / unwatched).
interface SourceNode<T> extends StateNode<T> {
  connect: SourceConnect<T>;
  disconnect: Stop | undefined;
  active: boolean;
}

interface ComputedNode<T> extends NodeBase {
  value: T | undefined;
  getter(previousValue?: T): T;
}

interface EffectNode extends NodeBase {
  fn: InternalEffectFn;
  cleanup: Stop | undefined;
  // The scope that owns this effect (for collective stop/pause/resume), if any, and this effect's
  // slot in scope.effects — so a manual stop can swap-remove in O(1) instead of leaking the dead node.
  scope: ScopeNode | undefined;
  scopeIndex: number;
  deferred: boolean; // route re-runs to the deferred lane instead of the synchronous flush
  deferredQueued: boolean; // currently in deferredQueue (O(1) dedup, replaces an includes() scan)
  maxStale: number; // deferred lane: guaranteed-refresh floor in ms
}

// A non-effect resource owned by a scope (a polled timer, a lazy source's connection): suspended
// and resumed with the scope's effects, and torn down when it stops.
interface ScopeResource {
  pause(): void;
  resume(): void;
  stop(): void;
}

// An ownership group for effects, resources, and nested scopes. Effects/resources created while a
// scope is active register here; the scope can stop them, or pause/resume them collectively. An
// effect runs (and a resource stays live) only while no scope in its parent chain is paused.
interface ScopeNode {
  readonly effects: EffectNode[];
  readonly resources: ScopeResource[];
  readonly children: ScopeNode[];
  readonly parent: ScopeNode | undefined;
  // Default node options (internal/label) applied to everything created in the scope,
  // already merged with any ancestor scope's defaults.
  readonly options: NodeOptions | undefined;
  paused: boolean;
  // Number of paused scopes in this node's ancestor chain (including itself). scopePaused() is then
  // an O(1) `> 0` test instead of walking to the root on every notify; maintained on pause/resume.
  pausedCount: number;
  stopped: boolean;
}

interface InspectMeta {
  readonly id: number;
  readonly internal: boolean;
  readonly kind: NodeKind;
  readonly label: string;
  readonly target: WeakRef<object> | undefined;
  disposed: boolean;
  runs: number;
  group?: number; // fields() group id (set by fields() when inspection is on)
  key?: string; // property key within that group
}

let cycle = 0;
let runDepth = 0;
let batchDepth = 0;
let notifyIndex = 0;
let queuedLength = 0;
let activeSub: NodeBase | undefined;
let activeScope: ScopeNode | undefined;
const queued: Array<EffectNode | undefined> = [];
// Deferred lane: effects whose re-runs run off the critical path (see deferEffect/drainDeferred).
// A head index makes the drain O(1)-per-item (no shift); drained slots are nulled and the backing
// array reset once fully consumed.
const deferredQueue: Array<EffectNode | undefined> = [];
let deferHead = 0;
let drainScheduled = false;
let drainDeadline = Number.POSITIVE_INFINITY; // absolute time (now()+maxStale) the pending drain fires by
let drainCancel: (() => void) | undefined;
let deferTimeout = 200; // global default maxStale (ms); overridable via configure()
let deferScheduler: DeferScheduler = defaultDeferScheduler;
const DEFER_BUDGET_MS = 5; // a forced (no-idle) drain runs at most ~this long, then yields
let inspectId = 0;
let fieldsGroup = 0; // shared id stamped on the cells of each fields() call (for inspector grouping)
let liveScopes = 0; // non-internal scopes alive now (for inspectResources; off the reactive path)
// Inspection is opt-in: off by default so node creation allocates no metadata (zero cost). Turn it
// on with configure({ inspect: true }) BEFORE creating the nodes you want visible to inspect()/the
// inspector — nodes created while it's off carry no metadata and never appear.
let inspectEnabled = false;
let onError: ErrorHandler | undefined;
const inspectRefs = new Map<number, WeakRef<NodeBase>>();
// Each public accessor (a state source, computed read, or effect stop) carries a hidden handle to
// its node via this private symbol — so depsOf()/trigger() resolve a node in O(1) without the
// per-create WeakMap registration create-heavy workloads would otherwise pay even with inspection off.
const NODE = Symbol("loom.node");
type NodeHandle = { [NODE]?: NodeBase | undefined };
function tagNode(accessor: object, node: NodeBase): void {
  Object.defineProperty(accessor, NODE, { value: node });
}
function nodeOf(accessor: object): NodeBase | undefined {
  return (accessor as NodeHandle)[NODE];
}

const { link, unlink, propagate, checkDirty, shallowPropagate } =
  createReactiveSystem({
    update(node) {
      switch (kindOf(node)) {
        case "computed":
          return updateComputed(node as ComputedNode<unknown>);
        case "state":
          return updateState(node as StateNode<unknown>);
        default:
          node.flags = Mutable;
          return true;
      }
    },
    notify(node) {
      const effectNode = node as EffectNode;
      // Effects in a paused scope chain stay dirty and re-run on resume instead of queueing now.
      if (effectNode.scope !== undefined && scopePaused(effectNode.scope))
        return;
      if (effectNode.deferred) deferEffect(effectNode);
      else queueEffect(effectNode);
    },
    unwatched(node) {
      switch (kindOf(node)) {
        case "computed":
          if (node.depsTail !== undefined) {
            node.flags = Mutable | Dirty;
            disposeDeps(node as ComputedNode<unknown>);
          }
          return;
        case "state":
          if ("connect" in node) disconnectSource(node as SourceNode<unknown>);
          return;
        case "effect":
          stopEffect.call(node as EffectNode);
          return;
        default:
          disposeDeps(node as NodeBase);
      }
    },
  });

export function state<T>(initial: T, options?: NodeOptions): State<T> {
  const node = createStateNode(initial);
  const source = stateOper.bind(node) as State<T>;
  node.source = source as State<unknown>;
  const meta = registerNode(node, "state", options);
  tagNode(source, node);
  if (createCh.meters !== 0 && meta?.internal !== true) createCh.seq++;
  return source;
}

/**
 * A lazy reactive source backed by an external producer. `connect(set)` is invoked the first
 * time the source is read inside a live effect/computed (its first subscriber); it wires up the
 * producer — a timer, event listener, `PerformanceObserver`, socket — and returns a teardown
 * run automatically when the last subscriber goes away. Reads while unobserved return the last
 * value (or `initial`). `connect` should push values via `set` asynchronously.
 */
export function source<T>(
  connect: SourceConnect<T>,
  initial: T,
  options?: NodeOptions,
): Read<T> {
  const node = createSourceNode(connect, initial);
  const read = sourceOper.bind(node) as Read<T>;
  const meta = registerNode(node, "state", options);
  tagNode(read, node);
  // When created inside a scope, pausing the scope disconnects the producer even though paused
  // subscribers stay linked; resuming reconnects it if anything is still observing.
  const erased = node as SourceNode<unknown>;
  activeScope?.resources.push({
    pause: () => disconnectSource(erased),
    resume: () => reconnectSource(erased),
    stop: () => disconnectSource(erased),
  });
  if (createCh.meters !== 0 && meta?.internal !== true) createCh.seq++;
  return read;
}

function connectSource<T>(node: SourceNode<T>): void {
  node.active = true; // set first so a re-entrant read during connect() doesn't connect twice
  try {
    node.disconnect = node.connect((value) => sourceSet(node, value));
  } catch (error) {
    // connect() failed: leave the source disconnected (not wedged "active" with no teardown) so a
    // later observation can retry, then surface the failure to the reader that triggered it.
    node.active = false;
    throw error;
  }
}

function disconnectSource(node: SourceNode<unknown>): void {
  if (!node.active) return;
  node.active = false;
  const off = node.disconnect;
  node.disconnect = undefined;
  off?.();
}

function reconnectSource(node: SourceNode<unknown>): void {
  // Reconnect only if it was observed (still has subscribers) but is currently disconnected.
  if (node.active || node.subs === undefined) return;
  connectSource(node);
}

export function computed<T>(
  getter: (previousValue?: T) => T,
  options?: NodeOptions,
): Read<T> {
  const node = createComputedNode(getter);
  const read = computedOper.bind(node) as Read<T>;
  const meta = registerNode(node, "computed", options);
  tagNode(read, node);
  if (createCh.meters !== 0 && meta?.internal !== true) createCh.seq++;
  return read;
}

export function effect(fn: CleanupEffectFn, options?: EffectOptions): Stop;
export function effect(fn: EffectFn, options?: EffectOptions): Stop;
export function effect(fn: InternalEffectFn, options?: EffectOptions): Stop {
  const node = createEffectNode(fn);
  if (activeScope !== undefined) {
    node.scope = activeScope;
    node.scopeIndex = activeScope.effects.length;
    activeScope.effects.push(node);
  }
  if (options?.defer === true) {
    node.deferred = true;
    node.maxStale = options.maxStale ?? deferTimeout;
  }
  const meta = registerNode(node, "effect", options);
  if (createCh.meters !== 0 && meta?.internal !== true) createCh.seq++;
  const previous = setActiveSub(node);
  if (previous !== undefined) {
    link(node, previous, 0);
    previous.flags |= HasChildEffect;
  }
  let caught: { error: unknown } | undefined;
  try {
    runDepth++;
    node.cleanup = asCleanup(node.fn());
  } catch (error) {
    caught = { error };
  } finally {
    runDepth--;
    activeSub = previous;
    node.flags &= ~RecursedCheck;
  }
  if (caught !== undefined) {
    if (onError === undefined) {
      // The first run threw and there's no boundary: the caller never receives a disposer, so the
      // deps read before the throw would retain this dead effect. Dispose it here, then surface.
      stopEffect.call(node);
      throw caught.error;
    }
    reportEffectError(caught.error, node);
  }
  if (meta) meta.runs++;
  if (effectCh.meters !== 0 && meta?.internal !== true) effectCh.seq++;
  const stop = stopEffect.bind(node);
  tagNode(stop, node);
  return stop;
}

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    if (--batchDepth === 0) flush();
  }
}

/**
 * Group the effects created inside `fn` so they can be torn down or suspended together: `stop()`
 * disposes them, `pause()` suspends their runs (intervening changes just mark them dirty), and
 * `resume()` re-runs the ones that went dirty while paused. Scopes nest — a scope created inside
 * another becomes its child, and an effect runs only while no scope in its parent chain is paused.
 * So pausing a parent freezes its whole subtree, and resuming it leaves an independently-paused
 * child suspended.
 */
export function scope(fn: () => void, options?: NodeOptions): Scope {
  const node: ScopeNode = {
    effects: [],
    resources: [],
    children: [],
    parent: activeScope,
    // Inherit the parent scope's defaults, letting this scope's own options override.
    options: mergeOptions(activeScope?.options, options),
    paused: false,
    // Inherit the parent's paused-ancestor count: a scope created under a paused chain starts paused.
    pausedCount: activeScope?.pausedCount ?? 0,
    stopped: false,
  };
  if (node.options?.internal !== true) liveScopes++;
  activeScope?.children.push(node);
  const previous = activeScope;
  activeScope = node;
  try {
    fn();
  } catch (error) {
    // The body threw partway through: tear down whatever it already created so those effects and
    // resources aren't orphaned — the caller never receives a disposer. See alien-signals #118.3.
    stopScope(node);
    throw error;
  } finally {
    activeScope = previous;
  }
  return {
    stop: () => stopScope(node),
    pause: () => pauseScope(node),
    resume: () => resumeScope(node),
  };
}

function scopePaused(node: ScopeNode): boolean {
  return node.pausedCount > 0;
}

// Add `delta` to the paused-ancestor count of `node` and its whole subtree (every descendant gains
// or loses this scope as a paused ancestor). Walks all children, including independently-paused ones.
function bumpPausedCount(node: ScopeNode, delta: number): void {
  node.pausedCount += delta;
  for (const child of node.children) bumpPausedCount(child, delta);
}

function stopScope(node: ScopeNode): void {
  if (node.stopped) return;
  node.stopped = true;
  if (node.options?.internal !== true) liveScopes--;
  for (const child of node.children) stopScope(child);
  node.children.length = 0;
  for (const effectNode of node.effects) {
    if (effectNode.flags !== 0) stopEffect.call(effectNode);
  }
  node.effects.length = 0;
  for (const resource of node.resources) resource.stop();
  node.resources.length = 0;
  const parent = node.parent;
  // When the parent is tearing us down it clears its own list, so only self-detach otherwise.
  if (parent !== undefined && !parent.stopped) {
    const index = parent.children.indexOf(node);
    if (index >= 0) parent.children.splice(index, 1);
  }
}

function pauseScope(node: ScopeNode): void {
  if (node.paused) return;
  // Suspend resources only when this newly pauses the chain (an ancestor pause already did so).
  const newlySuspends = !scopePaused(node);
  node.paused = true;
  bumpPausedCount(node, 1);
  if (newlySuspends) walkResources(node, (r) => r.pause());
}

function resumeScope(node: ScopeNode): void {
  if (!node.paused) return;
  node.paused = false;
  bumpPausedCount(node, -1);
  // If an ancestor is still paused, the chain stays suspended — do nothing yet.
  if (scopePaused(node)) return;
  walkResources(node, (r) => r.resume());
  flushScope(node);
  // If we're resuming from inside an effect run (e.g. a tab switch), the re-queued effects ride
  // the in-progress flush; only drive a fresh flush when at the top level.
  if (batchDepth === 0 && runDepth === 0) flush();
}

// Apply `act` to every resource in the subtree, skipping independently-paused children (theirs are
// already in the matching state).
function walkResources(
  node: ScopeNode,
  act: (resource: ScopeResource) => void,
): void {
  for (const resource of node.resources) act(resource);
  for (const child of node.children) {
    if (!child.paused) walkResources(child, act);
  }
}

// Queue every dirty effect in the subtree whose chain is now unpaused; independently-paused
// children stay deferred. The caller flushes the queued effects.
function flushScope(node: ScopeNode): void {
  if (scopePaused(node)) return;
  for (const effectNode of node.effects) {
    if (effectNode.flags & (Dirty | Pending)) {
      if (effectNode.deferred) deferEffect(effectNode);
      else queueEffect(effectNode);
    }
  }
  for (const child of node.children) flushScope(child);
}

export interface Polled<T> {
  readonly read: Read<T>;
  readonly stop: Stop;
}

/**
 * A reactive source that re-samples `sample()` every `ms` milliseconds into a value-deduped
 * signal. Bindings reading `.read()` re-run only when the sampled value actually changes — so
 * it bridges imperative or external data (clocks, `performance` counters, polled APIs, media
 * state) into the reactive graph without a hand-rolled heartbeat. Call `.stop()` to clear the
 * timer. The backing state honours `options` (e.g. `{ internal: true }`).
 */
export function polled<T>(
  sample: () => T,
  ms: number,
  options?: NodeOptions,
): Polled<T> {
  const cell = state(sample(), options);
  let timer: ReturnType<typeof setInterval> | undefined;
  const start = (): void => {
    timer = setInterval(() => cell(sample()), ms);
  };
  const clear = (): void => {
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  };
  start();
  // When created inside a scope, the timer suspends while the scope is paused (resuming with an
  // immediate catch-up sample) and clears when the scope stops.
  activeScope?.resources.push({
    pause: clear,
    resume: () => {
      if (timer === undefined) {
        cell(sample());
        start();
      }
    },
    stop: clear,
  });
  return { read: () => cell(), stop: clear };
}

export function trigger(source: Read<unknown>): void {
  // Fast path: a known loom accessor reads exactly its own node, so propagate that node's subs
  // directly — no temporary watcher to allocate, link, and unlink (the common mutate() case).
  const known = nodeOf(source as object);
  if (known !== undefined) {
    const subs = known.subs;
    if (subs !== undefined) {
      propagate(subs, runDepth > 0);
      shallowPropagate(subs);
    }
    if (batchDepth === 0) flush();
    return;
  }
  const sub = createWatcherNode();
  const previous = setActiveSub(sub);
  try {
    source();
  } finally {
    activeSub = previous;
    sub.flags = 0;
    let dep = sub.deps;
    while (dep !== undefined) {
      const node = dep.dep;
      dep = unlink(dep, sub);
      const subs = node.subs;
      if (subs !== undefined) {
        propagate(subs, runDepth > 0);
        shallowPropagate(subs);
      }
    }
    if (batchDepth === 0) flush();
  }
}

export function untrack<T>(fn: () => T): T {
  const previous = setActiveSub(undefined);
  try {
    return fn();
  } finally {
    setActiveSub(previous);
  }
}

export function update<T>(source: State<T>, fn: (value: T) => T): void {
  source(fn(source()));
}

export function mutate<T extends object>(
  source: State<T>,
  fn: (value: T) => void,
): void {
  fn(source());
  trigger(source);
}

export function fields<T extends object>(
  initial: T,
  options?: NodeOptions,
): Fields<T> {
  if (!isPlainObject(initial)) {
    throw new TypeError("fields() expects a plain object.");
  }
  const out = {} as { [K in FieldKey<T>]: State<T[K]> };
  const keys = Object.keys(initial) as Array<FieldKey<T>>;
  // One group id per call so the inspector can re-nest the cells under a single parent.
  const group = inspectEnabled ? ++fieldsGroup : 0;
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index] as FieldKey<T>;
    const cell = state(initial[key], fieldOptions(options, key));
    if (group !== 0) {
      const meta = nodeOf(cell as object)?.meta;
      if (meta) {
        meta.group = group;
        meta.key = key;
      }
    }
    out[key] = cell;
  }
  return out;
}

/* ===== Channels & meters: generic, gated, overwriting ring buffers drained by a pull-based meter.
   A channel is a process-global, name-addressed singleton (the producer/consumer rendezvous). It
   stays a no-op — and allocation-free — until a meter attaches. Counts are exact; detail is a
   bounded, most-recent sample that drops oldest under overflow, so no event rate and no consumer
   can stall the producer. (loom's own self-instrumentation built on these is the `events` registry
   below, surfaced via loom/observe — but the primitives themselves are generic.) ===== */

export interface ChannelOptions {
  /** Detail-ring capacity (rounded up to a power of two). 0 = count-only. Default 0. */
  readonly capacity?: number;
  /** Field names recorded per event on a detail channel (up to 5); emit() takes one value each. */
  readonly fields?: readonly string[];
}

export interface Channel {
  readonly name: string;
  /** True while ≥1 meter is attached — gate expensive argument prep behind it. */
  readonly active: boolean;
  /** Record one event. No-op and zero-allocation when inactive. One value per declared field. */
  emit(a?: unknown, b?: unknown, c?: unknown, d?: unknown, e?: unknown): void;
}

export interface Frame {
  /** Exact events on this channel since the last read(). */
  readonly count: number;
  /** Events lost to ring overwrite since the last read() (detail channels only). */
  readonly dropped: number;
  /** Most-recent records, oldest→newest, at most `capacity`; keyed by the channel's fields. */
  readonly samples: ReadonlyArray<Readonly<Record<string, unknown>>>;
}

/**
 * How a meter reads its channels — borrowed from OpenTelemetry's instrument↔view split: the channel
 * is the instrument (what's measured), the meter is the reader/view (how it's read), and different
 * meters can read the same channel differently.
 * - `"count"` (default) — the Sum/Counter view: `read()` returns counts only and builds no per-event
 *   objects (zero allocation). For rates.
 * - `"samples"` — the records view (OTel exemplars/logs): `read()` also materialises the channel's
 *   retained ring records. For event streams and histograms.
 */
export type MeterAggregation = "count" | "samples";

export interface Meter {
  /** Pull one Frame per metered channel, keyed by channel name. Call on your own clock. */
  read(): Readonly<Record<string, Frame>>;
  /** Detach from every channel (drops their gate). */
  stop(): void;
}

interface ChannelNode {
  readonly name: string;
  readonly cap: number;
  readonly mask: number;
  readonly fields: readonly string[];
  readonly cols: unknown[][];
  meters: number; // attached meters of any kind (gates counting at the emit sites)
  samples: number; // of those, the "samples" meters — detail recording is gated on this, so a
  // count-only consumer (e.g. the stats rates) doesn't pay for the ring write + timestamp
  seq: number; // monotonic count (double; exact to 2^53)
  head: number; // ring write index (0..cap-1)
}

const channelRegistry = new Map<string, ChannelNode>();
// Shared by every count-only channel's Frame (and any channel with no new samples) so meter.read()
// allocates nothing on the common path.
const EMPTY_SAMPLES: ReadonlyArray<Readonly<Record<string, unknown>>> = [];

// A detail ring is small (a recent-samples buffer); bound capacity well under 2^31 so the pow2 loop
// can't overflow into an infinite loop, and reject clearly-invalid input on this public path.
const MAX_CHANNEL_CAPACITY = 1 << 20; // 1,048,576
const MAX_CHANNEL_FIELDS = 5; // emit()/recordChannel record up to 5 positional values

function toPow2(capacity: number): number {
  if (capacity === 0) return 0;
  if (
    !Number.isInteger(capacity) ||
    capacity < 0 ||
    capacity > MAX_CHANNEL_CAPACITY
  ) {
    throw new RangeError(
      `Channel capacity must be an integer in [0, ${MAX_CHANNEL_CAPACITY}]; got ${capacity}.`,
    );
  }
  let p = 1;
  while (p < capacity) p <<= 1;
  return p;
}

function createChannelNode(
  name: string,
  options?: ChannelOptions,
): ChannelNode {
  const cap = toPow2(options?.capacity ?? 0);
  const fields = options?.fields ?? [];
  if (fields.length > MAX_CHANNEL_FIELDS) {
    throw new RangeError(
      `A channel records up to ${MAX_CHANNEL_FIELDS} fields; "${name}" declares ${fields.length}.`,
    );
  }
  const cols: unknown[][] = [];
  if (cap > 0)
    for (let i = 0; i < fields.length; i++) cols.push(new Array(cap));
  return {
    name,
    cap,
    mask: cap > 0 ? cap - 1 : 0,
    fields,
    cols,
    meters: 0,
    samples: 0,
    seq: 0,
    head: 0,
  };
}

// Record one event (caller has checked node.meters !== 0). Zero-allocation: columnar ring write,
// one fixed positional value per field (up to 5) so nothing is allocated on the producer path.
function recordChannel(
  node: ChannelNode,
  a: unknown,
  b: unknown,
  c: unknown,
  d: unknown,
  e: unknown,
): void {
  if (node.cap !== 0) {
    const h = node.head;
    const { cols } = node;
    const c0 = cols[0];
    if (c0 !== undefined) c0[h] = a;
    const c1 = cols[1];
    if (c1 !== undefined) c1[h] = b;
    const c2 = cols[2];
    if (c2 !== undefined) c2[h] = c;
    const c3 = cols[3];
    if (c3 !== undefined) c3[h] = d;
    const c4 = cols[4];
    if (c4 !== undefined) c4[h] = e;
    node.head = (h + 1) & node.mask;
  }
  node.seq++;
}

// Record a read on the read channel — the cell, the reader (the running effect/computed) that
// consumed it, and when. Callers gate on `readCh.meters !== 0 && !internal` so the idle path stays a
// branch; `meta === undefined` (inspection off for this cell) just counts.
function recordRead(node: NodeBase, sub: NodeBase): void {
  const meta = node.meta;
  if (meta !== undefined)
    recordChannel(
      readCh,
      meta.id,
      sub.meta?.id,
      Date.now(),
      undefined,
      undefined,
    );
  else readCh.seq++;
}

function channelOf(node: ChannelNode): Channel {
  return {
    name: node.name,
    get active() {
      return node.meters !== 0;
    },
    emit(a, b, c, d, e) {
      if (node.meters !== 0) recordChannel(node, a, b, c, d, e);
    },
  };
}

export function channel(name: string, options?: ChannelOptions): Channel {
  let node = channelRegistry.get(name);
  if (node === undefined) {
    node = createChannelNode(name, options);
    channelRegistry.set(name, node);
  } else if (options !== undefined) {
    const cap = toPow2(options.capacity ?? 0);
    if (
      cap !== node.cap ||
      (options.fields ?? []).join() !== node.fields.join()
    ) {
      throw new Error(
        `Channel "${name}" already declared with different options.`,
      );
    }
  }
  return channelOf(node);
}

export function meter(
  channels: ReadonlyArray<Channel>,
  aggregation: MeterAggregation = "count",
): Meter {
  const withSamples = aggregation === "samples";
  const members: Array<{ readonly node: ChannelNode; cursor: number }> = [];
  for (const ch of channels) {
    const node = channelRegistry.get(ch.name);
    if (node !== undefined) members.push({ node, cursor: node.seq });
  }
  let attached = false;
  const attach = (): void => {
    if (attached) return;
    attached = true;
    for (const m of members) {
      m.node.meters++;
      if (withSamples) m.node.samples++;
      m.cursor = m.node.seq;
    }
  };
  const detach = (): void => {
    if (!attached) return;
    attached = false;
    for (const m of members) {
      m.node.meters--;
      if (withSamples) m.node.samples--;
    }
  };
  attach();
  // A meter is a scope resource: pause() detaches (the channels can go inactive → the core's emit
  // sites become no-ops again), resume() re-attaches fresh, stop()/scope teardown detaches.
  activeScope?.resources.push({ pause: detach, resume: attach, stop: detach });
  return {
    read() {
      const frame: Record<string, Frame> = {};
      for (const m of members) {
        const node = m.node;
        const seq = node.seq;
        const count = seq - m.cursor;
        let dropped = 0;
        // The `count` view (and any channel with nothing new) shares one frozen empty array, so a
        // count read allocates nothing per channel; only a `samples` view materialises records.
        let samples: ReadonlyArray<Readonly<Record<string, unknown>>> =
          EMPTY_SAMPLES;
        if (withSamples && node.cap !== 0 && count > 0) {
          const avail = count < node.cap ? count : node.cap;
          dropped = count - avail;
          const { cols, fields, mask, head, cap } = node;
          const out: Array<Record<string, unknown>> = [];
          for (let k = 0; k < avail; k++) {
            const idx = (head + cap - avail + k) & mask;
            const rec: Record<string, unknown> = {};
            for (let f = 0; f < fields.length; f++) {
              rec[fields[f] as string] = cols[f]?.[idx];
            }
            out.push(rec);
          }
          samples = out;
        }
        m.cursor = seq;
        frame[node.name] = { count, dropped, samples };
      }
      return frame;
    },
    stop: detach,
  };
}

// The runtime's built-in channels, exposed publicly as `events` (via loom/observe). The core
// records to these inline at the hot-path sites; they stay no-ops until a meter attaches. Records
// non-internal nodes only, so the idle baseline is zero.
// read carries detail (which cell, the reader that read it, when) so a "samples" meter can stream
// reads (the Trace tab); a "count" meter (the read rate) ignores the ring. Reads are the
// highest-frequency event, so the per-read recording is paid only while metered and stays zero-alloc.
// `by` is the running effect/computed that performed the read — i.e. who consumed the cell.
const readCh = createChannelNode("loom:read", {
  capacity: 1024,
  fields: ["id", "by", "t"],
});
// write carries detail so a "samples" meter can stream individual mutations (id + prev→next + the
// node that wrote it + a wall-clock timestamp), e.g. the inspector's Trace tab; a "count" meter
// (the rates) ignores the ring and allocates nothing. `by` is the effect/computed that wrote during
// a reactive cascade, or undefined for a top-level (event-handler) write.
const writeCh = createChannelNode("loom:write", {
  capacity: 1024,
  fields: ["id", "prev", "next", "by", "t"],
});
const computeCh = createChannelNode("loom:compute");
const effectCh = createChannelNode("loom:effect");
const flushCh = createChannelNode("loom:flush", {
  capacity: 8,
  fields: ["batchSize", "durationMs"],
});
const createCh = createChannelNode("loom:create");
const disposeCh = createChannelNode("loom:dispose");
for (const node of [
  readCh,
  writeCh,
  computeCh,
  effectCh,
  flushCh,
  createCh,
  disposeCh,
]) {
  channelRegistry.set(node.name, node);
}

// Each /* @__PURE__ */ marks its channelOf() wrapper side-effect-free, so a bundler drops the
// public `events` accessors when an app never meters. The built-in channel *nodes* above stay (the
// core's emit gates reference them); only these wrappers tree-shake away.
export const events = {
  read: /* @__PURE__ */ channelOf(readCh),
  write: /* @__PURE__ */ channelOf(writeCh),
  compute: /* @__PURE__ */ channelOf(computeCh),
  effect: /* @__PURE__ */ channelOf(effectCh),
  flush: /* @__PURE__ */ channelOf(flushCh),
  create: /* @__PURE__ */ channelOf(createCh),
  dispose: /* @__PURE__ */ channelOf(disposeCh),
} as const;

/**
 * Configure the runtime.
 *
 * `inspect` toggles the always-off-by-default inspection layer: while it is off, node creation
 * allocates no metadata and `inspect()`/`depsOf()`/`inspectResources()` and the inspector see
 * nothing — true zero cost. Turn it on (typically once at startup, before creating the nodes you
 * want visible) when you need tooling; nodes created while it was off stay invisible.
 *
 * `onError` installs a global effect error boundary. Without one, an effect that throws propagates
 * to whatever triggered the run (a `state` write or `batch`) and aborts the rest of that flush.
 * With one, the throw is routed to the handler and the flush continues with the other effects. Pass
 * `undefined` to remove it.
 */
export function configure(options: {
  readonly inspect?: boolean;
  readonly onError?: ErrorHandler | undefined;
  /** Override the deferred-effect scheduler (e.g. synchronous in tests, no-op on the server). */
  readonly deferScheduler?: DeferScheduler;
  /** Default `maxStale` (ms) for deferred effects that don't set their own. Default 200. */
  readonly deferTimeout?: number;
}): void {
  if (options.inspect !== undefined) inspectEnabled = options.inspect;
  if ("onError" in options) onError = options.onError;
  if (options.deferScheduler !== undefined)
    deferScheduler = options.deferScheduler;
  if (options.deferTimeout !== undefined) deferTimeout = options.deferTimeout;
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
  readonly effects: number;
  readonly views: number;
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
  let views = 0;
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
      // An effect bound to a DOM node (loom/dom's text/attr/class/style/list bindings set `target`)
      // is a view — the rendering output — counted apart from app effects.
      if (meta.target !== undefined) views++;
      else effects++;
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
    views,
    sources,
    scopes: liveScopes,
    channels: channelRegistry.size,
    unread,
  };
}

export function depsOf(source: Read<unknown> | Stop): readonly InspectNode[] {
  const node = nodeForSource(source);
  if (!node) return [];

  const deps: InspectNode[] = [];
  for (let item = node.deps; item !== undefined; item = item.nextDep) {
    const dep = item.dep as NodeBase;
    const meta = dep.meta;
    if (meta && inspectRefs.has(meta.id)) deps.push(inspectNode(dep, meta));
  }
  return deps;
}

// Merge two option sets, letting the second (more specific) win; either may be undefined.
function mergeOptions<T extends NodeOptions>(
  defaults: NodeOptions | undefined,
  own: T | undefined,
): T | NodeOptions | undefined {
  if (defaults === undefined) return own;
  if (own === undefined) return defaults;
  return { ...defaults, ...own };
}

function registerNode(
  node: NodeBase,
  kind: NodeKind,
  options: NodeOptions | EffectOptions | undefined,
): InspectMeta | undefined {
  // Opt-in: when inspection is off, skip all metadata work — this is the per-node allocation
  // (InspectMeta + WeakRef + Map insert) that dominates create-heavy workloads.
  if (!inspectEnabled) return undefined;
  // Apply the active scope's ambient defaults (internal/label) under any explicit ones.
  const opts = mergeOptions(activeScope?.options, options);
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
  return meta;
}

function fieldOptions(
  options: NodeOptions | undefined,
  key: string,
): NodeOptions | undefined {
  if (!options) return undefined;
  const out: NodeOptions = {
    label: options.label ? `${options.label}.${key}` : key,
  };
  return options.internal !== undefined
    ? { ...out, internal: options.internal }
    : out;
}

function nodeForSource(source: Read<unknown> | Stop): NodeBase | undefined {
  return nodeOf(source as object);
}

function inspectNode(node: NodeBase, meta: InspectMeta): InspectNode {
  const base = {
    id: meta.id,
    deps: idsFromDeps(node),
    disposed: meta.disposed,
    internal: meta.internal,
    kind: meta.kind,
    label: meta.label,
    runs: meta.runs,
    subs: idsFromSubs(node),
  };
  const source = sourceFromNode(node, meta);
  const target = meta.target?.deref();
  const value = nodeValue(node);
  return inspectNodeWithOptionals(base, source, target, value, meta);
}

function inspectNodeWithOptionals(
  base: Omit<InspectNode, "source" | "target" | "value" | "group" | "key">,
  source: State<unknown> | undefined,
  target: object | undefined,
  value: unknown,
  meta: InspectMeta,
): InspectNode {
  const out: Writable<InspectNode> = { ...base };
  if (source !== undefined) out.source = source;
  if (target !== undefined) out.target = target;
  if (value !== undefined) out.value = value;
  if (meta.group !== undefined) out.group = meta.group;
  if (meta.key !== undefined) out.key = meta.key;
  return out;
}

function sourceFromNode(
  node: NodeBase,
  meta: InspectMeta,
): State<unknown> | undefined {
  if (meta.kind !== "state") return undefined;
  return (node as StateNode<unknown>).source;
}

function idsFromDeps(node: NodeBase): number[] {
  const ids: number[] = [];
  for (let item = node.deps; item !== undefined; item = item.nextDep) {
    const meta = (item.dep as NodeBase).meta;
    if (meta) ids.push(meta.id);
  }
  return ids;
}

function idsFromSubs(node: NodeBase): number[] {
  const ids: number[] = [];
  for (let item = node.subs; item !== undefined; item = item.nextSub) {
    const meta = (item.sub as NodeBase).meta;
    if (meta) ids.push(meta.id);
  }
  return ids;
}

function kindOf(node: ReactiveNode): NodeKind | "watcher" {
  if ("getter" in node) return "computed";
  if ("currentValue" in node) return "state";
  if ("fn" in node) return "effect";
  return "watcher";
}

function nodeValue(node: NodeBase): unknown {
  switch (kindOf(node)) {
    case "state":
      return (node as StateNode<unknown>).pendingValue;
    case "computed":
      return (node as ComputedNode<unknown>).value;
    default:
      return undefined;
  }
}

function now(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

function createStateNode<T>(initial: T): StateNode<T> {
  return nodeShape<StateNode<T>>({
    currentValue: initial,
    meta: undefined,
    pendingValue: initial,
    source: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: Mutable,
  });
}

function createSourceNode<T>(
  connect: SourceConnect<T>,
  initial: T,
): SourceNode<T> {
  return nodeShape<SourceNode<T>>({
    currentValue: initial,
    pendingValue: initial,
    source: undefined,
    connect,
    disconnect: undefined,
    active: false,
    meta: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: Mutable,
  });
}

function createComputedNode<T>(
  getter: (previousValue?: T) => T,
): ComputedNode<T> {
  return nodeShape<ComputedNode<T>>({
    value: undefined,
    meta: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 0,
    getter,
  });
}

function createEffectNode(fn: InternalEffectFn): EffectNode {
  return nodeShape<EffectNode>({
    fn,
    cleanup: undefined,
    scope: undefined,
    scopeIndex: -1,
    deferred: false,
    deferredQueued: false,
    maxStale: 0,
    meta: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: Watching | RecursedCheck,
  });
}

function createWatcherNode(): NodeBase {
  return nodeShape<NodeBase>({
    deps: undefined,
    depsTail: undefined,
    meta: undefined,
    flags: Watching,
  });
}

// Each node eagerly assigns every optional Link slot to `undefined` so all nodes
// of a kind share one V8 hidden class (a hot-path perf win). Under
// `exactOptionalPropertyTypes` those `undefined`s aren't assignable to the
// upstream `deps?: Link` fields, so this localized cast bridges the shape.
function nodeShape<TNode extends NodeBase>(node: object): TNode {
  return node as unknown as TNode;
}

function setActiveSub(sub: NodeBase | undefined): NodeBase | undefined {
  const previous = activeSub;
  activeSub = sub;
  return previous;
}

function stateOper<T>(this: StateNode<T>, ...value: [] | [T]): T | undefined {
  if (value.length) {
    const next = value[0] as T;
    const previous = this.pendingValue;
    if (previous !== next) {
      this.pendingValue = next;
      this.flags = Mutable | Dirty;
      // Idle path unchanged (the `meters !== 0` short-circuit gates everything). When metered with
      // inspection on, record id + prev→next for the samples view; otherwise just count.
      if (writeCh.meters !== 0 && this.meta?.internal !== true) {
        const meta = this.meta;
        if (meta !== undefined && writeCh.samples !== 0)
          recordChannel(
            writeCh,
            meta.id,
            previous,
            next,
            activeSub?.meta?.id, // the effect/computed writing during a cascade, else external
            Date.now(),
          );
        else writeCh.seq++; // count only when no samples consumer (the Trace) is attached
      }
      const subs = this.subs;
      if (subs !== undefined) {
        propagate(subs, runDepth > 0);
        if (batchDepth === 0) flush();
      }
    }
    return undefined;
  }

  if (this.flags & Dirty) {
    if (updateState(this)) {
      const subs = this.subs;
      if (subs !== undefined) shallowPropagate(subs);
    }
  }

  const sub = activeSub;
  if (sub !== undefined) {
    link(this, sub, cycle);
    if (readCh.meters !== 0 && this.meta?.internal !== true) {
      if (readCh.samples !== 0) recordRead(this, sub);
      else readCh.seq++; // count only — no samples consumer (the Trace) wants detail
    }
  }
  return this.currentValue;
}

function sourceOper<T>(this: SourceNode<T>): T {
  if (this.flags & Dirty) {
    if (updateState(this)) {
      const subs = this.subs;
      if (subs !== undefined) shallowPropagate(subs);
    }
  }

  const sub = activeSub;
  if (sub !== undefined) {
    const first = this.subs === undefined;
    link(this, sub, cycle);
    if (first && !this.active) connectSource(this);
    if (readCh.meters !== 0 && this.meta?.internal !== true) {
      if (readCh.samples !== 0) recordRead(this, sub);
      else readCh.seq++; // count only — no samples consumer (the Trace) wants detail
    }
  }
  return this.currentValue;
}

function sourceSet<T>(node: SourceNode<T>, value: T): void {
  if (node.pendingValue === value) return;
  node.pendingValue = value;
  node.flags = Mutable | Dirty;
  const subs = node.subs;
  if (subs !== undefined) {
    propagate(subs, runDepth > 0);
    if (batchDepth === 0) flush();
  }
}

function computedOper<T>(this: ComputedNode<T>): T {
  const flags = this.flags;
  let shouldUpdate = (flags & Dirty) !== 0;
  if (!shouldUpdate && flags & Pending) {
    shouldUpdate = checkDirty(this.deps as Link, this);
    if (!shouldUpdate) this.flags = flags & ~Pending;
  }

  if (shouldUpdate) {
    if (updateComputed(this)) {
      const subs = this.subs;
      if (subs !== undefined) shallowPropagate(subs);
    }
  } else if (!flags) {
    this.flags = Mutable | RecursedCheck;
    const previous = setActiveSub(this);
    try {
      this.value = this.getter();
      if (computeCh.meters !== 0 && this.meta?.internal !== true)
        computeCh.seq++;
    } finally {
      activeSub = previous;
      this.flags &= ~RecursedCheck;
    }
  }

  const sub = activeSub;
  if (sub !== undefined) {
    link(this, sub, cycle);
    if (readCh.meters !== 0 && this.meta?.internal !== true) {
      if (readCh.samples !== 0) recordRead(this, sub);
      else readCh.seq++; // count only — no samples consumer (the Trace) wants detail
    }
  }
  return this.value as T;
}

function updateComputed<T>(node: ComputedNode<T>): boolean {
  if (node.flags & HasChildEffect) disposeChildDeps(node);
  clearDepsTail(node);
  node.flags = Mutable | RecursedCheck;
  const previous = setActiveSub(node);
  try {
    cycle++;
    const oldValue = node.value;
    const newValue = node.getter(oldValue);
    node.value = newValue;
    const changed = oldValue !== newValue;
    if (changed && computeCh.meters !== 0 && node.meta?.internal !== true) {
      computeCh.seq++;
    }
    return changed;
  } finally {
    activeSub = previous;
    node.flags &= ~RecursedCheck;
    purgeDeps(node);
  }
}

function updateState<T>(node: StateNode<T>): boolean {
  node.flags = Mutable;
  const oldValue = node.currentValue;
  node.currentValue = node.pendingValue;
  return oldValue !== node.currentValue;
}

function queueEffect(effect: EffectNode): void {
  let current: EffectNode | undefined = effect;
  let insertIndex = queuedLength;
  let firstInsertedIndex = insertIndex;
  while (current !== undefined) {
    queued[insertIndex++] = current;
    current.flags &= ~Watching;
    current = current.subs?.sub as EffectNode | undefined;
    if (current === undefined || !(current.flags & Watching)) break;
  }

  queuedLength = insertIndex;
  while (firstInsertedIndex < --insertIndex) {
    const left = queued[firstInsertedIndex];
    queued[firstInsertedIndex++] = queued[insertIndex];
    queued[insertIndex] = left;
  }
}

function runEffect(node: EffectNode): boolean {
  // A scope paused after this effect was already queued: leave it dirty for resume.
  if (node.scope !== undefined && scopePaused(node.scope)) return false;
  const flags = node.flags;
  if (
    flags & Dirty ||
    (flags & Pending && checkDirty(node.deps as Link, node))
  ) {
    if (flags & HasChildEffect) disposeChildDeps(node);
    if (node.cleanup) {
      runCleanup(node);
      if (!node.flags) return false;
    }
    clearDepsTail(node);
    node.flags = Watching | RecursedCheck;
    const previous = setActiveSub(node);
    try {
      cycle++;
      runDepth++;
      node.cleanup = asCleanup(node.fn());
    } catch (error) {
      reportEffectError(error, node);
    } finally {
      runDepth--;
      activeSub = previous;
      node.flags &= ~RecursedCheck;
      purgeDeps(node);
    }
    const meta = node.meta;
    if (meta) {
      meta.runs++;
      if (effectCh.meters !== 0 && meta.internal !== true) effectCh.seq++;
    }
    return meta === undefined || meta.internal !== true;
  } else if (node.deps !== undefined) {
    node.flags = Watching | (flags & HasChildEffect);
  }
  return false;
}

function flush(): void {
  const batchSize = queuedLength - notifyIndex;
  const start = batchSize > 0 && flushCh.meters !== 0 ? now() : 0;
  let appBatchSize = 0;
  try {
    while (notifyIndex < queuedLength) {
      const node = queued[notifyIndex];
      queued[notifyIndex++] = undefined;
      if (node && runEffect(node)) appBatchSize++;
    }
  } finally {
    while (notifyIndex < queuedLength) {
      const node = queued[notifyIndex];
      queued[notifyIndex++] = undefined;
      if (node) node.flags |= Watching | Recursed;
    }
    notifyIndex = 0;
    queuedLength = 0;
    if (appBatchSize > 0 && flushCh.meters !== 0) {
      recordChannel(
        flushCh,
        appBatchSize,
        start ? now() - start : 0,
        undefined,
        undefined,
        undefined,
      );
    }
  }
}

/* ----------------------------------------------------- deferred effect lane --------- */

// Default scheduler: requestIdleCallback (idle-first, with a maxStale timeout floor) where present,
// else a setTimeout floor. Both give the drain a budget so a forced (no-idle) run yields the frame.
function defaultDeferScheduler(
  drain: (hasBudget: () => boolean) => void,
  maxStale: number,
): () => void {
  const g = globalThis as unknown as {
    requestIdleCallback?: (
      cb: (d: {
        timeRemaining(): number;
        readonly didTimeout: boolean;
      }) => void,
      opts?: { timeout?: number },
    ) => number;
    cancelIdleCallback?: (id: number) => void;
  };
  if (typeof g.requestIdleCallback === "function") {
    const id = g.requestIdleCallback(
      (dl) => {
        const end = now() + DEFER_BUDGET_MS;
        // Idle: ride the remaining idle time. Forced (no idle): a fixed budget so we make bounded
        // progress instead of either starving or blocking the frame.
        drain(() => (dl.didTimeout ? now() < end : dl.timeRemaining() > 0));
      },
      { timeout: maxStale },
    );
    return () => g.cancelIdleCallback?.(id);
  }
  const id = setTimeout(() => {
    const end = now() + DEFER_BUDGET_MS;
    drain(() => now() < end);
  }, maxStale);
  return () => clearTimeout(id);
}

// Add a deferred effect to the lane (clearing Watching, as queueEffect does, so the system won't
// re-notify until it runs) and ensure a drain is scheduled to fire within its maxStale. Dedup the
// queue: flushScope can re-offer a still-dirty effect that's already queued (pause→resume mid-flight).
function deferEffect(node: EffectNode): void {
  node.flags &= ~Watching;
  if (!node.deferredQueued) {
    node.deferredQueued = true;
    deferredQueue.push(node);
  }
  scheduleDrain(node.maxStale);
}

function scheduleDrain(maxStale: number): void {
  // Compare absolute fire-by times: a pending drain that already fires in time stands; a tighter
  // floor (accounting for the time the pending drain has already waited) replaces it.
  const deadline = now() + maxStale;
  if (drainScheduled && drainDeadline <= deadline) return;
  drainCancel?.();
  drainScheduled = true;
  drainDeadline = deadline;
  drainCancel = deferScheduler(drainDeferred, maxStale);
}

// Run queued deferred effects while there's budget; reschedule any leftover. Each runs via runEffect
// (honouring the dirty check, re-tracking deps, skipping a now-paused scope), which coalesces every
// change since it was queued into one run at the latest value.
function drainDeferred(hasBudget: () => boolean): void {
  drainScheduled = false;
  drainDeadline = Number.POSITIVE_INFINITY;
  drainCancel = undefined;
  while (deferHead < deferredQueue.length && hasBudget()) {
    const node = deferredQueue[deferHead];
    deferredQueue[deferHead] = undefined; // release the slot as we pass the head
    deferHead++;
    if (node !== undefined) {
      node.deferredQueued = false;
      if (node.flags !== 0) runEffect(node); // flags 0 = stopped while queued
    }
  }
  if (deferHead >= deferredQueue.length) {
    deferredQueue.length = 0;
    deferHead = 0;
  } else {
    let soonest = Number.POSITIVE_INFINITY;
    for (let i = deferHead; i < deferredQueue.length; i++) {
      const n = deferredQueue[i];
      if (n !== undefined && n.maxStale < soonest) soonest = n.maxStale;
    }
    scheduleDrain(soonest);
  }
}

function stopEffect(this: EffectNode): void {
  const meta = this.meta;
  this.flags = 0; // drainDeferred skips flags===0; a still-queued deferred node is compacted next drain
  this.deferredQueued = false;
  const owner = this.scope;
  if (owner !== undefined && !owner.stopped) {
    // Swap-remove from scope.effects so a long-lived scope doesn't retain dead effects. Skipped while
    // the scope itself is stopping (stopScope iterates effects then clears the array wholesale).
    const effects = owner.effects;
    const i = this.scopeIndex;
    const last = effects.length - 1;
    if (i >= 0 && i <= last) {
      const moved = effects[last] as EffectNode;
      effects[i] = moved;
      moved.scopeIndex = i;
      effects.pop();
    }
    this.scope = undefined;
    this.scopeIndex = -1;
  }
  disposeDeps(this);
  const sub = this.subs;
  if (sub !== undefined) unlink(sub);
  if (this.cleanup) runCleanup(this);
  if (!meta || meta.disposed) return;
  meta.disposed = true;
  inspectRefs.delete(meta.id);
  if (disposeCh.meters !== 0 && meta.internal !== true) disposeCh.seq++;
}

// Only a returned function is a cleanup; any other return (e.g. an expression-body effect like
// `effect(() => count())`) is ignored rather than crashing on the next run.
function asCleanup(result: unknown): Stop | undefined {
  return typeof result === "function" ? (result as Stop) : undefined;
}

// An effect threw. With a handler installed, route it there (and let the flush continue with the
// other effects); without one, rethrow so it surfaces at whatever triggered the run.
function reportEffectError(error: unknown, node: EffectNode): void {
  if (onError === undefined) throw error;
  onError(error, node.meta ? inspectNode(node, node.meta) : undefined);
}

function runCleanup(node: EffectNode): void {
  const cleanup = node.cleanup;
  node.cleanup = undefined;
  const previous = setActiveSub(undefined);
  try {
    cleanup?.();
  } finally {
    activeSub = previous;
  }
}

function clearDepsTail(node: NodeBase): void {
  (node as { depsTail: Link | undefined }).depsTail = undefined;
}

function disposeChildDeps(sub: NodeBase): void {
  let dep = sub.depsTail;
  while (dep !== undefined) {
    const previous = dep.prevDep;
    const node = dep.dep;
    const kind = kindOf(node);
    if (kind === "effect" || kind === "watcher") unlink(dep, sub);
    dep = previous;
  }
}

function disposeDeps(sub: NodeBase): void {
  let dep = sub.depsTail;
  while (dep !== undefined) {
    const previous = dep.prevDep;
    unlink(dep, sub);
    dep = previous;
  }
}

function purgeDeps(sub: NodeBase): void {
  const depsTail = sub.depsTail;
  let dep = depsTail !== undefined ? depsTail.nextDep : sub.deps;
  while (dep !== undefined) {
    dep = unlink(dep, sub);
  }
}

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

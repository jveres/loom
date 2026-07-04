import * as channels from "./core/channels.js";
import {
  createReactiveSystem,
  type Link,
  type ReactiveNode,
} from "./core/graph.js";

// Snapshot the channel nodes + the sampler holder into module-local consts. Under transforms
// that implement ESM live bindings as per-access getters (vitest/vite SSR, some interop shims), a
// direct imported-binding read on the write path costs a getter call per write — measured 10x on
// write throughput. One read at init, plain locals forever after.
const { readCh, writeCh, computeCh, effectCh, flushCh, createCh, disposeCh } =
  channels;
const sampler = channels.sampler;

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
export type ErrorHandler = (error: unknown, node?: NodeInfo) => void;
// Wire an external producer to `set`; return a teardown run when the source goes unobserved.
export type SourceConnect<T> = (set: (value: T) => void) => Stop;
export type NodeKind = "state" | "computed" | "effect";

// Shared creation options for every primitive. `effect` adds `target` (see EffectOptions); the
// others (state/computed/fields/source/poll/scope) take NodeOptions directly.
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
   * under sustained load. Default 200ms. Best-effort, not hard real-time: an app task longer than
   * this delays everything.
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

// The identifying fields of a reactive node — the lean shape a `configure({ onError })` boundary gets
// to name the culprit, without pulling the full inspect surface (loom/observe) into the core import.
export interface NodeInfo {
  readonly id: number;
  readonly kind: NodeKind;
  readonly label: string;
}

// An effect body that returns a cleanup run before each re-run and on dispose (the shape the first
// effect() overload documents). Exported so callers can name the contract, not just satisfy it.
export type CleanupEffectFn = () => Stop;
type InternalEffectFn = EffectFn | CleanupEffectFn;

type FieldKey<T extends object> = Extract<keyof T, string>;

export type Fields<T extends object> = {
  readonly [K in FieldKey<T>]: State<T[K]>;
};

export type NodeBase = ReactiveNode & {
  deps?: Link | undefined;
  depsTail?: Link | undefined;
  meta?: InspectMeta | undefined;
  subs?: Link | undefined;
  subsTail?: Link | undefined;
};

export interface StateNode<T> extends NodeBase {
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

export interface ComputedNode<T> extends NodeBase {
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
  // Deferred lane: absolute fire-by time (now()+maxStale) stamped at enqueue. A leftover from a
  // budget-exhausted drain reschedules with the time REMAINING to this, not a fresh maxStale — so
  // sustained load can't stretch staleness past the documented floor.
  deferDeadline: number;
}

// A non-effect resource owned by a scope (a poll timer, a lazy source's connection): suspended
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
  // This scope's slot in parent.children — so stopping a child swap-removes in O(1) instead of an
  // indexOf scan + splice (O(siblings) per stop, quadratic across a churned sibling set).
  childIndex: number;
  // Default node options (internal/label) applied to everything created in the scope,
  // already merged with any ancestor scope's defaults.
  readonly options: NodeOptions | undefined;
  paused: boolean;
  // Number of paused scopes in this node's ancestor chain (including itself). scopePaused() is then
  // an O(1) `> 0` test instead of walking to the root on every notify; maintained on pause/resume.
  pausedCount: number;
  stopped: boolean;
}

export interface InspectMeta {
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
const deferTimeout = 200; // default maxStale (ms) for a deferred effect that doesn't set its own
let deferScheduler: DeferScheduler = defaultDeferScheduler;
const DEFER_BUDGET_MS = 5; // a forced (no-idle) drain runs at most ~this long, then yields
let liveScopes = 0; // non-internal scopes alive now (for inspectResources; off the reactive path)
let onError: ErrorHandler | undefined;
// The inspection subsystem's seam. core/inspect.ts installs these when it is loaded (any import
// of loom/observe); until then every hook site is an undefined-check no-op and none of the
// registry/metadata machinery is even bundled. `inspectRequested` buffers a configure({ inspect })
// made before the module loaded (e.g. dynamic import ordering).
export interface InspectHooks {
  register(
    node: NodeBase,
    kind: NodeKind,
    options: NodeOptions | EffectOptions | undefined,
  ): InspectMeta | undefined;
  unregister(id: number): void;
  setEnabled(on: boolean): void;
  nextGroup(): number;
  /** Dev diagnostics: a tracked run wrote `node` — warn if the writer also subscribes to it. */
  trackedWrite?(node: NodeBase, writer: NodeBase): void;
}
let inspectHooks: InspectHooks | undefined;
let inspectRequested = false;
export function installInspectHooks(hooks: InspectHooks): void {
  inspectHooks = hooks;
  if (inspectRequested) hooks.setEnabled(true);
}
// Read-only seams for core/inspect.ts (not part of the public barrel).
export function ambientOptions(): NodeOptions | undefined {
  return activeScope?.options;
}
export function liveScopeCount(): number {
  return liveScopes;
}

// Each public accessor (a state source, computed read, or effect stop) carries a hidden handle to
// its node via this private symbol — so trigger() resolves a node in O(1) without the
// per-create WeakMap registration create-heavy workloads would otherwise pay even with inspection off.
const NODE = Symbol("loom.node");
type NodeHandle = { [NODE]?: NodeBase | undefined };
function tagNode(accessor: object, node: NodeBase): void {
  // A plain store, not defineProperty — ~5x cheaper, and this runs on every create. The key is a
  // private unexported symbol, so enumerability is invisible outside getOwnPropertySymbols.
  (accessor as NodeHandle)[NODE] = node;
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
      enqueueEffect(effectNode);
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
  const meta = inspectHooks?.register(node, "state", options);
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
  const meta = inspectHooks?.register(node, "state", options);
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
  const meta = inspectHooks?.register(node, "computed", options);
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
  const meta = inspectHooks?.register(node, "effect", options);
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
    childIndex: activeScope !== undefined ? activeScope.children.length : -1,
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

// Register a resource with the ambient scope (pause/resume/stop ride the scope's lifecycle).
// Exported for the sibling core modules (meter) — not part of the public barrel.
export function registerScopeResource(resource: ScopeResource): void {
  activeScope?.resources.push(resource);
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
  // Swap-remove via childIndex (mirroring stopEffect's scope.effects handling) keeps each stop O(1).
  if (parent !== undefined && !parent.stopped) {
    swapRemove(parent.children, node.childIndex, (moved, i) => {
      moved.childIndex = i;
    });
    node.childIndex = -1;
  }
}

// O(1) list removal: move the last element into slot `i` (telling it its new index via `reindex`)
// and pop. Used by the scope-detach paths so a churned scope/effect set never pays an indexOf scan.
function swapRemove<T>(
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
    if (effectNode.flags & (Dirty | Pending)) enqueueEffect(effectNode);
  }
  for (const child of node.children) flushScope(child);
}

// Route an effect to its lane: deferred re-runs go off the critical path, the rest queue for the
// synchronous flush.
function enqueueEffect(node: EffectNode): void {
  if (node.deferred) deferEffect(node);
  else queueEffect(node);
}

// A poll handle is a callable reactive read (like `state`/`computed`/`source`) that also carries a
// `stop` to clear its interval — so `p()` reads and `p.stop()` tears down.
export type Polled<T> = Read<T> & { readonly stop: Stop };

/**
 * The **pull** bridge for external data: re-samples `sample()` every `ms` milliseconds into a
 * value-deduped signal, for values you can read imperatively at any time (clocks, `performance`
 * counters, media state). Bindings reading the poll (`p()`) re-run only when the sampled value
 * actually changed. Call `.stop()` to clear the timer; created inside a scope, the timer suspends
 * and resumes with it. The backing state honours `options` (e.g. `{ internal: true }`).
 * Push-style producers want {@link source}; async request/response wants `resource` (loom/async).
 */
export function poll<T>(
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
  return Object.assign((): T => cell(), { stop: clear });
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

/**
 * Functional read-modify-write: `update(count, n => n + 1)`. The read is **untracked** — inside an
 * effect, updating a cell does not subscribe the effect to it, so the classic `v(v() + 1)`
 * self-dependency foot-gun can't happen through this helper.
 */
export function update<T>(source: State<T>, fn: (value: T) => T): void {
  source(fn(untrack(() => source())));
}

/**
 * Watch an explicit source and react to its **changes**: `read` is tracked (its dependencies drive
 * re-evaluation), `onChange(value, previous)` runs untracked and is skipped on the initial
 * evaluation and whenever the derived value is unchanged. The write-back-binding shape without the
 * `let first = true` boilerplate — and because `onChange` is untracked, writes inside it can't
 * create accidental self-dependencies.
 */
export function watch<T>(
  read: Read<T>,
  onChange: (value: T, previous: T) => void,
  options?: EffectOptions,
): Stop {
  let first = true;
  let previous!: T;
  return effect(() => {
    const value = read();
    if (first) {
      first = false;
      previous = value;
      return;
    }
    if (value === previous) return;
    const prior = previous;
    previous = value;
    untrack(() => onChange(value, prior));
  }, options);
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
  const group = inspectHooks !== undefined ? inspectHooks.nextGroup() : 0;
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

// Record a read on the read channel — the cell, the reader (the running effect/computed) that
// consumed it, and when. Callers gate on `readCh.samples !== 0`; `meta === undefined`
// (inspection off for this cell) just counts.
function recordRead(node: NodeBase, sub: NodeBase): void {
  const meta = node.meta;
  if (meta !== undefined)
    sampler.record(
      readCh,
      meta.id,
      sub.meta?.id,
      Date.now(),
      undefined,
      undefined,
    );
  else readCh.seq++;
}

function trackRead(node: NodeBase, sub: NodeBase): void {
  link(node, sub, cycle);
  if (readCh.meters !== 0 && node.meta?.internal !== true) {
    if (readCh.samples !== 0) recordRead(node, sub);
    else readCh.seq++;
  }
}

/**
 * Configure the runtime.
 *
 * `inspect` toggles the always-off-by-default inspection layer: while it is off, node creation
 * allocates no metadata and `inspect()`/`inspectResources()` and the inspector see
 * nothing — true zero cost. Turn it on (typically once at startup, before creating the nodes you
 * want visible) when you need tooling; nodes created while it was off stay invisible.
 *
 * `onError` installs a global effect error boundary. Without one, an effect that throws propagates
 * to whatever triggered the run (a `state` write or `batch`) and aborts the rest of that flush.
 * With one, the throw is routed to the handler and the flush continues with the other effects. Pass
 * `undefined` to remove it.
 */
export interface ConfigureOptions {
  readonly inspect?: boolean;
  readonly onError?: ErrorHandler | undefined;
  /** Override the deferred-effect scheduler (e.g. synchronous in tests, no-op on the server). */
  readonly deferScheduler?: DeferScheduler;
}

export function configure(options: ConfigureOptions): void {
  if (options.inspect !== undefined) {
    inspectRequested = options.inspect;
    inspectHooks?.setEnabled(options.inspect);
  }
  if ("onError" in options) onError = options.onError;
  if (options.deferScheduler !== undefined)
    deferScheduler = options.deferScheduler;
}

// Merge two option sets, letting the second (more specific) win; either may be undefined. The union
// return (not a generic) preserves EffectOptions' `target` through the merge, which the inspect registrar
// narrows with an `in` guard — the old `<T> => T | NodeOptions` signature widened that away.
export function mergeOptions(
  defaults: NodeOptions | undefined,
  own: NodeOptions | EffectOptions | undefined,
): NodeOptions | EffectOptions | undefined {
  if (defaults === undefined) return own;
  if (own === undefined) return defaults;
  return { ...defaults, ...own };
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

function kindOf(node: ReactiveNode): NodeKind | "watcher" {
  if ("getter" in node) return "computed";
  if ("currentValue" in node) return "state";
  if ("fn" in node) return "effect";
  return "watcher";
}

// Resolved once at module load — this sits on the deferred-lane scheduling paths, so no per-call
// typeof-global check. Never called during module init, so the const's position is safe.
const now: () => number =
  typeof performance === "undefined" ? Date.now : () => performance.now();

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
    deferDeadline: 0,
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
      // Dev self-dependency warning (inspection on — `meta` exists only then, so production
      // writes pay a single undefined compare): an effect writing a cell it subscribes to
      // re-triggers itself, the v(v()+1) phantom-write class of bug.
      if (this.meta !== undefined && activeSub !== undefined)
        inspectHooks?.trackedWrite?.(this, activeSub);
      // Idle path unchanged (the `meters !== 0` short-circuit gates everything). When metered with
      // inspection on, record id + prev→next for the samples view; otherwise just count.
      if (writeCh.meters !== 0 && this.meta?.internal !== true) {
        const meta = this.meta;
        if (meta !== undefined && writeCh.samples !== 0)
          sampler.record(
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
  if (sub !== undefined) trackRead(this, sub);
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
    trackRead(this, sub);
    if (first && !this.active) connectSource(this);
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
  if (sub !== undefined) trackRead(this, sub);
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
      sampler.record(
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
// re-notify until it runs) and ensure a drain is scheduled to fire by its deadline. Dedup the
// queue: flushScope can re-offer a still-dirty effect that's already queued (pause→resume
// mid-flight) — an already-queued effect's deadline is covered by the drain scheduled when it was
// enqueued (or by the end-of-drain reschedule), so the re-offer path stays clock-free.
function deferEffect(node: EffectNode): void {
  node.flags &= ~Watching;
  if (node.deferredQueued) return;
  node.deferredQueued = true;
  deferredQueue.push(node);
  const deadline = now() + node.maxStale;
  node.deferDeadline = deadline;
  scheduleDrain(deadline, node.maxStale);
}

// Compare absolute fire-by times: a pending drain that already fires in time stands; a tighter
// deadline replaces it. `timeout` is the relative floor handed to the scheduler.
function scheduleDrain(deadline: number, timeout: number): void {
  if (drainScheduled && drainDeadline <= deadline) return;
  drainCancel?.();
  drainScheduled = true;
  drainDeadline = deadline;
  drainCancel = deferScheduler(drainDeferred, timeout);
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
      if (node.flags !== 0) {
        // flags 0 = stopped while queued
        try {
          runEffect(node);
        } catch (error) {
          // Only reachable with no onError boundary (reportEffectError rethrows). Aborting the
          // drain here would wedge every effect queued behind this one — the tail reschedule
          // never runs and their deferredQueued flags block re-enqueueing forever. Re-throw on a
          // fresh task instead: window.onerror still fires, the drain keeps going.
          setTimeout(() => {
            throw error;
          }, 0);
        }
      }
    }
  }
  if (deferHead >= deferredQueue.length) {
    deferredQueue.length = 0;
    deferHead = 0;
  } else {
    // Leftovers keep their enqueue-time deadlines: reschedule with the time remaining to the
    // soonest one, not a fresh maxStale.
    let soonest = Number.POSITIVE_INFINITY;
    for (let i = deferHead; i < deferredQueue.length; i++) {
      const n = deferredQueue[i];
      if (n !== undefined && n.deferDeadline < soonest)
        soonest = n.deferDeadline;
    }
    scheduleDrain(soonest, Math.max(0, soonest - now()));
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
    swapRemove(owner.effects, this.scopeIndex, (moved, i) => {
      moved.scopeIndex = i;
    });
    this.scope = undefined;
    this.scopeIndex = -1;
  }
  disposeDeps(this);
  const sub = this.subs;
  if (sub !== undefined) unlink(sub);
  if (this.cleanup) runCleanup(this);
  if (!meta || meta.disposed) return;
  meta.disposed = true;
  inspectHooks?.unregister(meta.id);
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
  const meta = node.meta;
  // The boundary gets the lean NodeInfo (id/kind/label); the full InspectNode lives in loom/observe.
  onError(
    error,
    meta ? { id: meta.id, kind: meta.kind, label: meta.label } : undefined,
  );
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

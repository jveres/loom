import {
  createReactiveSystem,
  type Link,
  type ReactiveNode,
} from "./core/graph.js";

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
// others (state/computed/props/source/poll/scope) take NodeOptions directly.
export interface NodeOptions {
  readonly internal?: boolean;
  readonly label?: string;
}

export interface EffectOptions extends NodeOptions {
  readonly target?: object;
  /**
   * Run this effect in the deferred lane (requires `import "loom/defer"` once at startup):
   * re-runs happen off the critical path (idle-first,
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
type InternalEffectFn = () => unknown;

// `() => void` deliberately accepts value-returning callbacks in TypeScript, including async
// functions. Keep that convenient effect API for ordinary expression bodies, but exclude promises
// from direct effect()/scope() calls so their tracked/owned work cannot silently escape an await.
type SyncResult<T> = T extends PromiseLike<unknown> ? never : T;

type PropKey<T extends object> = Extract<keyof T, string>;

export type Props<T extends object> = {
  readonly [K in PropKey<T>]: State<T[K]>;
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

// A lazy external source: a state-shaped value signal that runs `connect` when it gains its first
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
  scope?: ScopeNode | undefined;
  scopeIndex?: number | undefined;
  // Combined direct + owning-scope pause depth. Keeping the effective value on the effect makes
  // notify/run a single field check; scope pause/resume pays the rare traversal instead.
  pausedCount?: number | undefined;
  directPausedCount?: number | undefined;
  deferred?: boolean | undefined; // route re-runs to the deferred lane instead of the synchronous flush
  deferredQueued?: boolean; // currently in deferredQueue (O(1) dedup, replaces an includes() scan)
  maxStale?: number; // deferred lane: guaranteed-refresh floor in ms
  // Deferred lane: absolute fire-by time (now()+maxStale) stamped at enqueue. A leftover from a
  // budget-exhausted drain reschedules with the time REMAINING to this, not a fresh maxStale — so
  // sustained load can't stretch staleness past the documented floor.
  deferDeadline?: number;
}

// A non-effect resource owned by a scope (a poll timer, a lazy source's connection): suspended
// and resumed with the scope's effects, and torn down when it stops.
interface ScopeResource {
  pause(): void;
  resume(): void;
  stop(): void;
}

interface OwnedScopeResource extends ScopeResource {
  owner: ScopeNode | undefined;
  ownerIndex: number;
  stopped: boolean;
}

// An ownership group for effects, resources, and nested scopes. Effects/resources created while a
// scope is active register here; the scope can stop them, or pause/resume them collectively. An
// effect runs (and a resource stays live) only while no scope in its parent chain is paused.
interface ScopeNode {
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

export interface InspectMeta {
  readonly id: number;
  readonly internal: boolean;
  readonly kind: NodeKind;
  readonly label: string;
  readonly target: WeakRef<object> | undefined;
  disposed: boolean;
  runs: number;
  group?: number; // props() group id (set by props() when inspection is on)
  key?: string; // property key within that group
}

// The deferred-lane seam. loom.ts routes a deferred effect's re-run through `lane.enqueue`; the
// implementation (queue, drain, scheduler) lives in ./core/defer.ts and installs itself when that
// module loads — apps that never use { defer: true } bundle none of it. A property on a stable
// const object (not a live `let` binding), same reasoning as the channels sampler: one property
// load per call in every module system. `scheduler` carries the configure({ deferScheduler })
// override to the lane.
export const deferredLane: {
  enqueue: ((node: EffectNode) => void) | undefined;
  scheduler: DeferScheduler | undefined;
} = { enqueue: undefined, scheduler: undefined };

let cycle = 0;
let runDepth = 0;
let batchDepth = 0;
let notifyIndex = 0;
let queuedLength = 0;
let flushing = false;
let activeSub: NodeBase | undefined;
let activeScope: ScopeNode | undefined;
const queued: Array<EffectNode | undefined> = [];
const deferTimeout = 200; // default maxStale (ms) for a deferred effect that doesn't set its own
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

/** @internal Optional observability hooks installed by loom/observe. */
export interface RuntimeHooks {
  create(meta: InspectMeta | undefined): void;
  read(node: NodeBase, sub: NodeBase): void;
  write(
    node: StateNode<unknown>,
    previous: unknown,
    next: unknown,
    writer: NodeBase | undefined,
  ): void;
  compute(node: ComputedNode<unknown>): void;
  effect(node: EffectNode): void;
  beginFlush(): number | undefined;
  endFlush(appBatchSize: number, startedAt: number): void;
  dispose(node: EffectNode): void;
}
let runtimeHooks: RuntimeHooks | undefined;

export function installRuntimeHooks(hooks: RuntimeHooks): void {
  runtimeHooks = hooks;
}
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

// Inspection-enabled public accessors carry a hidden reverse handle to their node. Production
// accessors avoid this extra property; trigger() discovers dependencies through a temporary watcher.
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
      if ("getter" in node)
        return updateComputed(node as ComputedNode<unknown>);
      if ("currentValue" in node)
        return updateState(node as StateNode<unknown>);
      node.flags = Mutable;
      return true;
    },
    notify(node) {
      const effectNode = node as EffectNode;
      // Paused effects stay dirty and catch up on resume.
      if (effectNode.pausedCount) return;
      enqueueEffect(effectNode);
    },
    unwatched(node) {
      if ("getter" in node) {
        if (node.depsTail !== undefined) {
          node.flags = Mutable | Dirty;
          disposeDeps(node as ComputedNode<unknown>);
        }
      } else if ("currentValue" in node) {
        if ("connect" in node) disconnectSource(node as SourceNode<unknown>);
      } else if ("fn" in node) {
        stopEffect.call(node as EffectNode);
      } else {
        disposeDeps(node as NodeBase);
      }
    },
  });

export function state<T>(initial: T, options?: NodeOptions): State<T> {
  const node = createStateNode(initial);
  const source = stateOper.bind(node) as State<T>;
  const meta = inspectHooks?.register(node, "state", options);
  // Only inspected states need the reverse accessor used by the editor. Keep ordinary state nodes
  // on the smaller hot shape.
  if (meta !== undefined) node.source = source as State<unknown>;
  // The production accessor carries no reverse node handle. Inspection needs
  // one for props grouping/editor writes; ordinary trigger() pays its rare
  // discovery cost instead of taxing every state creation.
  if (meta !== undefined) tagNode(source, node);
  runtimeHooks?.create(meta);
  return source;
}

/**
 * A derived writable: reads through `read` (tracked — bindings and computeds subscribe through
 * whatever it reads), writes through `write`. The two-way UI-vocabulary adapter (a picker showing
 * a label over a domain signal) as a first-class helper. Arity decides direction — rest-args, so
 * writing `undefined` through a `State<T | undefined>` is a WRITE, exactly like `state()` itself.
 */
export function writable<T>(read: () => T, write: (next: T) => void): State<T> {
  return ((...args: [] | [T]) => {
    if (args.length === 0) return read();
    write(args[0] as T);
    return undefined;
  }) as State<T>;
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
  if (meta !== undefined) tagNode(read, node);
  // When created inside a scope, pausing the scope disconnects the producer even though paused
  // subscribers stay linked; resuming reconnects it if anything is still observing.
  const erased = node as SourceNode<unknown>;
  if (activeScope !== undefined) {
    registerScopeResource({
      pause: () => disconnectSource(erased),
      resume: () => reconnectSource(erased),
      stop: () => disconnectSource(erased),
    });
  }
  runtimeHooks?.create(meta);
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
  if (meta !== undefined) tagNode(read, node);
  runtimeHooks?.create(meta);
  return read;
}

export function effect<Result>(
  fn: () => SyncResult<Result>,
  options?: EffectOptions,
): Stop;
export function effect(fn: InternalEffectFn, options?: EffectOptions): Stop {
  const node = startEffect(fn, options);
  const stop = stopEffect.bind(node);
  if (node.meta !== undefined) tagNode(stop, node);
  return stop;
}

function startEffect(
  fn: InternalEffectFn,
  options: EffectOptions | undefined,
): EffectNode {
  return startEffectNode(createEffectNode(fn), options);
}

function startEffectNode(
  node: EffectNode,
  options: EffectOptions | undefined,
): EffectNode {
  if (activeScope !== undefined) {
    node.scope = activeScope;
    node.scopeIndex = activeScope.effects.length;
    node.pausedCount = activeScope.pausedCount;
    activeScope.effects.push(node);
  }
  if (options?.defer === true) {
    if (deferredLane.enqueue === undefined) {
      throw new Error(
        'effect({ defer: true }) requires the deferred lane — import "loom/defer" once at startup.',
      );
    }
    node.deferred = true;
    node.deferredQueued = false;
    node.maxStale = options.maxStale ?? deferTimeout;
    node.deferDeadline = 0;
  }
  const meta = inspectHooks?.register(node, "effect", options);
  runtimeHooks?.create(meta);
  const previous = setActiveSub(node);
  if (previous !== undefined) {
    link(node, previous, 0);
    previous.flags |= HasChildEffect;
  }
  let caught: { error: unknown } | undefined;
  let result: unknown;
  try {
    runDepth++;
    result = node.fn();
  } catch (error) {
    caught = { error };
  } finally {
    runDepth--;
    restoreActiveSub(previous);
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
  // Most effects return undefined. Keep that overwhelmingly common path to one branch instead of
  // paying promise/cleanup classification helpers after every run.
  if (result !== undefined) {
    if (isPromiseLike(result)) {
      stopEffect.call(node);
      ignorePromiseRejection(result);
      throw new TypeError("effect() callbacks must be synchronous.");
    }
    node.cleanup = typeof result === "function" ? (result as Stop) : undefined;
  }
  if (meta) meta.runs++;
  runtimeHooks?.effect(node);
  return node;
}

/** @internal Create a node-owned DOM effect without linking it to the currently running effect. */
export function domEffect(
  fn: InternalEffectFn,
  label: string,
  target: Node,
  options?: EffectOptions,
): EffectNode {
  // The default DOM binding path needs options only when inspection is installed. Avoid allocating
  // one options object per binding in ordinary applications while retaining labels/targets whenever
  // the inspector can consume them. Explicit options always win over the DOM defaults.
  const resolved =
    options !== undefined
      ? { label, target, ...options }
      : inspectHooks !== undefined
        ? { label, target }
        : undefined;
  const previous = setActiveSub(undefined);
  try {
    return startEffect(fn, resolved);
  } finally {
    restoreActiveSub(previous);
  }
}

/** @internal Start a plain node-owned DOM sink on the minimal production path. */
export function domBindingEffect(
  fn: EffectFn,
  label: string,
  target: Node,
): EffectNode {
  if (
    activeScope !== undefined ||
    inspectHooks !== undefined ||
    runtimeHooks !== undefined ||
    onError !== undefined
  ) {
    return domEffect(fn, label, target, undefined);
  }

  const node = createEffectNode(fn);
  const previous = setActiveSub(node);
  try {
    runDepth++;
    node.fn();
  } catch (error) {
    stopEffect.call(node);
    throw error;
  } finally {
    runDepth--;
    restoreActiveSub(previous);
    node.flags &= ~RecursedCheck;
  }
  return node;
}

/** @internal Stop a raw owner-bound DOM effect. */
export function stopEffectNode(node: EffectNode): void {
  stopEffect.call(node);
}

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    if (--batchDepth === 0 && !flushing && notifyIndex < queuedLength) flush();
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
export function scope<Result>(
  fn: () => SyncResult<Result>,
  options?: NodeOptions,
): Scope {
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
    const result = fn();
    if (isPromiseLike(result)) {
      ignorePromiseRejection(result);
      throw new TypeError("scope() callbacks must be synchronous.");
    }
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

// Non-barrel seam for the deferred lane (./core/defer.ts): hands the lane plain function
// references ONCE at install. Under live-binding transforms an imported binding is a getter per
// access (the measured 10x write lesson); returning the internals lets the lane capture them into
// module-local consts and pay a plain call forever after.
export function installDeferredLane(enqueue: (node: EffectNode) => void): {
  runEffect: (node: EffectNode) => void;
  clearWatching: (node: EffectNode) => void;
} {
  deferredLane.enqueue = enqueue;
  return {
    runEffect,
    clearWatching: (node) => {
      node.flags &= ~Watching;
    },
  };
}
export type { EffectNode };

/** @internal Suspend one raw owner-bound effect. */
export function pauseEffectNode(node: EffectNode): boolean {
  if (node.flags === 0) return false;
  node.directPausedCount = (node.directPausedCount ?? 0) + 1;
  node.pausedCount = (node.pausedCount ?? 0) + 1;
  return true;
}

/** @internal Resume one raw owner-bound effect. */
export function resumeEffectNode(node: EffectNode): boolean {
  if (node.flags === 0) return false;
  const directPausedCount = node.directPausedCount ?? 0;
  if (directPausedCount > 0) {
    node.directPausedCount = directPausedCount - 1;
    node.pausedCount = (node.pausedCount ?? 0) - 1;
  }
  if (!node.pausedCount && (node.flags & (Dirty | Pending)) !== 0) {
    enqueueEffect(node);
    if (
      batchDepth === 0 &&
      runDepth === 0 &&
      !flushing &&
      notifyIndex < queuedLength
    ) {
      flush();
    }
  }
  return true;
}

// Register a resource with the ambient scope (pause/resume/stop ride the scope's lifecycle) and
// return its terminal stop. Manual stop swap-removes the registration in O(1), so a later scope
// resume cannot resurrect the resource and a long-lived scope cannot retain it. Exported for the
// sibling core modules (meter) — not part of the public barrel.
export function registerScopeResource(resource: ScopeResource): Stop {
  const owner = activeScope;
  const owned = resource as OwnedScopeResource;
  owned.owner = owner;
  owned.ownerIndex = owner?.resources.length ?? -1;
  owned.stopped = false;
  owner?.resources.push(owned);
  return () => stopScopeResource(owned);
}

// Add `delta` to the paused-ancestor count of `node` and its whole subtree (every descendant gains
// or loses this scope as a paused ancestor). Walks all children, including independently-paused ones.
function bumpPausedCount(node: ScopeNode, delta: number): void {
  node.pausedCount += delta;
  for (const effectNode of node.effects) {
    effectNode.pausedCount = (effectNode.pausedCount ?? 0) + delta;
  }
  for (const child of node.children) bumpPausedCount(child, delta);
}

function stopScope(node: ScopeNode): void {
  if (node.stopped) return;
  node.stopped = true;
  if (node.options?.internal !== true) liveScopes--;
  let caught: [unknown] | undefined;
  for (const child of node.children) {
    try {
      stopScope(child);
    } catch (error) {
      caught ??= [error];
    }
  }
  node.children.length = 0;
  for (const effectNode of node.effects) {
    if (effectNode.flags === 0) continue;
    try {
      stopEffect.call(effectNode);
    } catch (error) {
      caught ??= [error];
    }
  }
  node.effects.length = 0;
  for (const resource of node.resources) {
    try {
      stopScopeResource(resource);
    } catch (error) {
      caught ??= [error];
    }
  }
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
  if (caught !== undefined) throw caught[0];
}

function stopScopeResource(resource: OwnedScopeResource): void {
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
  if (node.paused || node.stopped) return;
  // Suspend resources only when this newly pauses the chain (an ancestor pause already did so).
  const newlySuspends = node.pausedCount === 0;
  node.paused = true;
  bumpPausedCount(node, 1);
  if (newlySuspends) walkResources(node, (r) => r.pause());
}

function resumeScope(node: ScopeNode): void {
  if (!node.paused || node.stopped) return;
  node.paused = false;
  bumpPausedCount(node, -1);
  // If an ancestor is still paused, the chain stays suspended — do nothing yet.
  if (node.pausedCount > 0) return;
  let caught: [unknown] | undefined;
  try {
    walkResources(node, (r) => r.resume());
  } catch (error) {
    caught = [error];
  }
  // A broken resource must not strand dirty effects after the scope itself became active again.
  try {
    flushScope(node);
    // If we're resuming from inside an effect run (e.g. a tab switch), the re-queued effects ride
    // the in-progress flush; only drive a fresh flush when at the top level.
    if (
      batchDepth === 0 &&
      runDepth === 0 &&
      !flushing &&
      notifyIndex < queuedLength
    )
      flush();
  } catch (error) {
    caught ??= [error];
  }
  if (caught !== undefined) throw caught[0];
}

// Snapshot every resource before invoking user hooks: a hook may stop itself, a sibling resource,
// or a child scope, all of which swap-remove live ownership arrays. Complete every still-live hook
// in the snapshot before surfacing the first failure.
function walkResources(
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

// Queue every dirty effect in the subtree whose chain is now unpaused; independently-paused
// children stay deferred. The caller flushes the queued effects.
function flushScope(node: ScopeNode): void {
  if (node.pausedCount > 0) return;
  // A synchronous deferred scheduler can stop/swap-remove an effect while it is enqueued. Iterate
  // a stable snapshot so that mutation cannot skip the sibling moved into its slot.
  for (const effectNode of node.effects.slice()) {
    if (effectNode.flags === 0) continue;
    if (effectNode.pausedCount) continue;
    if ((effectNode.flags & (Dirty | Pending)) !== 0) enqueueEffect(effectNode);
  }
  for (const child of node.children) flushScope(child);
}

// Route an effect to its lane: deferred re-runs go off the critical path, the rest queue for the
// synchronous flush.
function enqueueEffect(node: EffectNode): void {
  if (node.deferred) (deferredLane.enqueue as (node: EffectNode) => void)(node);
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
  const signal = state(sample(), options);
  let timer: ReturnType<typeof setInterval> | undefined;
  const start = (): void => {
    timer = setInterval(() => signal(sample()), ms);
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
  const stop = registerScopeResource({
    pause: clear,
    resume: () => {
      if (timer === undefined) {
        signal(sample());
        start();
      }
    },
    stop: clear,
  });
  return Object.assign((): T => signal(), { stop });
}

export function trigger<T>(source: State<T>): void {
  // Discover every dependency read by the public accessor. This intentionally uses the same path
  // with and without inspection, and also supports derived writable/read adapters that touch more
  // than one underlying signal.
  const sub = createWatcherNode();
  const previous = setActiveSub(sub);
  try {
    source();
  } finally {
    restoreActiveSub(previous);
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
    if (batchDepth === 0 && !flushing && notifyIndex < queuedLength) flush();
  }
}

export function untrack<T>(fn: () => T): T {
  const previous = activeSub;
  if (previous === undefined) return fn();
  activeSub = undefined;
  try {
    return fn();
  } finally {
    restoreActiveSub(previous);
  }
}

/**
 * Functional read-modify-write: `update(count, n => n + 1)`. The read is **untracked** — inside an
 * effect, updating a signal does not subscribe the effect to it, so the classic `v(v() + 1)`
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

export function props<T extends object>(
  initial: T,
  options?: NodeOptions,
): Props<T> {
  if (!isPlainObject(initial)) {
    throw new TypeError("props() expects a plain object.");
  }
  // A null-prototype result makes every string key data, including `__proto__`, `constructor`, and
  // `toString`; assigning those onto `{}` would mutate/inherit from Object.prototype instead.
  const out = Object.create(null) as {
    [K in PropKey<T>]: State<T[K]>;
  };
  const keys = Object.keys(initial) as Array<PropKey<T>>;
  // One group id per call so the inspector can re-nest the signals under a single parent.
  const group = inspectHooks !== undefined ? inspectHooks.nextGroup() : 0;
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index] as PropKey<T>;
    const signal = state(initial[key], propOptions(options, key));
    if (group !== 0) {
      const meta = nodeOf(signal as object)?.meta;
      if (meta) {
        meta.group = group;
        meta.key = key;
      }
    }
    out[key] = signal;
  }
  return out;
}

function trackRead(node: NodeBase, sub: NodeBase): void {
  link(node, sub, cycle);
  runtimeHooks?.read(node, sub);
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
  readonly deferScheduler?: DeferScheduler | undefined;
}

export function configure(options: ConfigureOptions): ConfigureOptions {
  const previous: ConfigureOptions = {
    inspect: inspectRequested,
    onError,
    deferScheduler: deferredLane.scheduler,
  };
  if (options.inspect !== undefined) {
    inspectRequested = options.inspect;
    inspectHooks?.setEnabled(options.inspect);
  }
  if ("onError" in options) onError = options.onError;
  if ("deferScheduler" in options)
    deferredLane.scheduler = options.deferScheduler;
  return previous;
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

function propOptions(
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

function createStateNode<T>(initial: T): StateNode<T> {
  return nodeShape<StateNode<T>>({
    currentValue: initial,
    pendingValue: initial,
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
    connect,
    disconnect: undefined,
    active: false,
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

function restoreActiveSub(previous: NodeBase | undefined): void {
  activeSub = previous?.flags ? previous : undefined;
}

function stateOper<T>(this: StateNode<T>, ...value: [] | [T]): T | undefined {
  if (value.length) {
    const next = value[0] as T;
    const previous = this.pendingValue;
    if (previous !== next) {
      this.pendingValue = next;
      const writer = activeSub;
      if (this.meta !== undefined && writer !== undefined) {
        inspectHooks?.trackedWrite?.(this, writer);
      }
      runtimeHooks?.write(this as StateNode<unknown>, previous, next, writer);
      // The first pending write already dirtied the complete downstream graph. Until a read
      // commits this state, later writes only replace its pending value and need no second walk.
      if (this.flags & Dirty) return undefined;
      this.flags = Mutable | Dirty;
      const subs = this.subs;
      if (subs !== undefined) {
        propagate(subs, runDepth > 0);
        if (batchDepth === 0 && !flushing && notifyIndex < queuedLength)
          flush();
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
    if (first && !this.active) {
      connectSource(this);
      // A connect() that set() a value did so in the middle of this very read —
      // the notification it propagates targets the reader currently running,
      // which swallows it in its run-end flag reset. Apply the update here so
      // the connecting reader returns the fresh value (a connect that resyncs
      // current state on attach would otherwise stay stale until the next
      // external set()).
      if (this.flags & Dirty && updateState(this)) {
        const subs = this.subs;
        if (subs !== undefined) shallowPropagate(subs);
      }
    }
  }
  return this.currentValue;
}

function sourceSet<T>(node: SourceNode<T>, value: T): void {
  if (node.pendingValue === value) return;
  node.pendingValue = value;
  if (node.flags & Dirty) return;
  node.flags = Mutable | Dirty;
  const subs = node.subs;
  if (subs !== undefined) {
    propagate(subs, runDepth > 0);
    if (batchDepth === 0 && !flushing && notifyIndex < queuedLength) flush();
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
      runtimeHooks?.compute(this as ComputedNode<unknown>);
    } finally {
      restoreActiveSub(previous);
      this.flags &= ~RecursedCheck;
    }
  }

  const sub = activeSub;
  if (sub !== undefined) trackRead(this, sub);
  return this.value as T;
}

function updateComputed<T>(node: ComputedNode<T>): boolean {
  if (node.flags & HasChildEffect) disposeChildDeps(node);
  node.depsTail = undefined;
  node.flags = Mutable | RecursedCheck;
  const previous = setActiveSub(node);
  try {
    cycle++;
    const oldValue = node.value;
    const newValue = node.getter(oldValue);
    node.value = newValue;
    const changed = oldValue !== newValue;
    if (changed) runtimeHooks?.compute(node as ComputedNode<unknown>);
    return changed;
  } finally {
    restoreActiveSub(previous);
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
  // Paused after this effect was already queued: leave it dirty for resume.
  if (node.pausedCount) return false;
  const flags = node.flags;
  if (
    flags & Dirty ||
    (flags & Pending && checkDirty(node.deps as Link, node))
  ) {
    if (flags & HasChildEffect) disposeChildDeps(node);
    if (node.cleanup) {
      try {
        runCleanup(node);
      } catch (error) {
        // queueEffect cleared Watching before this run. If the cleanup escapes the boundary, keep
        // the old dependency set armed so a later write gets another chance to run the effect.
        // A cleanup that stopped its own effect remains terminal.
        if (node.flags !== 0) node.flags = Watching;
        reportEffectError(error, node);
      }
      if (!node.flags) return false;
    }
    node.depsTail = undefined;
    node.flags = Watching | RecursedCheck;
    const previous = setActiveSub(node);
    let result: unknown;
    let caught: { error: unknown } | undefined;
    try {
      cycle++;
      runDepth++;
      result = node.fn();
    } catch (error) {
      caught = { error };
    } finally {
      runDepth--;
      restoreActiveSub(previous);
      node.flags &= ~RecursedCheck;
      // stop() can run midway through this callback; detach any reads made after that terminal
      // transition instead of letting them resurrect the dead subscriber.
      if (node.flags === 0) disposeDeps(node);
      else purgeDeps(node);
    }
    if (caught !== undefined) reportEffectError(caught.error, node);
    // Avoid two helper calls on the dominant `undefined` result path.
    if (result !== undefined) {
      if (isPromiseLike(result)) {
        stopEffect.call(node);
        ignorePromiseRejection(result);
        throw new TypeError("effect() callbacks must be synchronous.");
      }
      const cleanup =
        typeof result === "function" ? (result as Stop) : undefined;
      if (node.flags === 0 && cleanup !== undefined) {
        // A cleanup returned after self-stop belongs to already-disposed work, so run it now.
        node.cleanup = cleanup;
        try {
          runCleanup(node);
        } catch (error) {
          reportEffectError(error, node);
        }
      } else {
        node.cleanup = cleanup;
      }
    }
    const meta = node.meta;
    if (meta) meta.runs++;
    runtimeHooks?.effect(node);
    return meta === undefined || meta.internal !== true;
  } else if (node.deps !== undefined) {
    node.flags = Watching | (flags & HasChildEffect);
  }
  return false;
}

function flush(): void {
  // Writes from an effect append to this same queue. The active drain will reach them; recursively
  // entering flush here turns a long but valid cascade into call-stack depth.
  if (flushing) return;
  flushing = true;
  const hooks = runtimeHooks;
  const start = hooks?.beginFlush();
  const metered = start !== undefined;
  let appBatchSize = 0;
  try {
    if (metered) {
      while (notifyIndex < queuedLength) {
        const node = queued[notifyIndex] as EffectNode;
        queued[notifyIndex++] = undefined;
        if (runEffect(node)) appBatchSize++;
      }
    } else {
      while (notifyIndex < queuedLength) {
        const node = queued[notifyIndex] as EffectNode;
        queued[notifyIndex++] = undefined;
        runEffect(node);
      }
    }
  } finally {
    while (notifyIndex < queuedLength) {
      const node = queued[notifyIndex] as EffectNode;
      queued[notifyIndex++] = undefined;
      if (node.flags !== 0) node.flags |= Watching | Recursed;
    }
    notifyIndex = 0;
    queuedLength = 0;
    // Keep the backing store for ordinary batches; release only unusually large burst capacity.
    if (queued.length > 4096) queued.length = 0;
    flushing = false;
    if (appBatchSize > 0 && start !== undefined) {
      hooks?.endFlush(appBatchSize, start);
    }
  }
}

function stopEffect(this: EffectNode): void {
  if (this.flags === 0) return;
  const meta = this.meta;
  if (activeSub === this) activeSub = undefined;
  this.flags = 0; // drainDeferred skips flags===0; a still-queued deferred node is compacted next drain
  if (this.deferred) this.deferredQueued = false;
  const owner = this.scope;
  if (owner !== undefined && !owner.stopped) {
    // Swap-remove from scope.effects so a long-lived scope doesn't retain dead effects. Skipped while
    // the scope itself is stopping (stopScope iterates effects then clears the array wholesale).
    swapRemove(owner.effects, this.scopeIndex ?? -1, (moved, i) => {
      moved.scopeIndex = i;
    });
    this.scope = undefined;
    this.scopeIndex = -1;
  }
  disposeDeps(this);
  const sub = this.subs;
  if (sub !== undefined) unlink(sub);
  let failed = false;
  let cleanupError: unknown;
  if (this.cleanup) {
    try {
      runCleanup(this);
    } catch (error) {
      failed = true;
      cleanupError = error;
    }
  }
  if (meta) {
    meta.disposed = true;
    inspectHooks?.unregister(meta.id);
  }
  runtimeHooks?.dispose(this);
  if (failed) reportEffectError(cleanupError, this);
}

// Only a returned function is a cleanup; any other return (e.g. an expression-body effect like
// `effect(() => count())`) is ignored rather than crashing on the next run.
function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    value !== undefined &&
    typeof (value as { then?: unknown }).then === "function"
  );
}

function ignorePromiseRejection(promise: PromiseLike<unknown>): void {
  // The callback contract is rejected synchronously, but an already-created native Promise can
  // still reject later. Observe that rejection so API misuse does not also emit an unrelated
  // unhandled-rejection process error.
  void promise.then(undefined, () => undefined);
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
    restoreActiveSub(previous);
  }
}

function disposeChildDeps(sub: NodeBase): void {
  let dep = sub.depsTail;
  while (dep !== undefined) {
    const previous = dep.prevDep;
    const node = dep.dep;
    if (!("getter" in node) && !("currentValue" in node)) unlink(dep, sub);
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

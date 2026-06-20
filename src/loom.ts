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
// Wire an external producer to `set`; return a teardown run when the source goes unobserved.
export type SourceConnect<T> = (set: (value: T) => void) => Stop;
export type NodeKind = "state" | "computed" | "effect";

// Shared creation options for every primitive. `effect` adds `target` (see EffectOptions); the
// others (state/computed/fields/source/polled/scope) take NodeOptions directly.
export interface NodeOptions {
  readonly internal?: boolean;
  readonly label?: string;
  readonly namespace?: string;
}

export interface EffectOptions extends NodeOptions {
  readonly target?: object;
}

export interface InspectNode {
  readonly id: number;
  readonly kind: NodeKind;
  readonly label: string;
  readonly namespace: string;
  readonly internal: boolean;
  readonly deps: readonly number[];
  readonly subs: readonly number[];
  readonly runs: number;
  readonly disposed: boolean;
  readonly target?: object;
  readonly value?: unknown;
  readonly source?: State<unknown>;
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

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

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
  // The scope that owns this effect (for collective stop/pause/resume), if any.
  scope: ScopeNode | undefined;
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
  // Default node options (internal/namespace/label) applied to everything created in the scope,
  // already merged with any ancestor scope's defaults.
  readonly options: NodeOptions | undefined;
  paused: boolean;
  stopped: boolean;
}

interface InspectMeta {
  readonly id: number;
  readonly internal: boolean;
  readonly kind: NodeKind;
  readonly label: string;
  readonly namespace: string;
  readonly target: WeakRef<object> | undefined;
  disposed: boolean;
  runs: number;
}

let cycle = 0;
let runDepth = 0;
let batchDepth = 0;
let notifyIndex = 0;
let queuedLength = 0;
let activeSub: NodeBase | undefined;
let activeScope: ScopeNode | undefined;
const queued: Array<EffectNode | undefined> = [];
const DEFAULT_NAMESPACE = "default";
let inspectId = 0;
let liveScopes = 0; // non-internal scopes alive now (for inspectResources; off the reactive path)
// Inspection is opt-in: off by default so node creation allocates no metadata (zero cost). Turn it
// on with configure({ inspect: true }) BEFORE creating the nodes you want visible to inspect()/the
// inspector — nodes created while it's off carry no metadata and never appear.
let inspectEnabled = false;
const computedNodes = new WeakMap<object, ComputedNode<unknown>>();
const effectNodes = new WeakMap<object, EffectNode>();
const inspectRefs = new Map<number, WeakRef<NodeBase>>();
const stateNodes = new WeakMap<object, StateNode<unknown>>();

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
      queueEffect(effectNode);
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
  stateNodes.set(source, node as StateNode<unknown>);
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
  stateNodes.set(read, node);
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
  node.active = true;
  node.disconnect = node.connect((value) => sourceSet(node, value));
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
  computedNodes.set(read, node as ComputedNode<unknown>);
  if (createCh.meters !== 0 && meta?.internal !== true) createCh.seq++;
  return read;
}

export function effect(fn: CleanupEffectFn, options?: EffectOptions): Stop;
export function effect(fn: EffectFn, options?: EffectOptions): Stop;
export function effect(fn: InternalEffectFn, options?: EffectOptions): Stop {
  const node = createEffectNode(fn);
  if (activeScope !== undefined) {
    node.scope = activeScope;
    activeScope.effects.push(node);
  }
  const meta = registerNode(node, "effect", options);
  if (createCh.meters !== 0 && meta?.internal !== true) createCh.seq++;
  const previous = setActiveSub(node);
  if (previous !== undefined) {
    link(node, previous, 0);
    previous.flags |= HasChildEffect;
  }
  try {
    runDepth++;
    node.cleanup = asCleanup(node.fn());
  } finally {
    runDepth--;
    activeSub = previous;
    node.flags &= ~RecursedCheck;
  }
  if (meta) meta.runs++;
  if (effectCh.meters !== 0 && meta?.internal !== true) effectCh.seq++;
  const stop = stopEffect.bind(node);
  effectNodes.set(stop, node);
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
    stopped: false,
  };
  if (node.options?.internal !== true) liveScopes++;
  activeScope?.children.push(node);
  const previous = activeScope;
  activeScope = node;
  try {
    fn();
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
  for (let s: ScopeNode | undefined = node; s !== undefined; s = s.parent) {
    if (s.paused) return true;
  }
  return false;
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
  if (newlySuspends) walkResources(node, (r) => r.pause());
}

function resumeScope(node: ScopeNode): void {
  if (!node.paused) return;
  node.paused = false;
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
    if (effectNode.flags & (Dirty | Pending)) queueEffect(effectNode);
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
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index] as FieldKey<T>;
    out[key] = state(initial[key], fieldOptions(options, key));
  }
  return out;
}

/* ===== Observability channels: gated overwriting ring buffers, drained by a pull-based meter.
   A channel is a process-global, name-addressed singleton (the producer/consumer rendezvous). It
   stays a no-op — and allocation-free — until a meter attaches. Counts are exact; detail is a
   bounded, most-recent sample that drops oldest under overflow, so no event rate and no consumer
   can stall the producer. ===== */

export interface ChannelOptions {
  /** Detail-ring capacity (rounded up to a power of two). 0 = count-only. Default 0. */
  readonly capacity?: number;
  /** Field names recorded per event on a detail channel (up to 4); emit() takes one value each. */
  readonly fields?: readonly string[];
}

export interface Channel {
  readonly name: string;
  /** True while ≥1 meter is attached — gate expensive argument prep behind it. */
  readonly active: boolean;
  /** Record one event. No-op and zero-allocation when inactive. One value per declared field. */
  emit(a?: unknown, b?: unknown, c?: unknown, d?: unknown): void;
}

export interface Frame {
  /** Exact events on this channel since the last read(). */
  readonly count: number;
  /** Events lost to ring overwrite since the last read() (detail channels only). */
  readonly dropped: number;
  /** Most-recent records, oldest→newest, at most `capacity`; keyed by the channel's fields. */
  readonly samples: ReadonlyArray<Readonly<Record<string, unknown>>>;
}

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
  meters: number;
  seq: number; // monotonic count (double; exact to 2^53)
  head: number; // ring write index (0..cap-1)
}

const channelRegistry = new Map<string, ChannelNode>();

function toPow2(n: number): number {
  if (n <= 0) return 0;
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

function createChannelNode(
  name: string,
  options?: ChannelOptions,
): ChannelNode {
  const cap = toPow2(options?.capacity ?? 0);
  const fields = options?.fields ?? [];
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
    seq: 0,
    head: 0,
  };
}

// Record one event (caller has checked node.meters !== 0). Zero-allocation: columnar ring write,
// one fixed positional value per field (up to 4) so nothing is allocated on the producer path.
function recordChannel(
  node: ChannelNode,
  a: unknown,
  b: unknown,
  c: unknown,
  d: unknown,
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
    node.head = (h + 1) & node.mask;
  }
  node.seq++;
}

function channelOf(node: ChannelNode): Channel {
  return {
    name: node.name,
    get active() {
      return node.meters !== 0;
    },
    emit(a, b, c, d) {
      if (node.meters !== 0) recordChannel(node, a, b, c, d);
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

export function meter(channels: ReadonlyArray<Channel>): Meter {
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
      m.cursor = m.node.seq;
    }
  };
  const detach = (): void => {
    if (!attached) return;
    attached = false;
    for (const m of members) m.node.meters--;
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
        const samples: Array<Record<string, unknown>> = [];
        if (node.cap !== 0 && count > 0) {
          const avail = count < node.cap ? count : node.cap;
          dropped = count - avail;
          const { cols, fields, mask, head, cap } = node;
          for (let k = 0; k < avail; k++) {
            const idx = (head + cap - avail + k) & mask;
            const rec: Record<string, unknown> = {};
            for (let f = 0; f < fields.length; f++) {
              rec[fields[f] as string] = cols[f]?.[idx];
            }
            samples.push(rec);
          }
        }
        m.cursor = seq;
        frame[node.name] = { count, dropped, samples };
      }
      return frame;
    },
    stop: detach,
  };
}

// Built-in reactive channels. The core records to these inline at the hot-path sites; they stay
// no-ops until a meter attaches. Non-internal nodes only, so the idle baseline is zero.
const readCh = createChannelNode("loom:read");
const writeCh = createChannelNode("loom:write");
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

// /* @__PURE__ */ lets a bundler drop this whole collection (and channelOf) when an app never
// meters — the built-in channel *nodes* stay (the core's emit gates reference them), but the
// public wrappers tree-shake away.
export const channels = {
  read: /* @__PURE__ */ channelOf(readCh),
  write: /* @__PURE__ */ channelOf(writeCh),
  compute: /* @__PURE__ */ channelOf(computeCh),
  effect: /* @__PURE__ */ channelOf(effectCh),
  flush: /* @__PURE__ */ channelOf(flushCh),
  create: /* @__PURE__ */ channelOf(createCh),
  dispose: /* @__PURE__ */ channelOf(disposeCh),
} as const;

/**
 * Configure the runtime. `inspect` toggles the always-off-by-default inspection layer: while it is
 * off, node creation allocates no metadata and `inspect()`/`depsOf()`/`inspectResources()` and the
 * inspector see nothing — true zero cost. Turn it on (typically once at startup, before creating
 * the nodes you want visible) when you need tooling; nodes created while it was off stay invisible.
 */
export function configure(options: { readonly inspect?: boolean }): void {
  if (options.inspect !== undefined) inspectEnabled = options.inspect;
}

export function inspect(): InspectSnapshot {
  const nodes: InspectNode[] = [];
  for (const [id, ref] of inspectRefs) {
    const node = ref.deref();
    if (!node) {
      inspectRefs.delete(id);
      continue;
    }
    const meta = node.meta;
    if (meta) nodes.push(inspectNode(node, meta));
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
  readonly sources: number;
  readonly scopes: number;
  readonly channels: number;
}

export function inspectResources(): ResourceCounts {
  let states = 0;
  let computeds = 0;
  let effects = 0;
  let sources = 0;
  for (const [id, ref] of inspectRefs) {
    const node = ref.deref();
    if (node === undefined) {
      inspectRefs.delete(id);
      continue;
    }
    const meta = node.meta;
    if (!meta || meta.internal) continue;
    if (meta.kind === "computed") computeds++;
    else if (meta.kind === "effect") effects++;
    else if ("connect" in node)
      sources++; // a state-kind node backed by an external producer
    else states++;
  }
  return {
    states,
    computeds,
    effects,
    sources,
    scopes: liveScopes,
    channels: channelRegistry.size,
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
  // Apply the active scope's ambient defaults (internal/namespace/label) under any explicit ones.
  const opts = mergeOptions(activeScope?.options, options);
  const id = ++inspectId;
  const meta: InspectMeta = {
    id,
    disposed: false,
    internal: opts?.internal === true,
    kind,
    label: opts?.label ?? `${kind} #${id}`,
    namespace: opts?.namespace ?? DEFAULT_NAMESPACE,
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
  if (options.internal !== undefined) {
    return options.namespace === undefined
      ? { ...out, internal: options.internal }
      : { ...out, internal: options.internal, namespace: options.namespace };
  }
  return options.namespace === undefined
    ? out
    : { ...out, namespace: options.namespace };
}

function nodeForSource(source: Read<unknown> | Stop): NodeBase | undefined {
  const key = source as object;
  return stateNodes.get(key) ?? computedNodes.get(key) ?? effectNodes.get(key);
}

function inspectNode(node: NodeBase, meta: InspectMeta): InspectNode {
  const base = {
    id: meta.id,
    deps: idsFromDeps(node),
    disposed: meta.disposed,
    internal: meta.internal,
    kind: meta.kind,
    label: meta.label,
    namespace: meta.namespace,
    runs: meta.runs,
    subs: idsFromSubs(node),
  };
  const source = sourceFromNode(node, meta);
  const target = meta.target?.deref();
  const value = nodeValue(node);
  return inspectNodeWithOptionals(base, source, target, value);
}

function inspectNodeWithOptionals(
  base: Omit<InspectNode, "source" | "target" | "value">,
  source: State<unknown> | undefined,
  target: object | undefined,
  value: unknown,
): InspectNode {
  const out: Mutable<InspectNode> = { ...base };
  if (source !== undefined) out.source = source;
  if (target !== undefined) out.target = target;
  if (value !== undefined) out.value = value;
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
      if (writeCh.meters !== 0 && this.meta?.internal !== true) writeCh.seq++;
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
    if (readCh.meters !== 0 && this.meta?.internal !== true) readCh.seq++;
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
    if (readCh.meters !== 0 && this.meta?.internal !== true) readCh.seq++;
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
    if (readCh.meters !== 0 && this.meta?.internal !== true) readCh.seq++;
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
      );
    }
  }
}

function stopEffect(this: EffectNode): void {
  const meta = this.meta;
  this.flags = 0;
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

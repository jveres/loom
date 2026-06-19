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

export interface NodeOptions {
  readonly internal?: boolean;
  readonly label?: string;
  readonly namespace?: string;
}

export type StateOptions = NodeOptions;
export type ComputedOptions = NodeOptions;
export type FieldsOptions = NodeOptions;

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

export type ObserveEvent =
  | {
      readonly kind: "state:create";
      readonly id: number;
      readonly label: string;
      readonly namespace: string;
      readonly internal: boolean;
      readonly value: unknown;
    }
  | {
      readonly kind: "state:set";
      readonly id: number;
      readonly label: string;
      readonly namespace: string;
      readonly internal: boolean;
      readonly previous: unknown;
      readonly value: unknown;
    }
  | {
      readonly kind: "state:read" | "computed:read";
      readonly id: number;
      readonly label: string;
      readonly namespace: string;
      readonly internal: boolean;
    }
  | {
      readonly kind: "computed:create" | "effect:create" | "effect:dispose";
      readonly id: number;
      readonly label: string;
      readonly namespace: string;
      readonly internal: boolean;
    }
  | {
      readonly kind: "computed:update";
      readonly id: number;
      readonly label: string;
      readonly namespace: string;
      readonly internal: boolean;
      readonly previous: unknown;
      readonly value: unknown;
    }
  | {
      readonly kind: "effect:run";
      readonly id: number;
      readonly label: string;
      readonly namespace: string;
      readonly internal: boolean;
      readonly runs: number;
    }
  | {
      readonly kind: "flush";
      readonly batchSize: number;
      readonly durationMs: number;
    };

export type Observer = (event: ObserveEvent) => void;

export interface ObserveOptions {
  readonly computed?: boolean;
  readonly creates?: boolean;
  readonly effects?: boolean;
  readonly flushes?: boolean;
  readonly includeInternal?: boolean;
  readonly reads?: boolean;
  readonly writes?: boolean;
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

interface ObserverRecord {
  readonly computed: boolean;
  readonly creates: boolean;
  readonly effects: boolean;
  readonly flushes: boolean;
  readonly includeInternal: boolean;
  readonly observer: Observer;
  readonly reads: boolean;
  readonly writes: boolean;
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
let computedObservers = 0;
let createObservers = 0;
let effectObservers = 0;
let flushObservers = 0;
let readObservers = 0;
let writeObservers = 0;
const computedNodes = new WeakMap<object, ComputedNode<unknown>>();
const effectNodes = new WeakMap<object, EffectNode>();
const inspectRefs = new Map<number, WeakRef<NodeBase>>();
const observers = new Set<ObserverRecord>();
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

export function state<T>(initial: T, options?: StateOptions): State<T> {
  const node = createStateNode(initial);
  const source = stateOper.bind(node) as State<T>;
  node.source = source as State<unknown>;
  const meta = registerNode(node, "state", options);
  stateNodes.set(source, node as StateNode<unknown>);
  if (createObservers > 0) emitStateCreate(meta, initial);
  return source;
}

export const signal = state;

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
  options?: StateOptions,
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
  if (createObservers > 0) emitStateCreate(meta, initial);
  return read;
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
  node.active = true;
  node.disconnect = node.connect((value) => sourceSet(node, value));
}

export function computed<T>(
  getter: (previousValue?: T) => T,
  options?: ComputedOptions,
): Read<T> {
  const node = createComputedNode(getter);
  const read = computedOper.bind(node) as Read<T>;
  const meta = registerNode(node, "computed", options);
  computedNodes.set(read, node as ComputedNode<unknown>);
  if (createObservers > 0) emitCreate(meta, "computed:create");
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
  if (createObservers > 0) emitCreate(meta, "effect:create");
  const previous = setActiveSub(node);
  if (previous !== undefined) {
    link(node, previous, 0);
    previous.flags |= HasChildEffect;
  }
  try {
    runDepth++;
    node.cleanup = node.fn() as Stop | undefined;
  } finally {
    runDepth--;
    activeSub = previous;
    node.flags &= ~RecursedCheck;
  }
  emitRun(node);
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
export function scope(fn: () => void): Scope {
  const node: ScopeNode = {
    effects: [],
    resources: [],
    children: [],
    parent: activeScope,
    paused: false,
    stopped: false,
  };
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
  if (newlySuspends) suspendResources(node);
}

// Pause resources across the subtree, skipping children that are independently paused (theirs are
// already suspended).
function suspendResources(node: ScopeNode): void {
  for (const resource of node.resources) resource.pause();
  for (const child of node.children) {
    if (!child.paused) suspendResources(child);
  }
}

function resumeScope(node: ScopeNode): void {
  if (!node.paused) return;
  node.paused = false;
  // If an ancestor is still paused, the chain stays suspended — do nothing yet.
  if (scopePaused(node)) return;
  awakenResources(node);
  flushScope(node);
  // If we're resuming from inside an effect run (e.g. a tab switch), the re-queued effects ride
  // the in-progress flush; only drive a fresh flush when at the top level.
  if (batchDepth === 0 && runDepth === 0) flush();
}

function awakenResources(node: ScopeNode): void {
  for (const resource of node.resources) resource.resume();
  for (const child of node.children) {
    if (!child.paused) awakenResources(child);
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
  options?: StateOptions,
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
  options?: FieldsOptions,
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

export function observe(observer: Observer, options?: ObserveOptions): Stop {
  const record = observerRecord(observer, options);
  observers.add(record);
  addObserverCounters(record, 1);
  return () => {
    if (!observers.delete(record)) return;
    addObserverCounters(record, -1);
  };
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

function registerNode(
  node: NodeBase,
  kind: NodeKind,
  options: StateOptions | ComputedOptions | EffectOptions | undefined,
): InspectMeta {
  const id = ++inspectId;
  const meta: InspectMeta = {
    id,
    disposed: false,
    internal: options?.internal === true,
    kind,
    label: options?.label ?? `${kind} #${id}`,
    namespace: options?.namespace ?? DEFAULT_NAMESPACE,
    runs: 0,
    target:
      options && "target" in options && options.target
        ? new WeakRef(options.target)
        : undefined,
  };
  node.meta = meta;
  inspectRefs.set(id, new WeakRef(node));
  return meta;
}

function fieldOptions(
  options: FieldsOptions | undefined,
  key: string,
): StateOptions | undefined {
  if (!options) return undefined;
  const out: StateOptions = {
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

function emitStateCreate(meta: InspectMeta, value: unknown): void {
  emit(meta, {
    kind: "state:create",
    id: meta.id,
    internal: meta.internal,
    label: meta.label,
    namespace: meta.namespace,
    value,
  });
}

function emitCreate(
  meta: InspectMeta,
  kind: "computed:create" | "effect:create",
): void {
  emit(meta, {
    kind,
    id: meta.id,
    internal: meta.internal,
    label: meta.label,
    namespace: meta.namespace,
  });
}

function emitStateSet<T>(node: StateNode<T>, previous: T, value: T): void {
  if (writeObservers === 0) return;
  const meta = node.meta;
  if (!meta) return;
  emit(meta, {
    kind: "state:set",
    id: meta.id,
    internal: meta.internal,
    label: meta.label,
    namespace: meta.namespace,
    previous,
    value,
  });
}

function emitComputedUpdate<T>(
  node: ComputedNode<T>,
  previous: T | undefined,
  value: T | undefined,
): void {
  if (computedObservers === 0) return;
  const meta = node.meta;
  if (!meta) return;
  emit(meta, {
    kind: "computed:update",
    id: meta.id,
    internal: meta.internal,
    label: meta.label,
    namespace: meta.namespace,
    previous,
    value,
  });
}

function emitRead(node: StateNode<unknown> | ComputedNode<unknown>): void {
  if (readObservers === 0) return;
  const meta = node.meta;
  if (!meta) return;
  emit(meta, {
    kind: meta.kind === "computed" ? "computed:read" : "state:read",
    id: meta.id,
    internal: meta.internal,
    label: meta.label,
    namespace: meta.namespace,
  });
}

function emitRun(node: EffectNode): void {
  const meta = node.meta;
  if (!meta) return;
  meta.runs++;
  if (effectObservers > 0) emitEffectRun(meta);
}

function emitEffectRun(meta: InspectMeta): void {
  emit(meta, {
    kind: "effect:run",
    id: meta.id,
    internal: meta.internal,
    label: meta.label,
    namespace: meta.namespace,
    runs: meta.runs,
  });
}

function emitDispose(meta: InspectMeta): void {
  if (effectObservers === 0) return;
  emit(meta, {
    kind: "effect:dispose",
    id: meta.id,
    internal: meta.internal,
    label: meta.label,
    namespace: meta.namespace,
  });
}

function emitFlush(batchSize: number, durationMs: number): void {
  if (flushObservers === 0) return;
  emit(undefined, { kind: "flush", batchSize, durationMs });
}

function emit(meta: InspectMeta | undefined, event: ObserveEvent): void {
  if (observers.size === 0) return;
  for (const record of observers) {
    if (!record.includeInternal && meta?.internal) continue;
    if (observes(record, event)) record.observer(event);
  }
}

function observerRecord(
  observer: Observer,
  options: ObserveOptions | undefined,
): ObserverRecord {
  if (!options) {
    return {
      computed: true,
      creates: true,
      effects: true,
      flushes: true,
      includeInternal: false,
      observer,
      reads: true,
      writes: true,
    };
  }
  const allKinds =
    options.computed === undefined &&
    options.creates === undefined &&
    options.effects === undefined &&
    options.flushes === undefined &&
    options.reads === undefined &&
    options.writes === undefined;
  return {
    computed: allKinds || options.computed === true,
    creates: allKinds || options.creates === true,
    effects: allKinds || options.effects === true,
    flushes: allKinds || options.flushes === true,
    includeInternal: options.includeInternal === true,
    observer,
    reads: allKinds || options.reads === true,
    writes: allKinds || options.writes === true,
  };
}

function addObserverCounters(record: ObserverRecord, direction: 1 | -1): void {
  if (record.computed) computedObservers += direction;
  if (record.creates) createObservers += direction;
  if (record.effects) effectObservers += direction;
  if (record.flushes) flushObservers += direction;
  if (record.reads) readObservers += direction;
  if (record.writes) writeObservers += direction;
}

function observes(record: ObserverRecord, event: ObserveEvent): boolean {
  switch (event.kind) {
    case "computed:create":
    case "effect:create":
    case "state:create":
      return record.creates;
    case "computed:read":
    case "state:read":
      return record.reads;
    case "state:set":
      return record.writes;
    case "computed:update":
      return record.computed;
    case "effect:dispose":
    case "effect:run":
      return record.effects;
    case "flush":
      return record.flushes;
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
      if (writeObservers > 0) emitStateSet(this, previous, next);
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
    if (readObservers > 0) emitRead(this as StateNode<unknown>);
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
    if (first && !this.active) {
      this.active = true;
      this.disconnect = this.connect((value) => sourceSet(this, value));
    }
    if (readObservers > 0) emitRead(this as unknown as StateNode<unknown>);
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
      const oldValue = this.value;
      this.value = this.getter();
      if (computedObservers > 0) emitComputedUpdate(this, oldValue, this.value);
    } finally {
      activeSub = previous;
      this.flags &= ~RecursedCheck;
    }
  }

  const sub = activeSub;
  if (sub !== undefined) {
    link(this, sub, cycle);
    if (readObservers > 0) emitRead(this as ComputedNode<unknown>);
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
    if (changed && computedObservers > 0) {
      emitComputedUpdate(node, oldValue, newValue);
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
      node.cleanup = node.fn() as Stop | undefined;
    } finally {
      runDepth--;
      activeSub = previous;
      node.flags &= ~RecursedCheck;
      purgeDeps(node);
    }
    const meta = node.meta;
    if (meta) {
      meta.runs++;
      if (effectObservers > 0) emitEffectRun(meta);
    }
    return meta === undefined || meta.internal !== true;
  } else if (node.deps !== undefined) {
    node.flags = Watching | (flags & HasChildEffect);
  }
  return false;
}

function flush(): void {
  const batchSize = queuedLength - notifyIndex;
  const start = batchSize > 0 && flushObservers > 0 ? now() : 0;
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
    if (appBatchSize > 0) {
      emitFlush(appBatchSize, start ? now() - start : 0);
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
  emitDispose(meta);
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

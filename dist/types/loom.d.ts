import { type Link, type ReactiveNode } from "./core/graph.js";
export interface State<T> {
    (): T;
    (next: T): void;
}
export type Read<T> = () => T;
export type Stop = () => void;
export interface Scope {
    readonly stop: Stop;
    readonly pause: () => void;
    readonly resume: () => void;
}
export type EffectFn = () => void;
export type ErrorHandler = (error: unknown, node?: NodeInfo) => void;
export type SourceConnect<T> = (set: (value: T) => void) => Stop;
export type NodeKind = "state" | "computed" | "effect";
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
export type DeferScheduler = (drain: (hasBudget: () => boolean) => void, maxStale: number) => () => void;
export interface NodeInfo {
    readonly id: number;
    readonly kind: NodeKind;
    readonly label: string;
}
export type CleanupEffectFn = () => Stop;
type InternalEffectFn = EffectFn | CleanupEffectFn;
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
export interface ComputedNode<T> extends NodeBase {
    value: T | undefined;
    getter(previousValue?: T): T;
}
interface EffectNode extends NodeBase {
    fn: InternalEffectFn;
    cleanup: Stop | undefined;
    scope: ScopeNode | undefined;
    scopeIndex: number;
    pausedCount: number;
    deferred: boolean;
    deferredQueued: boolean;
    maxStale: number;
    deferDeadline: number;
}
interface ScopeResource {
    pause(): void;
    resume(): void;
    stop(): void;
}
interface ScopeNode {
    readonly effects: EffectNode[];
    readonly resources: ScopeResource[];
    readonly children: ScopeNode[];
    readonly parent: ScopeNode | undefined;
    childIndex: number;
    readonly options: NodeOptions | undefined;
    paused: boolean;
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
    group?: number;
    key?: string;
}
export declare const deferredLane: {
    enqueue: ((node: EffectNode) => void) | undefined;
    scheduler: DeferScheduler | undefined;
};
export interface InspectHooks {
    register(node: NodeBase, kind: NodeKind, options: NodeOptions | EffectOptions | undefined): InspectMeta | undefined;
    unregister(id: number): void;
    setEnabled(on: boolean): void;
    nextGroup(): number;
    /** Dev diagnostics: a tracked run wrote `node` — warn if the writer also subscribes to it. */
    trackedWrite?(node: NodeBase, writer: NodeBase): void;
}
export declare function installInspectHooks(hooks: InspectHooks): void;
export declare function ambientOptions(): NodeOptions | undefined;
export declare function liveScopeCount(): number;
export declare function state<T>(initial: T, options?: NodeOptions): State<T>;
/**
 * A lazy reactive source backed by an external producer. `connect(set)` is invoked the first
 * time the source is read inside a live effect/computed (its first subscriber); it wires up the
 * producer — a timer, event listener, `PerformanceObserver`, socket — and returns a teardown
 * run automatically when the last subscriber goes away. Reads while unobserved return the last
 * value (or `initial`). `connect` should push values via `set` asynchronously.
 */
export declare function source<T>(connect: SourceConnect<T>, initial: T, options?: NodeOptions): Read<T>;
export declare function computed<T>(getter: (previousValue?: T) => T, options?: NodeOptions): Read<T>;
export declare function effect(fn: CleanupEffectFn, options?: EffectOptions): Stop;
export declare function effect(fn: EffectFn, options?: EffectOptions): Stop;
export declare function batch<T>(fn: () => T): T;
/**
 * Group the effects created inside `fn` so they can be torn down or suspended together: `stop()`
 * disposes them, `pause()` suspends their runs (intervening changes just mark them dirty), and
 * `resume()` re-runs the ones that went dirty while paused. Scopes nest — a scope created inside
 * another becomes its child, and an effect runs only while no scope in its parent chain is paused.
 * So pausing a parent freezes its whole subtree, and resuming it leaves an independently-paused
 * child suspended.
 */
export declare function scope(fn: () => void, options?: NodeOptions): Scope;
export declare function installDeferredLane(enqueue: (node: EffectNode) => void): {
    runEffect: (node: EffectNode) => void;
    clearWatching: (node: EffectNode) => void;
};
export type { EffectNode };
export declare function pauseEffectStop(stop: Stop): boolean;
export declare function resumeEffectStop(stop: Stop): boolean;
export declare function registerScopeResource(resource: ScopeResource): void;
export type Polled<T> = Read<T> & {
    readonly stop: Stop;
};
/**
 * The **pull** bridge for external data: re-samples `sample()` every `ms` milliseconds into a
 * value-deduped signal, for values you can read imperatively at any time (clocks, `performance`
 * counters, media state). Bindings reading the poll (`p()`) re-run only when the sampled value
 * actually changed. Call `.stop()` to clear the timer; created inside a scope, the timer suspends
 * and resumes with it. The backing state honours `options` (e.g. `{ internal: true }`).
 * Push-style producers want {@link source}; async request/response wants `resource` (loom/async).
 */
export declare function poll<T>(sample: () => T, ms: number, options?: NodeOptions): Polled<T>;
export declare function trigger(source: Read<unknown>): void;
export declare function untrack<T>(fn: () => T): T;
/**
 * Functional read-modify-write: `update(count, n => n + 1)`. The read is **untracked** — inside an
 * effect, updating a signal does not subscribe the effect to it, so the classic `v(v() + 1)`
 * self-dependency foot-gun can't happen through this helper.
 */
export declare function update<T>(source: State<T>, fn: (value: T) => T): void;
/**
 * Watch an explicit source and react to its **changes**: `read` is tracked (its dependencies drive
 * re-evaluation), `onChange(value, previous)` runs untracked and is skipped on the initial
 * evaluation and whenever the derived value is unchanged. The write-back-binding shape without the
 * `let first = true` boilerplate — and because `onChange` is untracked, writes inside it can't
 * create accidental self-dependencies.
 */
export declare function watch<T>(read: Read<T>, onChange: (value: T, previous: T) => void, options?: EffectOptions): Stop;
export declare function mutate<T extends object>(source: State<T>, fn: (value: T) => void): void;
export declare function props<T extends object>(initial: T, options?: NodeOptions): Props<T>;
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
export declare function configure(options: ConfigureOptions): void;
export declare function mergeOptions(defaults: NodeOptions | undefined, own: NodeOptions | EffectOptions | undefined): NodeOptions | EffectOptions | undefined;

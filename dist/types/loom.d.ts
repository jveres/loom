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
export type DeferScheduler = (drain: (hasBudget: () => boolean) => void, maxStale: number) => () => void;
export interface NodeInfo {
    readonly id: number;
    readonly kind: NodeKind;
    readonly label: string;
}
export interface InspectNode extends NodeInfo {
    readonly internal: boolean;
    readonly deps: readonly number[];
    readonly subs: readonly number[];
    readonly runs: number;
    readonly disposed: boolean;
    readonly target?: object;
    readonly value?: unknown;
    readonly source?: State<unknown>;
    readonly group?: number;
    readonly key?: string;
}
export interface InspectSnapshot {
    readonly nodes: readonly InspectNode[];
}
type CleanupEffectFn = () => Stop;
type FieldKey<T extends object> = Extract<keyof T, string>;
export type Fields<T extends object> = {
    readonly [K in FieldKey<T>]: State<T[K]>;
};
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
export type Polled<T> = Read<T> & {
    readonly stop: Stop;
};
/**
 * A reactive source that re-samples `sample()` every `ms` milliseconds into a value-deduped
 * signal. Bindings reading the source (`p()`) re-run only when the sampled value actually changes —
 * so it bridges imperative or external data (clocks, `performance` counters, polled APIs, media
 * state) into the reactive graph without a hand-rolled heartbeat. Call `.stop()` to clear the
 * timer. The backing state honours `options` (e.g. `{ internal: true }`).
 */
export declare function polled<T>(sample: () => T, ms: number, options?: NodeOptions): Polled<T>;
export declare function trigger(source: Read<unknown>): void;
export declare function untrack<T>(fn: () => T): T;
export declare function update<T>(source: State<T>, fn: (value: T) => T): void;
export declare function mutate<T extends object>(source: State<T>, fn: (value: T) => void): void;
export declare function fields<T extends object>(initial: T, options?: NodeOptions): Fields<T>;
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
export declare function channel(name: string, options?: ChannelOptions): Channel;
export declare function meter(channels: ReadonlyArray<Channel>, aggregation?: MeterAggregation): Meter;
export declare const events: {
    readonly read: Channel;
    readonly write: Channel;
    readonly compute: Channel;
    readonly effect: Channel;
    readonly flush: Channel;
    readonly create: Channel;
    readonly dispose: Channel;
};
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
export declare function configure(options: {
    readonly inspect?: boolean;
    readonly onError?: ErrorHandler | undefined;
    /** Override the deferred-effect scheduler (e.g. synchronous in tests, no-op on the server). */
    readonly deferScheduler?: DeferScheduler;
    /** Default `maxStale` (ms) for deferred effects that don't set their own. Default 200. */
    readonly deferTimeout?: number;
}): void;
/**
 * Snapshot the reactive graph. With `{ active: true }`, skip state/computed cells that have no
 * subscribers — these are either idle (nothing reads them) or "ghosts": cells of a removed object
 * that are unreachable from the app but still alive until GC clears their WeakRef. Effects are
 * always kept. There is no way to detect a not-yet-collected ghost directly (reachability is the
 * GC's business), so the subscriber count is the proxy: a live cell is one something still reads.
 */
export declare function inspect(options?: {
    readonly active?: boolean;
}): InspectSnapshot;
export interface ResourceCounts {
    readonly states: number;
    readonly computeds: number;
    readonly effects: number;
    readonly views: number;
    readonly sources: number;
    readonly scopes: number;
    readonly channels: number;
    readonly unread: number;
}
export declare function inspectResources(): ResourceCounts;
export declare function depsOf(source: Read<unknown> | Stop): readonly InspectNode[];
export {};

export interface ChannelOptions {
    /** Detail-ring capacity (rounded up to a power of two). 0 = count-only. Default 0. */
    readonly capacity?: number;
    /** Field names recorded per event on a detail channel (up to 5); emit() takes one value each. */
    readonly fields?: readonly string[];
}
export interface Channel<Name extends string = string> {
    readonly name: Name;
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
export interface Meter<Name extends string = string> {
    /** Pull one Frame per metered channel, keyed by channel name. Call on your own clock. */
    read(): Readonly<Partial<Record<Name, Frame>>>;
    /** Detach from every channel (drops their gate). */
    stop(): void;
}
export declare function channel<const Name extends string>(name: Name, options?: ChannelOptions): Channel<Name>;
export declare function meter<const Channels extends ReadonlyArray<Channel>>(channels: Channels, aggregation?: MeterAggregation): Meter<Channels[number]["name"]>;
export declare const events: {
    readonly read: Channel<"loom:read">;
    readonly write: Channel<"loom:write">;
    readonly compute: Channel<"loom:compute">;
    readonly effect: Channel<"loom:effect">;
    readonly flush: Channel<"loom:flush">;
    readonly create: Channel<"loom:create">;
    readonly dispose: Channel<"loom:dispose">;
};
export interface ReadSample {
    readonly id: number;
    readonly by: number | undefined;
    readonly t: number;
}
export interface WriteSample {
    readonly id: number;
    readonly prev: unknown;
    readonly next: unknown;
    readonly by: number | undefined;
    readonly t: number;
}
export interface FlushSample {
    readonly batchSize: number;
    readonly durationMs: number;
}
export declare function sampleOf<T>(sample: Readonly<Record<string, unknown>>): T;
export declare function sampleOf<T>(sample: Readonly<Record<string, unknown>> | undefined): T | undefined;

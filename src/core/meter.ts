// The consumer half of the channel layer (public surface): channel() declarations, meters (the
// pull-based readers), the runtime's built-in `events` registry, and the typed sample contracts.
// Split from ./channels.ts so none of this bundles into apps that never meter anything.

import { registerScopeResource } from "../loom.js";
import {
  type ChannelNode,
  channelRegistry,
  computeCh,
  createCh,
  disposeCh,
  effectCh,
  flushCh,
  makeChannelNode,
  readCh,
  sampler,
  writeCh,
} from "./channels.js";

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
  capacity: number,
  fields: readonly string[],
): ChannelNode {
  const cap = toPow2(capacity);
  if (fields.length > MAX_CHANNEL_FIELDS) {
    throw new RangeError(
      `A channel records up to ${MAX_CHANNEL_FIELDS} fields; "${name}" declares ${fields.length}.`,
    );
  }
  return makeChannelNode(name, cap, fields);
}

// Allocate a channel's ring columns on first need (a samples meter attaching, or a first emit on a
// metered detail channel) — unmetered channels never pay the arrays.
function ensureRing(node: ChannelNode): void {
  if (node.cap !== 0 && node.cols === undefined) {
    const cols: unknown[][] = [];
    for (let i = 0; i < node.fields.length; i++) cols.push(new Array(node.cap));
    node.cols = cols;
  }
}

// Record one event (caller has checked the gate). Zero-allocation: columnar ring write, one fixed
// positional value per field (up to 5) so nothing is allocated on the producer path.
function recordChannel(
  node: ChannelNode,
  a: unknown,
  b: unknown,
  c: unknown,
  d: unknown,
  e: unknown,
): void {
  const cols = node.cols;
  if (cols !== undefined) {
    const h = node.head;
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
// Loading this module upgrades the core's count-only fallback to the real ring writer.
sampler.record = recordChannel;

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

// Shared by every count-only channel's Frame (and any channel with no new samples) so meter.read()
// allocates nothing on the common path.
const EMPTY_SAMPLES: ReadonlyArray<Readonly<Record<string, unknown>>> = [];

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
  // `loom:` is reserved for the runtime's own built-in event channels (the `events` registry behind
  // loom/observe), which share this registry. Reject it so app channels can't collide with internals.
  if (name.startsWith("loom:")) {
    throw new Error(
      `Channel name "${name}" uses the reserved "loom:" prefix (built-in runtime channels).`,
    );
  }
  let node = channelRegistry.get(name);
  if (node === undefined) {
    node = createChannelNode(
      name,
      options?.capacity ?? 0,
      options?.fields ?? [],
    );
    channelRegistry.set(name, node);
  } else if (options !== undefined) {
    const cap = toPow2(options.capacity ?? 0);
    if (cap !== node.cap || !sameFields(options.fields ?? [], node.fields)) {
      throw new Error(
        `Channel "${name}" already declared with different options.`,
      );
    }
  }
  return channelOf(node);
}

// Element-wise field comparison: a `.join()` compare would treat ["a,b"] and ["a","b"] as equal.
function sameFields(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export function meter(
  channels: ReadonlyArray<Channel>,
  aggregation: MeterAggregation = "count",
): Meter {
  const withSamples = aggregation === "samples";
  const members: Array<{ readonly node: ChannelNode; cursor: number }> = [];
  for (const ch of channels) {
    const node = channelRegistry.get(ch.name);
    // Unregistered name (a hand-rolled/stale Channel object) is tolerated by design — it simply
    // never appears in read() rather than throwing. See the "ignores channels it doesn't know" test.
    if (node !== undefined) members.push({ node, cursor: node.seq });
  }
  let attached = false;
  const attach = (): void => {
    if (attached) return;
    attached = true;
    for (const m of members) {
      m.node.meters++;
      if (withSamples) {
        m.node.samples++;
        ensureRing(m.node);
      }
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
  registerScopeResource({ pause: detach, resume: attach, stop: detach });
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
          const { fields, mask, head, cap } = node;
          const cols = node.cols ?? [];
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

// The record shape each built-in detail channel writes into a Frame's `samples`, keyed by the
// channel's declared `fields`. The Meter API is generic, so `Frame.samples` is typed
// `Record<string, unknown>`; a consumer (the inspector) narrows a known channel's samples to one of
// these with `sampleOf`. Keep these in lockstep with the `fields` arrays passed to
// createChannelNode above — they are the single named contract the devtools reads against.
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

// Narrow a metered channel's untyped sample records to their known payload shape. The generic Meter
// can't do this at the type level (channels are dynamic), so this is the one sanctioned, centralized
// reinterpret — consumers name the shape here instead of re-asserting a literal at each read site.
// A present record narrows to T; a possibly-missing one (e.g. samples.at(-1)) carries the undefined.
export function sampleOf<T>(sample: Readonly<Record<string, unknown>>): T;
export function sampleOf<T>(
  sample: Readonly<Record<string, unknown>> | undefined,
): T | undefined;
export function sampleOf<T>(
  sample: Readonly<Record<string, unknown>> | undefined,
): T | undefined {
  return sample as T | undefined;
}

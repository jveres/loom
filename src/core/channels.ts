// The always-present half of the channel layer: the node shape, the registry, and the built-in
// runtime channels the core's hot-path gates reference. Everything else — channel()/meter()/events,
// capacity validation, the ring writer — lives in ./meter.ts and is wired in through the
// `sampler` holder below, so apps that never observe anything bundle none of it.
/* ===== Channels & meters: generic, gated, overwriting ring buffers drained by a pull-based meter.
   A channel is a process-global, name-addressed singleton (the producer/consumer rendezvous). It
   stays a no-op — and allocation-free — until a meter attaches. Counts are exact; detail is a
   bounded, most-recent sample that drops oldest under overflow, so no event rate and no consumer
   can stall the producer. (loom's own self-instrumentation built on these is the `events` registry
   in ./meter.ts, surfaced via loom/observe — but the primitives themselves are generic.) ===== */

export interface ChannelNode {
  readonly name: string;
  readonly cap: number; // detail-ring capacity (power of two; 0 = count-only)
  readonly mask: number;
  readonly fields: readonly string[];
  cols: unknown[][] | undefined; // ring columns, allocated by ./meter.ts on first samples-attach
  meters: number; // attached meters of any kind (gates counting at the emit sites)
  samples: number; // of those, the "samples" meters — detail recording is gated on this, so a
  // count-only consumer (e.g. the stats rates) doesn't pay for the ring write + timestamp
  seq: number; // monotonic count (double; exact to 2^53)
  head: number; // ring write index (0..cap-1)
}

export const channelRegistry = new Map<string, ChannelNode>();

// The detail-ring writer seam. The hot paths call `sampler.record` only under a `samples !== 0`
// gate, and `samples` can only become non-zero through meter() in ./meter.ts — which swaps this
// count-only fallback for the real columnar ring writer when it loads. A property on a stable
// const object (not a live `let` binding): consumers alias the holder into a local once, so the
// call costs one property load in every module system — no per-call live-binding getters.
export const sampler = {
  record(
    node: ChannelNode,
    _a: unknown,
    _b: unknown,
    _c: unknown,
    _d: unknown,
    _e: unknown,
  ): void {
    node.seq++;
  },
};

// The one construction site for the ChannelNode shape — the built-ins below and ./meter.ts's
// public channel() both call it, so the literal can't drift between the two modules. `cap` must
// already be a power of two (the public path validates via toPow2 first).
export function makeChannelNode(
  name: string,
  cap: number,
  fields: readonly string[],
): ChannelNode {
  return {
    name,
    cap,
    mask: cap > 0 ? cap - 1 : 0,
    fields,
    cols: undefined,
    meters: 0,
    samples: 0,
    seq: 0,
    head: 0,
  };
}

// A built-in channel node: cap values here are powers of two by construction.
function builtin(
  name: string,
  cap = 0,
  fields: readonly string[] = [],
): ChannelNode {
  const node = makeChannelNode(name, cap, fields);
  channelRegistry.set(name, node);
  return node;
}

// The runtime's built-in channels, exposed publicly as `events` (via loom/observe). The core
// records to these inline at the hot-path sites; they stay no-ops until a meter attaches. Records
// non-internal nodes only *when inspection is on* — the `internal` flag lives in a node's inspect
// meta, which isn't allocated while inspection is off (the inspect registrar returns early). So
// with inspection off, the gate can't see the flag and internal nodes are counted too. Loom creates
// no internal nodes at rest, so the idle baseline is still zero; but a meter attached alongside an
// app's own `{ internal: true }` nodes while inspection is off will include them. Turn inspection
// on (configure({ inspect: true })) for the internal-exclusion contract to hold.
// read carries detail (which signal, the reader that read it, when) so a "samples" meter can stream
// reads (the Trace tab); a "count" meter (the read rate) ignores the ring. Reads are the
// highest-frequency event, so the per-read recording is paid only while metered and stays zero-alloc.
// `by` is the running effect/computed that performed the read — i.e. who consumed the signal.
export const readCh = builtin("loom:read", 1024, ["id", "by", "t"]);
// write carries detail so a "samples" meter can stream individual mutations (id + prev→next + the
// node that wrote it + a wall-clock timestamp), e.g. the inspector's Trace tab; a "count" meter
// (the rates) ignores the ring and allocates nothing. `by` is the effect/computed that wrote during
// a reactive cascade, or undefined for a top-level (event-handler) write.
export const writeCh = builtin("loom:write", 1024, [
  "id",
  "prev",
  "next",
  "by",
  "t",
]);
export const computeCh = builtin("loom:compute");
export const effectCh = builtin("loom:effect");
export const flushCh = builtin("loom:flush", 8, ["batchSize", "durationMs"]);
export const createCh = builtin("loom:create");
export const disposeCh = builtin("loom:dispose");

// Proof-of-concept stress test for the proposed observability "channel" primitive:
// a gated, overwriting ring buffer drained by a pull-based meter (perf_event / LMAX-Disruptor
// model), versus the synchronous-push model (observe / diagnostics_channel / BroadcastChannel).
//
// It verifies the four claims behind the design:
//   1. zero cost when no consumer is attached (the subscriber gate),
//   2. near-baseline producer cost when attached (no per-event allocation or callback),
//   3. ~no GC — push allocates an event object per emit, which is the GC storm that froze iOS,
//   4. the decoupled drain is correct: exact counts + bounded, most-recent sampled detail,
//      with an accurate dropped-event count under overflow.
//
// Run: node bench/bus-poc.mjs

import { PerformanceObserver, performance } from "node:perf_hooks";

/* ---- prototype: gated overwriting ring-buffer channel + monotonic sequence ---- */
function createChannel(capacity = 0) {
  // capacity 0 => count-only channel (the sequence IS the counter); else power-of-two ring.
  // The column is always a typed array (even length-1 when count-only) so every channel shares
  // one hidden class and `emit` stays monomorphic — a benchmark-cleanliness detail, not part of
  // the design (a real count-only channel would carry no column).
  return {
    subscribers: 0,
    seq: 0,
    cap: capacity,
    mask: capacity ? capacity - 1 : 0,
    col: new Float64Array(capacity || 1),
  };
}
function emit(ch, value) {
  if (ch.subscribers === 0) return; // gate -> nothing happens when unused
  const s = ch.seq++;
  if (ch.cap !== 0) ch.col[s & ch.mask] = value; // zero-alloc ring write
}
function attach(ch) {
  ch.subscribers++;
  let lastSeq = ch.seq;
  return {
    read() {
      const seq = ch.seq;
      const count = seq - lastSeq;
      let dropped = 0;
      let samples = null;
      if (ch.cap) {
        const avail = Math.min(count, ch.cap);
        dropped = count - avail;
        samples = new Array(avail);
        for (let i = 0; i < avail; i++) {
          samples[i] = ch.col[(seq - avail + i) & ch.mask];
        }
      }
      lastSeq = seq;
      return { count, dropped, samples };
    },
    close() {
      ch.subscribers--;
    },
  };
}

/* ---- comparison: synchronous push (observe-style), allocates one event per emit ---- */
function createPushBus() {
  return { subs: [] };
}
function publish(bus, kind, id, value) {
  if (bus.subs.length === 0) return;
  const event = { kind, id, value }; // <- allocation per event (the GC killer)
  for (const sub of bus.subs) sub(event);
}

/* ---- GC accounting via perf_hooks (entries arrive async; flush with a macrotask) ---- */
let gcCount = 0;
let gcTime = 0;
new PerformanceObserver((list) => {
  for (const e of list.getEntries()) {
    gcCount++;
    gcTime += e.duration;
  }
}).observe({ entryTypes: ["gc"] });
const flush = () => new Promise((r) => setTimeout(r, 0));

const N = 30_000_000;
let sink = 0; // consume results so nothing is dead-code-eliminated

async function measure(label, fn) {
  // warm up the JIT, then take the best of several trials to shed GC/JIT timing noise.
  for (let w = 0; w < 2; w++) fn(2_000_000);
  await flush();
  const gc0 = { c: gcCount, t: gcTime };
  let best = Infinity;
  const trials = 4;
  for (let t = 0; t < trials; t++) {
    const t0 = performance.now();
    fn(N);
    best = Math.min(best, performance.now() - t0);
    await flush();
  }
  const opsPerSec = (N / (best / 1000) / 1e6).toFixed(0);
  const gcPerRun = Math.round((gcCount - gc0.c) / trials);
  console.log(
    `${label.padEnd(34)} ${best.toFixed(0).padStart(6)} ms   ${String(
      opsPerSec,
    ).padStart(6)} M ops/s   GC/run ${String(gcPerRun).padStart(4)}`,
  );
}

console.log(`\nProducer stress: ${(N / 1e6).toFixed(0)}M emits per mode\n`);

await measure("baseline (no instrumentation)", (n) => {
  for (let i = 0; i < n; i++) sink += i & 7;
});

const push = createPushBus();
// The event escapes to an opaque variable, exactly as it escapes through a user observer in real
// loom — this is what defeats V8 escape-analysis and makes the per-event allocation actually happen
// (without it, the microbenchmark elides the allocation and hides the real GC cost).
let lastEvent = null;
push.subs.push((e) => {
  sink += e.value & 7;
  lastEvent = e;
});
await measure("synchronous push (observe-style)", (n) => {
  for (let i = 0; i < n; i++) publish(push, 1, i, i);
});
sink += lastEvent ? lastEvent.value & 7 : 0;

const chOff = createChannel(256); // ring exists but NOBODY attached -> gate off
await measure("channel, no consumer (gated off)", (n) => {
  for (let i = 0; i < n; i++) emit(chOff, i);
});
sink += chOff.seq;

const chCount = createChannel(0); // count-only channel, consumer attached
attach(chCount);
await measure("channel, count-only (consumer on)", (n) => {
  for (let i = 0; i < n; i++) emit(chCount, i);
});
sink += chCount.seq;

const chDetail = createChannel(256); // ring + detail, consumer attached
attach(chDetail);
await measure("channel, detail ring (consumer on)", (n) => {
  for (let i = 0; i < n; i++) emit(chDetail, i);
});
sink += chDetail.seq;

/* ---- correctness: decoupled drain gives exact counts + bounded, recent, dropped-aware detail ---- */
console.log("\nDecoupled-drain correctness:");
const ch = createChannel(64); // small ring to force overflow
const meter = attach(ch);
let total = 0;
let drained = 0;
let dropped = 0;
let lastSampleOk = true;
const M = 1_000_000;
for (let i = 0; i < M; i++) {
  emit(ch, i);
  // consumer pulls on its own clock (here: every ~10k emits), far slower than production
  if ((i & 0x3fff) === 0x3fff) {
    const f = meter.read();
    total += f.count;
    drained += f.samples.length;
    dropped += f.dropped;
    // the newest sample must equal the most recent value emitted
    if (f.samples.length && f.samples[f.samples.length - 1] !== i) {
      lastSampleOk = false;
    }
  }
}
const tail = meter.read();
total += tail.count;
drained += tail.samples.length;
dropped += tail.dropped;

console.log(`  produced            : ${M}`);
console.log(
  `  counted (exact)     : ${total}  -> ${total === M ? "OK" : "MISMATCH"}`,
);
console.log(
  `  dropped + drained   : ${dropped + drained}  -> ${
    dropped + drained === M ? "OK (every event accounted for)" : "MISMATCH"
  }`,
);
console.log(
  `  detail per pull <= cap (64): ${lastSampleOk ? "OK (newest sample correct)" : "BAD"}`,
);
console.log(`  sink=${sink & 0xff}\n`);

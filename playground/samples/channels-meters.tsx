// channel() is a gated, overwriting ring: it records NOTHING until a meter
// attaches, and under load keeps only the newest samples — the producer
// never blocks on the consumer. meter() drains on its own clock; the
// "samples" view yields the ring, "count" is allocation-free rates. events
// (loom/observe) are loom's own built-in streams read the same way.
import { channel, meter, poll } from "loom";
import { events } from "loom/observe";

const taps = channel("play:tap", { capacity: 8, fields: ["x", "y"] });
const tapFrames = meter([taps], "samples");
const rates = meter([events.write, events.effect]);

const tick = poll(() => performance.now(), 500);

const report = () => {
  tick(); // re-read both meters on the poll's clock
  const frame = tapFrames.read()["play:tap"];
  const r = rates.read();
  const ring = (frame?.samples ?? [])
    .map((s) => `  (${String(s["x"])}, ${String(s["y"])})`)
    .join("\n");
  return [
    `taps since last read: ${frame?.count ?? 0} (dropped ${frame?.dropped ?? 0})`,
    `ring (newest ≤ 8):\n${ring || "  (tap the pad)"}`,
    "",
    `loom:write  ${r["loom:write"]?.count ?? 0} / 500ms`,
    `loom:effect ${r["loom:effect"]?.count ?? 0} / 500ms`,
  ].join("\n");
};

export default (
  <div class="col">
    <button
      type="button"
      style="width: 220px; height: 80px"
      onclick={(event) => taps.emit(event.offsetX, event.offsetY)}
    >
      tap pad — emits (x, y)
    </button>
    <pre class="log" style="min-width: 260px">
      {report}
    </pre>
    <p class="muted">
      Tap more than 8 times between reads and `dropped` counts the overwrites.
    </p>
  </div>
);

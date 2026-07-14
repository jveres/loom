// A signal IS the two-way binding: read it into `value`, write it from
// `oninput`. The "derived writable" recipe wraps a domain signal in UI
// vocabulary — a plain function that reads mapped and writes mapped, and
// behaves like a signal wherever a Read/State is expected.
import { state } from "loom";

const celsius = state(21);

// Reads map domain → label; writes map label → domain.
const fahrenheit = (next?: number): number => {
  if (next === undefined) return Math.round((celsius() * 9) / 5 + 32);
  if (Number.isFinite(next)) celsius(Math.round(((next - 32) * 5) / 9));
  return next;
};

export default (
  <div class="col">
    <label class="row">
      °C
      <input
        type="range"
        min="-30"
        max="50"
        value={celsius}
        oninput={(event) => celsius(event.currentTarget.valueAsNumber)}
      />
      <span class="mono">{celsius}</span>
    </label>
    <label class="row">
      °F
      <input
        type="number"
        value={fahrenheit}
        oninput={(event) => fahrenheit(event.currentTarget.valueAsNumber)}
      />
    </label>
    <p class="muted">
      Two controls, one signal — the wrapper subscribes through what it reads.
    </p>
  </div>
);

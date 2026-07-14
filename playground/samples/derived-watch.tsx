// computed() chains cache per step. watch() reacts to CHANGES only: the
// initial evaluation is silent and unchanged values are skipped — bump the
// quantity to the same value and no log line appears.
import { computed, state, update, watch } from "loom";

const price = state(18);
const quantity = state(2);
const subtotal = computed(() => price() * quantity());
const total = computed(() => Math.round(subtotal() * 1.27 * 100) / 100);

const log = state<readonly string[]>([]);
watch(total, (value, previous) => {
  log([`total ${previous} → ${value}`, ...log()].slice(0, 8));
});

const stepper = (label: string, value: typeof price) => (
  <label class="row">
    {label}
    <button type="button" onclick={() => update(value, (n) => n - 1)}>
      −
    </button>
    <span class="mono">{value}</span>
    <button type="button" onclick={() => update(value, (n) => n + 1)}>
      +
    </button>
  </label>
);

export default (
  <div class="col">
    <div class="row">
      {stepper("price", price)}
      {stepper("qty", quantity)}
    </div>
    <p class="mono">
      {() => `${price()} × ${quantity()} = ${subtotal()} → ${total()} gross`}
    </p>
    <pre class="log">{() => log().join("\n") || "(change something)"}</pre>
  </div>
);

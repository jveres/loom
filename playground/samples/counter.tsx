// update() writes fn(current) back WITHOUT subscribing the caller — the
// documented fix for self-retriggering effects. batch() coalesces many
// writes into one flush. Class maps take reactive reads as values.
import { batch, computed, state, update } from "loom";

const count = state(0);
const parity = computed(() => (count() % 2 === 0 ? "even" : "odd"));

export default (
  <div class="col">
    <div class="row">
      <button type="button" onclick={() => update(count, (n) => n - 1)}>
        −1
      </button>
      <strong class="mono">{count}</strong>
      <button type="button" onclick={() => update(count, (n) => n + 1)}>
        +1
      </button>
      <button
        type="button"
        onclick={() =>
          batch(() => {
            for (let i = 0; i < 10; i++) update(count, (n) => n + 1);
          })
        }
      >
        +10 in one batch
      </button>
      <button type="button" onclick={() => count(0)}>
        reset
      </button>
    </div>
    <p>
      The count is <em class={{ warn: () => count() > 9 }}>{parity}</em> and the
      batch button flushes effects once, not ten times.
    </p>
  </div>
);

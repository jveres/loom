// settle() observes every change but delivers only after a full quiet
// period — the debounce for search requests. settled() is the value form: a
// lagging Read with flush() as the host's "apply now" override.
import { state, update, watch } from "loom";
import { settled } from "loom/settle";

const query = state("");
const settledQuery = settled(query, 400);

const requests = state(0);
watch(settledQuery, () => update(requests, (n) => n + 1));

export default (
  <div class="col">
    <label class="row">
      Search
      <input
        placeholder="type in a burst…"
        oninput={(event) => query(event.currentTarget.value)}
      />
      <button type="button" onclick={() => settledQuery.flush()}>
        flush now
      </button>
    </label>
    <p class="mono">{() => `raw:     "${query()}"`}</p>
    <p class="mono">{() => `settled: "${settledQuery()}"`}</p>
    <p class="muted">
      {() =>
        `${requests()} request${requests() === 1 ? "" : "s"} — one per quiet` +
        " period, not one per keystroke."
      }
    </p>
  </div>
);

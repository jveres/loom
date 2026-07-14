// The deferred lane: re-runs ride idle time and COALESCE to the latest
// value; maxStale is the guaranteed-refresh floor under load. First runs
// stay synchronous. bind(el, fn, options) ties each effect to the view.
import "loom/defer";
import { state, update } from "loom";
import { bind } from "loom/dom";

const value = state(0);
const syncRuns = state(0);
const deferredRuns = state(0);

const view = (
  <div class="col">
    <button
      type="button"
      onclick={() => {
        for (let i = 0; i < 500; i++) update(value, (n) => n + 1);
      }}
    >
      write 500 times
    </button>
    <p class="mono">{() => `value          ${value()}`}</p>
    <p class="mono">{() => `sync runs      ${syncRuns()}`}</p>
    <p class="mono">{() => `deferred runs  ${deferredRuns()}`}</p>
    <p class="muted">
      Every un-batched write flushes the sync effect; the deferred effect
      collapses the burst into a handful of idle-time runs.
    </p>
  </div>
);

bind(view, () => {
  value();
  update(syncRuns, (n) => n + 1);
});
bind(
  view,
  () => {
    value();
    update(deferredRuns, (n) => n + 1);
  },
  { defer: true, maxStale: 500 },
);

export default view;

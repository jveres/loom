// By default a throwing effect propagates to whoever wrote the state and
// aborts the rest of that flush. configure({ onError }) installs a global
// boundary: the throw is contained and the OTHER effects still run.
// configure() returns the previous options, so the boundary is restored
// when this sample unmounts — no cross-sample pollution.
import { configure, state, update } from "loom";
import { bind, onUnmount } from "loom/dom";

const count = state(0);
const contained = state("(no error yet)");

const previous = configure({
  onError: (error, info) => {
    contained(`caught: ${String(error)} — from ${info?.kind ?? "?"}`);
  },
});

const view = (
  <div class="col">
    <button type="button" onclick={() => update(count, (n) => n + 1)}>
      write (every 3rd throws)
    </button>
    <p class="mono">{() => `count: ${count()}`}</p>
    <p class="mono">healthy effect runs: {() => `${count()} of ${count()}`}</p>
    <p class="warn mono">{contained}</p>
  </div>
);

bind(view, () => {
  if (count() > 0 && count() % 3 === 0) {
    throw new Error(`count hit ${count()}`);
  }
});

onUnmount(view, () => configure({ onError: previous.onError }));

export default view;

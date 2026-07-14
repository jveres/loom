// Two suspension grains. scope() owns everything created inside it —
// pause() suspends re-runs (writes just mark dirty), resume() delivers one
// coalesced catch-up. pause(el)/resume(el) do the same for every node-owned
// binding in a DOM subtree you already built.
import { scope, state, update } from "loom";
import { onUnmount, pause, resume } from "loom/dom";

const seconds = state(0);
const id = setInterval(() => update(seconds, (n) => n + 1), 500);

let scopedPanel!: HTMLElement;
const panel = scope(() => {
  scopedPanel = <p class="mono">scope tick: {seconds}</p>;
});

const subtree = <p class="mono">subtree tick: {seconds}</p>;

const view = (
  <div class="col">
    <div class="row">
      <button type="button" onclick={() => panel.pause()}>
        pause scope
      </button>
      <button type="button" onclick={() => panel.resume()}>
        resume scope
      </button>
      <button type="button" onclick={() => pause(subtree)}>
        pause subtree
      </button>
      <button type="button" onclick={() => resume(subtree)}>
        resume subtree
      </button>
    </div>
    {scopedPanel}
    {subtree}
    <p class="muted">
      Pause one, let it fall behind, resume — it catches up in ONE run with the
      latest value, not one run per missed tick.
    </p>
  </div>
);

onUnmount(view, () => clearInterval(id));

export default view;

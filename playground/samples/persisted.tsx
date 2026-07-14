// persisted() is a plain State<T> backed by localStorage: read-validate
// once at creation, write-through on set. Reload the page — the note and
// the count are still here. validate() drops a corrupt stored value instead
// of leaking it into the app.
import { persisted } from "loom/dom";

const note = persisted("loom-playground:note", "");
const runs = persisted("loom-playground:runs", 0, {
  validate: (n) => Number.isInteger(n) && n >= 0,
});
runs(runs() + 1);

export default (
  <div class="col">
    <label class="row">
      Note
      <input
        value={note}
        placeholder="stored on every keystroke"
        oninput={(event) => note(event.currentTarget.value)}
      />
    </label>
    <p class="mono">{() => `this sample has run ${runs()} times`}</p>
    <button
      type="button"
      onclick={() => {
        note("");
        runs(0);
      }}
    >
      clear both
    </button>
    <p class="muted">
      An ordinary signal otherwise — update/watch/bindings all compose.
    </p>
  </div>
);

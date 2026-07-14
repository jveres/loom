// A pattern from building a real editor on loom: the Save control derives
// its WHOLE voice from two signals — dirty and busy. The laws that made it
// trustworthy: disabled means DISABLED (no hover paint, no live neighbors),
// the label is the status, and dirty is computed from the data, never set
// by hand.
import { computed, state } from "loom";

const saved = state("The quick brown fox");
const draft = state(saved());
const busy = state(false);
const dirty = computed(() => draft() !== saved());

const save = () => {
  busy(true);
  setTimeout(() => {
    saved(draft());
    busy(false);
  }, 700);
};

const editor = (
  <textarea
    rows="3"
    cols="40"
    oninput={(event) => draft(event.currentTarget.value)}
  >
    {saved()}
  </textarea>
) as HTMLTextAreaElement;

export default (
  <div class="col">
    {editor}
    <div class="row">
      <button
        type="button"
        class={{ primary: dirty }}
        disabled={() => !dirty() || busy()}
        onclick={save}
      >
        {() => (busy() ? "Saving…" : dirty() ? "Save" : "Saved")}
      </button>
      <button
        type="button"
        disabled={() => !dirty() || busy()}
        onclick={() => {
          editor.value = saved();
          draft(saved());
        }}
      >
        Revert
      </button>
      <span class="muted mono">
        {() => (dirty() ? "unsaved changes" : "clean")}
      </span>
    </div>
  </div>
);

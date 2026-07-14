// The playground shell — itself a loom app, and deliberately dogfooding the
// surface it demonstrates: persisted() remembers the open sample, settled()
// debounces the editor buffer into the compile pipeline (flush() applies a
// sample switch instantly), and watch() drives remounts.
import { computed, configure, state, watch } from "loom";
import { persisted } from "loom/dom";
import { settled } from "loom/settle";
import "./playground.css";
import { type RunningSample, runSample } from "./runner.js";
import { categories, type Sample, samples } from "./samples.js";

// The inspector sample should see every node, including the shell's own.
configure({ inspect: true });

const first = samples[0];
if (!first) throw new Error("no samples registered");

const selectedId = persisted("loom-playground:open", first.id, {
  validate: (id) => samples.some((s) => s.id === id),
});
const current = computed(
  (): Sample => samples.find((s) => s.id === selectedId()) ?? first,
);

// Edits are per-sample and ephemeral (reset restores the pristine source).
const edits = new Map<string, string>();
const buffer = state(current().source);
const compiled = settled(buffer, 350);

const editor = (
  <textarea class="pg-editor" spellcheck={false} />
) as HTMLTextAreaElement;
editor.value = buffer();
editor.addEventListener("input", () => {
  edits.set(selectedId(), editor.value);
  buffer(editor.value);
});
editor.addEventListener("keydown", (event) => {
  if (event.key !== "Tab") return;
  event.preventDefault();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  editor.value = `${editor.value.slice(0, start)}  ${editor.value.slice(end)}`;
  editor.selectionStart = editor.selectionEnd = start + 2;
  edits.set(selectedId(), editor.value);
  buffer(editor.value);
});

const loadSample = (sample: Sample) => {
  const source = edits.get(sample.id) ?? sample.source;
  editor.value = source;
  buffer(source);
  compiled.flush(); // a sample switch applies NOW; only typing settles
};

watch(current, loadSample);

// ---- compile & mount ----

const error = state<string | null>(null);
const stage = (<div class="pg-stage" />) as HTMLElement;
let running: RunningSample | null = null;

const mount = (source: string) => {
  running?.dispose();
  running = null;
  stage.textContent = "";
  try {
    running = runSample(source);
    stage.append(running.el);
    error(null);
  } catch (thrown) {
    error(thrown instanceof Error ? thrown.message : String(thrown));
  }
};

watch(compiled, mount);
mount(buffer());

// ---- shell ----

const sidebar = (
  <nav class="pg-side">
    {categories.map((category) => (
      <section>
        <h2>{category.title}</h2>
        {category.samples.map((sample) => (
          <button
            type="button"
            class={{ active: () => selectedId() === sample.id }}
            onclick={() => selectedId(sample.id)}
          >
            {sample.title}
          </button>
        ))}
      </section>
    ))}
  </nav>
);

document.getElementById("app")?.append(
  <div class="pg-root">
    <header class="pg-header">
      <h1>Loom playground</h1>
      <span class="pg-note">
        edit on the left, the run remounts after a quiet moment — every sample
        is plain loom, compiled in the browser
      </span>
    </header>
    <div class="pg-body">
      {sidebar}
      <section class="pg-editor-pane">
        <div class="pg-pane-bar">
          <span>{() => current().title}</span>
          <span class="spacer" />
          <button
            type="button"
            onclick={() => {
              edits.delete(selectedId());
              loadSample(current());
            }}
          >
            reset
          </button>
        </div>
        {editor}
      </section>
      <section class="pg-view-pane">
        <div class="pg-pane-bar">
          <span
            class={{ "pg-status": true, "is-error": () => error() !== null }}
          >
            {() => error() ?? "running"}
          </span>
        </div>
        {stage}
      </section>
    </div>
  </div>,
);

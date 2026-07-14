// state() is a callable signal: read with name(), write with name(next).
// computed() derives lazily and caches. A reactive read dropped into JSX —
// {greeting} or {() => ...} — becomes a live text node; nothing else re-runs.
import { computed, state } from "loom";

const name = state("world");
const greeting = computed(() => `Hello, ${name() || "stranger"}!`);

export default (
  <div class="col">
    <label class="row">
      Name
      <input
        value={name}
        oninput={(event) => name(event.currentTarget.value)}
      />
    </label>
    <h2>{greeting}</h2>
    <p class="muted">
      {() => `${name().length} characters — only this text node re-renders.`}
    </p>
  </div>
);

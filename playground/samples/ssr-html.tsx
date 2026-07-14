// loom/html renders STATIC HTML strings — for SSR and SSG. The html``
// template escapes every interpolation (see the default angle brackets
// arrive as entities); renderToString serializes. Static JSX via the
// `/** @jsxImportSource loom/html */` pragma builds the same trees.
import { state } from "loom";
import { html, renderToString, unsafeHtml } from "loom/html";

const name = state("<world>");

const output = () =>
  renderToString(
    html`<main>
  <h1>Hello, ${name()}!</h1>
  ${unsafeHtml("<p>unsafeHtml passes trusted markup through verbatim.</p>")}
</main>`,
  );

export default (
  <div class="col">
    <label class="row">
      name
      <input
        value={name}
        oninput={(event) => name(event.currentTarget.value)}
      />
    </label>
    <pre class="log">{output}</pre>
    <p class="muted">
      No live DOM, no event handlers — a serializer, not a renderer.
    </p>
  </div>
);

<p align="center">
  <img src="./assets/loom.svg" alt="Loom" width="96" height="96">
</p>

# Loom

Loom is a small reactive UI runtime with callable signals and real DOM nodes.
It needs no compiler transform and has no runtime dependencies. JSX returns DOM
nodes; reactive bindings update those nodes in place.

This development branch implements the breaking API consolidation. The package
version remains `0.5.0` until release selection. Existing consumers must follow
the [migration guide](docs/migration.md) before adopting this branch.

## Start with signals

Call a state without arguments to read it, or with a value to write it. Computed
reads cache their results, and effects track the reads in their bodies.

```ts
import { computed, effect, state } from "loom";

const count = state(0);
const label = computed(() => `Count: ${count()}`);
const stop = effect(() => console.log(label()));
count(1);
stop();
```

State uses strict equality. Replace an object to notify its consumers, or use
`mutate` for an in-place change and notification. `update` computes a replacement;
`trigger` explicitly notifies readers of a state without replacing its value.

## Build a view

Use the automatic JSX runtime with `jsx: "react-jsx"` and
`jsxImportSource: "loom"` in your TypeScript configuration. Components run once.
Pass a reactive reader wherever a DOM binding must stay live.

```tsx
import { computed, state } from "loom";
import { remove } from "loom/dom";

const count = state(0);
const label = computed(() => `Count: ${count()}`);
const button = <button onclick={() => count(count() + 1)}>{label}</button>;
document.body.append(button);

// When the view ends, dispose its bindings and detach its nodes.
remove(button);
```

Without JSX, use `h("button", props, children)` and `text(read)`. Native event
props such as `onclick` are supported. Install tap recognition explicitly with
`onTap` from `loom/events`.

## Choose a family

Each operation has one canonical import path. The root contains reactivity;
other families add model utilities, DOM construction, or browser behavior.

| Import | Responsibility |
| --- | --- |
| `loom` | Signals, computed reads, effects, watches, scopes, and configuration. |
| `loom/model` | Schema-based keyed state, lenses, revisions, and weak memoization. |
| `loom/dom` | Nodes, bindings, structural rendering, and tree ownership. |
| `loom/browser` | Subscriber-owned browser reads and explicit observers. |
| `loom/events` | Native subscriptions, taps, press behavior, and pointer sessions. |
| `loom/layout` | Geometry, node placement, scrolling, and scroll memory. |
| `loom/motion` | CSS completion, height folding, and scroll fades. |
| `loom/schedule` | Coalescers, frame delays, event races, and quiet-period watches. |
| `loom/storage` | Validated storage slots and explicit persistence bindings. |
| `loom/virtual-list` | Standalone fixed-height windowing. |
| `loom/async` | Async resources and pending-work aggregation. |
| `loom/defer` | Side-effect import that installs deferred effect scheduling. |
| `loom/observe` | Instrumentation, inspection, channels, and meters. |
| `loom/devtools` | Inspector UI. |
| `loom/html` | Escaped server-side HTML construction and serialization. |

See the [API index](docs/api.md) for exports and contracts, and the
[support policy](docs/support.md) for environment requirements. Package exports
encapsulate internal source files; deep imports are unsupported.

## Own work explicitly

Reactive scopes own their effects. DOM installations belong to their target
nodes, independently of whichever reactive scope was active during construction.
A binding returns an idempotent `Stop`, so you can end it early.

```ts
import { state } from "loom";
import { bindClass, h, remove } from "loom/dom";
import { listen } from "loom/events";

const selected = state(false);
const button = h("button", null, "Select");
const stopClass = bindClass(button, "selected", selected);
listen(button, "click", () => selected(!selected()), { owner: button });
document.body.append(button);
stopClass();
remove(button);
```

Use `dispose(root)` to stop a tree's owned work, `remove(node)` to dispose and
detach it, and `resourceGroup` for construction that needs explicit grouped
teardown. Native `node.remove()` does not perform Loom disposal. `onUnmount`
means Loom disposal, not every browser disconnection.

Scope `pause`/`resume` affects scope-owned reactive work. DOM `pause(node)` and
`resume(node)` affect reactive bindings in a subtree. Neither implicitly pauses
native listeners or manually owned scheduling and storage controllers.

A controller's `stop()` is terminal. `cancel()` discards pending work but permits
later requests. `flush()` delivers pending work now. An abort signal adds a
termination condition; already-aborted signals install no work. Stopping does
not invoke a success callback.

## Keep persistence with the model

Create state separately from storage. `bindStorage` loads valid data without
writing it back, then watches changes for its explicit lifetime. The initial
value survives absent, invalid, or inaccessible storage.

```ts
import { state } from "loom";
import { bindStorage, codecs, storageSlot } from "loom/storage";

const count = state(0);
const binding = bindStorage(count, storageSlot("count", codecs.number()), {
  delayMs: 100,
});
count(2);
binding.flush(); // Reports whether the pending write succeeded.
binding.stop();
count(3); // The state remains usable after persistence ends.
```

Every storage slot requires a decoder. Use `codecs.json(typeGuard)` for
structured JSON, or provide `parse` and optional `serialize`/`validate` functions.
Validation applies when loading; storing accepts the typed value and reports
serialization/storage failure. `undefined` represents a missing or invalid
load. Cross-tab synchronization belongs to the application.

## Update immutable rows

Keys preserve DOM identity. A row replacement with the same key calls `update`
when supplied; otherwise the existing rendered row stays as it is.

```ts
import { state } from "loom";
import { h, list } from "loom/dom";

const rows = state<readonly { id: number; title: string }[]>([]);
const host = h("div");
const stop = list(host, rows, {
  key: row => row.id,
  render: row => h("p", null, row.title),
  update: (node, row) => { node.textContent = row.title; },
});
rows([{ id: 1, title: "First" }]);
rows([{ id: 1, title: "Revised" }]);
stop();
```

List readers and key selectors track dependencies. Renderers, update callbacks,
native events, lifecycle callbacks, and imperative operations run untracked.
Install a binding inside a renderer if a particular row needs reactive reads.

## Schedule work

Frame helpers accept a window for iframe or popup work. Without a frame
scheduler, they use cancellable microtask delivery.

```ts
import { afterFrames, frameCoalescer } from "loom/schedule";

const abort = new AbortController();
const work = frameCoalescer(() => console.log("frame"), {
  window,
  signal: abort.signal,
});
work.request();
work.request(); // Coalesces into the pending frame.
work.cancel();
afterFrames(2, () => console.log("two frames"), { window, signal: abort.signal });
abort.abort();
```

`watchSettled(read, callback, { delayMs })` observes the initial value without a
callback, then delivers changed values after quiet time. It exposes `cancel`,
`flush`, and `stop` and does not inherit a transient view scope.

## Render on the server

The HTML runtime escapes dynamic values. Reserve `unsafeHtml` for content that
your application has already made safe to insert.

```tsx
/** @jsxImportSource loom/html */
import { renderToString } from "loom/html";

const title = "A <safe> title";
const output = renderToString(<article><h1>{title}</h1></article>);
console.log(output);
```

## Install and develop

Loom is distributed through GitHub with committed ESM bundles and declarations.
Pin a reviewed commit for reproducible installations. This branch introduces
breaking changes and has not been published as a release.

```sh
pnpm add github:jveres/loom
```

Development uses TypeScript 7. The shared source-entry map drives local aliases;
package checks also compile consumers outside the repository against a tarball.

```sh
pnpm install
pnpm run check
pnpm run lint
pnpm test
pnpm run build
pnpm run check:api
pnpm run check:package
pnpm run samples
pnpm run size
pnpm run bench
pnpm run dev
```

Open `/demo/` for the UI demo or `/bench/` for browser workloads. Rebuild `dist`
after source changes. See [architecture](ARCHITECTURE.md), the
[implementation plan](docs/api-consolidation-plan.md), and
[measurement notes](docs/api-measurements.md) for design and verification details.

## License

[MIT](LICENSE). The vendored `alien-signals` propagation algorithm retains its
MIT notice in `src/core/graph.ts`.

# Loom

Loom is a tiny runtime reactive UI core for building simple and complex
reactive interfaces with callable state cells, computed reads, effects,
batched updates, and a small DOM binding layer.

> **Note:** Loom is under active development. The API is intentionally small
> and can still change while the core and inspector surface are refined.

## Install

This repository is currently private and developed directly from source.
Install dependencies with `pnpm`:

```sh
pnpm install
```

Run the standard checks:

```sh
pnpm run check
pnpm run lint
pnpm test
pnpm run bench
```

Run the dev server:

```sh
pnpm run dev
```

Open `/demo/` for the realtime UI demo, or `/bench/` for the browser
benchmark.

## Core API

Import reactive primitives from `loom`. State cells are callable functions:
calling without an argument reads the value, and calling with an argument
writes the next value.

```ts
import { batch, computed, effect, fields, state, update } from "loom";

const count = state(0);
const doubled = computed(() => count() * 2);

const stop = effect(() => {
  console.log(doubled());
});

batch(() => {
  count(1);
  update(count, (value) => value + 1);
});

stop();
```

The core exports these functions:

- `state(initial, options?)` creates a callable state cell.
- `signal(initial)` is an alias for `state(initial)`.
- `computed(getter, options?)` creates a cached derived read.
- `effect(fn, options?)` runs `fn` immediately and again when its dependencies
  change.
- `batch(fn)` groups writes and flushes effects once after the batch.
- `untrack(fn)` reads state inside `fn` without subscribing the active effect.
- `trigger(read)` notifies subscribers after in-place mutation.
- `update(source, fn)` writes `fn(source())` back to a state cell.
- `mutate(source, fn)` mutates an object value and then triggers subscribers.
- `fields(object, options?)` creates one state cell per enumerable string key.
- `observe(observer, options?)` subscribes to lazy diagnostic events.
- `inspect()` returns a snapshot of the current reactive graph.
- `depsOf(source)` returns inspected dependencies for a state, computed read, or
  effect stop handle.

The core exports these types:

- `State<T>` is a callable read/write cell.
- `Read<T>` is a read function.
- `Stop` is a disposer function.
- `EffectFn` is a reusable effect callback type.
- `Fields<T>` maps enumerable string keys to `State<T[K]>`.
- `InspectNode` and `InspectSnapshot` describe graph snapshots.
- `ObserveEvent` describes lazy diagnostic events.

Pass `{ label, namespace }` to `state`, `computed`, `effect`, or `fields` when
you want meaningful names in tooling. Pass `{ internal: true }` for Loom-owned
tooling state that must not appear in app-level event streams by default.

## Object fields

Use `fields()` when you want fine-grained updates for a plain object. Each
enumerable string key becomes its own state cell.

```ts
const model = fields(
  {
    title: "Hello",
    likes: 0,
  },
  { label: "post", namespace: "demo" },
);

effect(() => {
  document.title = `${model.title()} (${model.likes()})`;
});

model.likes(1);
```

`fields()` rejects non-plain objects such as arrays and dates. Symbol keys are
not exposed because the runtime uses enumerable string keys. When you pass a
`label`, each field is labeled as `label.key`, for example `post.likes`.

## In-place mutation

Loom state compares values by identity. When you mutate an object or array in
place, use `trigger()` or `mutate()` to notify dependents.

```ts
const rows = state<string[]>([]);

effect(() => {
  console.log(rows().length);
});

rows().push("first");
trigger(rows);

mutate(rows, (value) => {
  value.push("second");
});
```

## DOM API

Import DOM helpers from `loom/dom`. The DOM layer creates nodes, binds reactive
text, attributes, classes, and styles, reconciles keyed lists, and disposes
owned effects when nodes are removed.

```ts
import { state } from "loom";
import { attr, classed, h, style, text } from "loom/dom";

const hot = state(false);
const label = state("Ready");

document.body.append(
  h(
    "button",
    {
      "aria-pressed": attr("aria-pressed", hot),
      class: classed("hot", hot),
      style: style("opacity", () => (hot() ? 1 : 0.65)),
      onClick: () => hot(!hot()),
    },
    [text(label)],
  ),
);
```

The DOM entrypoint exports these functions:

- `h(tag, props, children)` creates an element.
- `text(read)` creates a text node bound to a reactive read.
- `attr(name, read)` creates an explicit reactive attribute binding.
- `classed(name, read)` creates an explicit reactive class binding.
- `style(name, read)` creates an explicit reactive style binding.
- `list(container, read, options)` reconciles a keyed list.
- `dispose(root)` disposes effects owned by a node subtree.
- `remove(node)` disposes a node subtree and removes it from the DOM.

`list()` reorders keyed nodes by default. Pass `reorder: () => false` when an
external layout system positions existing keyed nodes and only needs Loom to
append new keys and remove missing keys.

```ts
list(container, rows, {
  key: (row) => row.id,
  render: (row) => h("article", null, row.title),
  reorder: () => false,
});
```

## Observability

Loom exposes a lazy core observability surface for tools and tests. Event
objects are created only when a matching observer is active.

```ts
import { depsOf, effect, inspect, observe, state } from "loom";

const stopObserve = observe((event) => {
  console.log(event.kind);
});

const count = state(0, { label: "counter.count", namespace: "demo" });
const stop = effect(
  () => {
    document.title = String(count());
  },
  { label: "counter.title", namespace: "demo" },
);

console.log(depsOf(stop));
console.log(inspect().nodes);

stopObserve();
stop();
```

Observers exclude internal nodes by default. Pass
`{ includeInternal: true }` when a tool needs to inspect Loom-owned work.

## JSX

Loom supports JSX through standard automatic JSX runtime entrypoints. The
browser runtime returns live DOM nodes and uses the same DOM binding helpers as
`h()`.

Configure TypeScript for browser JSX with `jsxImportSource: "loom"`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "loom"
  }
}
```

If your bundler transpiles TSX directly, configure it to use the same automatic
runtime. This repository sets Vite's `oxc.jsx.importSource` to `"loom"`.

JSX doesn't create a virtual DOM, and function components are plain functions.
Reactive reads can be used directly as children, attribute values, and class
map values.

```tsx
import { state } from "loom";

const count = state(0);

function Counter() {
  return (
    <button
      type="button"
      aria-pressed={() => count() > 0}
      class={{ active: () => count() > 0 }}
      onClick={() => count(count() + 1)}
    >
      {count}
    </button>
  );
}

document.body.append(<Counter />);
```

Class values can be strings, arrays, or object maps. Object map values can be
plain booleans or reactive reads.

```tsx
const running = state(false);

<section
  class={[
    "shell",
    "compact",
    { interactive: true, running, idle: () => !running() },
  ]}
/>
```

Style values can be strings, arrays, object maps, or explicit `style()`
bindings. Object keys can use camelCase or CSS property names. Reactive style
reads can return `null` to remove the property.

```tsx
import { style } from "loom/dom";

const active = state(false);

<section
  style={[
    "font-size:12px",
    { backgroundColor: "white" },
    { opacity: () => (active() ? 1 : 0.5) },
    style("color", () => (active() ? "red" : null)),
  ]}
/>
```

### Reactive JSX expressions

Loom is runtime-only. JSX expressions run once when the DOM node is created, so
derived reactive values need a read function or `computed()`.

```tsx
import { computed, state } from "loom";

const running = state(false);
const label = computed(() => (running() ? "Stop chaos" : "Start chaos"));

<button class={{ running }} aria-pressed={running}>
  {label}
</button>;

<button>{() => (running() ? "Stop chaos" : "Start chaos")}</button>;
```

Use these entrypoints for browser JSX:

- `loom/jsx-runtime` powers browser JSX.
- `loom/jsx-dev-runtime` powers browser JSX in development mode.

## SSR and SSG

Use `loom/html` when you want static HTML for server-side rendering or
static-site generation. This runtime escapes interpolated text, supports
components and fragments, serializes common attributes, and omits event
handlers because there is no live DOM.

```tsx
/** @jsxImportSource loom/html */
import { renderToString } from "loom/html";

function Page(props: { title: string }) {
  return (
    <main>
      <h1>{props.title}</h1>
      <p>Generated with Loom.</p>
    </main>
  );
}

const html = renderToString(<Page title="Docs" />);
```

Use these entrypoints for static HTML:

- `loom/html` exports `html`, `raw`, and `renderToString`.
- `loom/html/jsx-runtime` powers static HTML JSX.
- `loom/html/jsx-dev-runtime` powers static HTML JSX in development mode.

## Demo and benchmark

The demo is a realtime stress UI written in Loom JSX. It exercises state cells,
object fields, computed values, effects, keyed list reconciliation, direct JSX
text and attribute bindings, class map bindings, cleanup through DOM disposal,
and the browser JSX runtime.

The browser benchmark is available from the dev server at `/bench/`. It uses a
js-framework-benchmark style table workload and compares Loom DOM bindings
against a hand-written vanilla DOM baseline on the same machine.

The CLI benchmark compares Loom against native `alien-signals` primitives under
a full-chaos workload. The benchmark intentionally includes:

- `loom`, using `fields()`.
- `loom manual`, using manually declared state cells.
- `alien native`, using native `alien-signals` cells.

Run it with:

```sh
pnpm run bench
```

## Design notes

Loom uses `alien-signals` as the reactive graph implementation detail. The
public API stays small: callable state cells, computed reads, effects, batching,
manual triggers, object field cells, and a lazy observability surface.

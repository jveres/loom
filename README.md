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

Run the demo:

```sh
pnpm run dev
```

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

- `state(initial)` creates a callable state cell.
- `signal(initial)` is an alias for `state(initial)`.
- `computed(getter)` creates a cached derived read.
- `effect(fn)` runs `fn` immediately and again when its dependencies change.
- `batch(fn)` groups writes and flushes effects once after the batch.
- `untrack(fn)` reads state inside `fn` without subscribing the active effect.
- `trigger(read)` notifies subscribers after in-place mutation.
- `update(source, fn)` writes `fn(source())` back to a state cell.
- `mutate(source, fn)` mutates an object value and then triggers subscribers.
- `fields(object)` creates one state cell per enumerable string key.

The core exports these types:

- `State<T>` is a callable read/write cell.
- `Read<T>` is a read function.
- `Stop` is a disposer function.
- `EffectFn` is a reusable effect callback type.
- `Fields<T>` maps enumerable string keys to `State<T[K]>`.

## Object fields

Use `fields()` when you want fine-grained updates for a plain object. Each
enumerable string key becomes its own state cell.

```ts
const model = fields({
  title: "Hello",
  likes: 0,
});

effect(() => {
  document.title = `${model.title()} (${model.likes()})`;
});

model.likes(1);
```

`fields()` rejects non-plain objects such as arrays and dates. Symbol keys are
not exposed because the runtime uses enumerable string keys.

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

Import DOM helpers from `loom/dom`. The DOM layer is small and explicit:
helpers create nodes, bind text, bind attributes, bind classes, reconcile keyed
lists, and dispose owned effects when nodes are removed.

```ts
import { state } from "loom";
import { classed, h, text } from "loom/dom";

const hot = state(false);
const label = state("Ready");

document.body.append(
  h("button", { class: classed("hot", hot), onClick: () => hot(!hot()) }, [
    text(label),
  ]),
);
```

The DOM entrypoint exports these functions:

- `h(tag, props, children)` creates an element.
- `text(read)` creates a text node bound to a reactive read.
- `attr(name, read)` creates a reactive attribute binding.
- `classed(name, read)` creates a reactive class binding.
- `style(name, read)` creates a reactive style binding.
- `list(container, read, options)` reconciles a keyed list.
- `dispose(root)` disposes effects owned by a node subtree.
- `remove(node)` disposes a node subtree and removes it from the DOM.

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

```tsx
import { state } from "loom";
import { text } from "loom/dom";

const count = state(0);

function Counter() {
  return (
    <button type="button" onClick={() => count(count() + 1)}>
      {text(count)}
    </button>
  );
}

document.body.append(<Counter />);
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
object fields, computed values, effects, keyed list reconciliation, class
bindings, text bindings, manual mutation triggers, cleanup through DOM
disposal, and the browser JSX runtime.

The benchmark compares Loom against native `alien-signals` primitives under a
full-chaos workload. The benchmark intentionally includes:

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
manual triggers, and object field cells.

The core does not expose inspector or compatibility hooks yet. Those surfaces
can be added on top of the current primitives once the reactive core and demo
workload stay stable.

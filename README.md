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
- `computed(getter, options?)` creates a cached derived read.
- `effect(fn, options?)` runs `fn` immediately and again when its dependencies
  change.
- `batch(fn)` groups writes and flushes effects once after the batch.
- `scope(fn, options?)` groups the effects (and `polled`/`source` resources)
  created inside `fn` so they can be disposed (`stop()`) or suspended (`pause()`
  / `resume()`) together. Scopes nest, and an effect runs only while no scope in
  its parent chain is paused. `options` (`internal` / `namespace` / `label`)
  become defaults for every node created in the scope. Returns
  `{ stop, pause, resume }`.
- `untrack(fn)` reads state inside `fn` without subscribing the active effect.
- `trigger(read)` notifies subscribers after in-place mutation.
- `update(source, fn)` writes `fn(source())` back to a state cell.
- `mutate(source, fn)` mutates an object value and then triggers subscribers.
- `polled(sample, ms, options?)` re-samples `sample()` every `ms` ms into a
  value-deduped reactive source; bindings re-run only when the value changes.
  Bridges imperative/external data (clocks, counters, polled APIs) into the
  graph. Returns `{ read, stop }`.
- `source(connect, initial, options?)` creates a **lazy** external source:
  `connect(set)` runs when the source gains its first subscriber and the
  returned teardown runs when it loses its last, so the producer (event
  listener, timer, `PerformanceObserver`, socket) is only live while observed.
  Returns a read function.
- `fields(object, options?)` creates one state cell per enumerable string key.
- `channel(name, options?)` declares a named observability channel — a gated,
  overwriting ring buffer that records cheaply (no allocation until metered) and
  is drained, not pushed. The core's own reactive events are built-in channels
  (`channels.read/write/compute/effect/flush/create/dispose`).
- `meter(channels)` attaches a pull-based meter; `read()` returns a Frame per
  channel (`{ count, dropped, samples }`) since the last read. A meter is a scope
  resource, so it detaches on `scope.pause()`.
- `configure({ inspect, onError })` sets runtime options. `inspect` toggles the
  inspection layer — **off by default**, so node creation allocates no metadata
  (zero cost); turn it on once at startup, before creating the nodes you want
  visible, when you need tooling. `onError` installs a global effect error
  boundary (see below).
- `inspect()` returns a snapshot of the current reactive graph (empty unless
  inspection is enabled). Pass `{ active: true }` to skip state/computed cells
  with no subscribers — idle cells and "ghosts" (cells of a removed object that
  are unreachable but not yet GC'd); effects are always kept.
- `inspectResources()` returns a live census `{ states, computeds, effects,
  views, sources, scopes, channels, idle }` — one cheap walk, no per-node
  allocation; nothing runs on the reactive hot path. `views` are the DOM bindings
  (effects in the `"dom"` namespace); `effects` are your app effects; `idle` is
  the number of state/computed cells nothing currently reads (a count that keeps
  climbing under steady state hints at a leak).
- `depsOf(source)` returns inspected dependencies for a state, computed read, or
  effect stop handle.

The core exports these types:

- `State<T>` is a callable read/write cell.
- `Read<T>` is a read function.
- `Stop` is a disposer function.
- `Scope` is a scope handle: `{ stop, pause, resume }`.
- `Polled<T>` is a polled source: `{ read, stop }`.
- `SourceConnect<T>` is a lazy source's `(set) => teardown` wiring function.
- `EffectFn` is a reusable effect callback type.
- `ErrorHandler` is the `configure({ onError })` boundary signature.
- `Fields<T>` maps enumerable string keys to `State<T[K]>`.
- `InspectNode` and `InspectSnapshot` describe graph snapshots.
- `ResourceCounts` is the `inspectResources()` census result.
- `Channel` is a named observability channel; `Meter` drains channels;
  `Frame` is a per-channel `{ count, dropped, samples }`; `ChannelOptions`
  configures `{ capacity, fields }`.

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

## External sources

Bridge imperative or external data into the graph. `polled()` re-samples on an
interval (eager, deduped); `source()` is lazy — it connects on first subscriber
and disconnects on last, so the producer only runs while observed.

```ts
import { effect, polled, source } from "loom";

// Eager: sample performance.now() every 250ms (unchanged samples don't re-run readers).
const clock = polled(() => Date.now(), 250);
const stopClock = effect(() => console.log(clock.read()));
// ... later: stopClock(); clock.stop();

// Lazy: a media query that only listens while something reads it.
const darkMode = source<boolean>((set) => {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => set(mq.matches);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange); // runs when unobserved
}, matchMedia("(prefers-color-scheme: dark)").matches);

const stop = effect(() => console.log("dark:", darkMode()));
stop(); // last subscriber gone -> the listener is removed automatically
```

The dev inspector uses both: a `polled()` heartbeat drives its per-tick metric
math, and the CLS/LCP/INP web vitals are `source()`s whose `PerformanceObserver`s
connect and disconnect with the panel — no manual teardown.

## Scopes

`scope(fn)` groups the effects created in `fn` so a whole subtree can be torn
down or suspended at once. `stop()` disposes; `pause()` suspends runs (changes
just mark effects dirty) and `resume()` re-runs the ones that went dirty — so a
hidden panel does no reactive work without losing its state or DOM.

```ts
import { effect, scope, state } from "loom";

const active = state(true);

const panel = scope(() => {
  effect(() => render(active())); // bindings owned by this scope
});

panel.pause(); // hidden: changes to `active` are recorded but don't re-render
panel.resume(); // shown again: re-renders once with the latest value
panel.stop(); // gone for good: every effect in the scope is disposed
```

Scopes nest, and an effect runs only while no scope in its parent chain is
paused. The dev inspector uses this: one scope wraps the whole panel (paused when
minimized) with a nested scope around the stats tab (paused when it isn't the
active tab). Pausing the outer scope freezes everything; resuming it leaves the
stats scope suspended if its tab is still hidden — no manual coordination.

```ts
let stats: Scope;
const inspector = scope(() => {
  buildHeader();
  stats = scope(() => buildStatsTab()); // nested child scope
  buildOtherTabs();
});

inspector.pause(); // minimized: freezes the whole panel, stats included
inspector.resume(); // restored: stats stays suspended if its tab is hidden
stats!.pause(); // leaving the stats tab on its own
```

Scopes own resources, not just effects: a `polled()` or `source()` created inside
a scope is suspended with it too. Pausing the scope clears a `polled()`'s timer
(resuming takes a fresh sample) and disconnects a `source()`'s producer even
though its paused subscribers stay linked (resuming reconnects it); stopping the
scope tears them all down. So a hidden subtree stops not only re-rendering but
also the timers and observers feeding it.

A scope's second argument sets default options for everything created inside it —
handy for marking an entire subsystem `internal` and giving it a `namespace`
without repeating the options on every primitive. A node's own options win, and
nested scopes inherit and can override:

```ts
import { effect, fields, scope, state } from "loom";

scope(
  () => {
    const settings = fields({ theme: "dark", zoom: 1 }); // cells inherit the defaults
    effect(() => apply(settings.theme())); // so does this effect
  },
  { internal: true, namespace: "panel" },
);
```

The dev inspector relies on this: its panel scope is created with
`{ internal: true, namespace: "loom-inspector" }`, so every binding, the
heartbeat, the web-vital sources and the heap timer are filtered from the
observability it reports — without passing options to each one.

## Error handling

By default an effect that throws propagates the error to whatever triggered the
run — a `state` write or `batch` — and aborts the rest of that flush. Install a
global boundary with `configure({ onError })` to contain it: the throw is routed
to your handler and the flush continues running the other effects.

```ts
import { configure, state, effect } from "loom";

configure({
  onError: (error, node) => {
    // `node` is the offending effect's inspect record (when inspection is on),
    // otherwise undefined.
    console.error(`effect ${node?.label ?? "?"} failed:`, error);
  },
});

const count = state(0);
effect(() => {
  if (count() === 1) throw new Error("boom"); // caught by onError, not rethrown
});
const seen = effect(() => document.title = String(count()));

count(1); // does not throw here; onError fires and `seen` still runs
```

The handler is a single global boundary; pass `configure({ onError: undefined })`
to remove it. Errors raised while *reading* a `computed` still surface at the
reader — `onError` covers effect runs, the push side of the graph.

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
      onclick: () => hot(!hot()),
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
- `tap(node, handler)` binds a robust tap (see [Events](#events) below).

### Events

Loom is a thin layer over the DOM, so event props use **the DOM's own lowercase
names** — `onclick`, `oninput`, `onpointerup`, `onkeydown` — not React's
camelCase. Any `on<event>` function prop is wired with `addEventListener`, so you
get standard bubbling and the precise DOM event type in the handler:

```ts
h("input", { oninput: (event) => value(event.currentTarget.valueAsNumber) });
```

(A camelCase `onClick` still works — the runtime lowercases `on*` — but lowercase
is the typed, documented form.)

**`ontap` — the one synthetic event.** iOS Safari **drops the synthesized
`click`** when the DOM mutates between `touchstart` and `touchend`. An app that
rewrites the DOM during interaction (a live dashboard, a game, the demo's chaos
mode) will see taps silently do nothing — the button shows `:active` but the
handler never runs. `ontap` is built from raw `pointerdown`+`pointerup`, which
are dispatched directly rather than hit-test-synthesized, so it survives:

```ts
h("button", { ontap: () => stop() }); // fires reliably even under DOM churn
```

It fires on release when the pointer hasn't moved more than ~10px from the press
(so a drag or scroll doesn't trigger it). Use plain `onclick` everywhere else;
reach for `ontap` only in the rare continuous-mutation case. `tap(node, handler)`
is the same logic for imperative (non-JSX) call sites.

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

Loom's runtime is instrumented with **channels** — gated, overwriting ring
buffers that a consumer **drains on its own clock**. A channel records nothing
(and allocates nothing) until a meter attaches; under load it keeps only its most
recent samples, so it stays bounded and the producer runs at full speed
regardless of how fast the consumer reads. The core's reactive events are the
built-in `channels`; you can declare your own for app telemetry the same way.

```ts
import { channels, inspect, meter, state, effect } from "loom";

// Drain the reactive pipeline on your own cadence (here, every 250ms):
const m = meter([channels.write, channels.effect, channels.flush]);
setInterval(() => {
  const f = m.read();
  console.log("writes/s≈", f["loom:write"].count * 4);
  const lastFlush = f["loom:flush"].samples.at(-1);
  if (lastFlush) console.log("last flush", lastFlush.batchSize, lastFlush.durationMs);
}, 250);

// Your own channel — counter-only or with a bounded detail ring:
import { channel } from "loom";
const paint = channel("app:paint", { capacity: 256, fields: ["ms"] });
paint.emit(16.7); // no-op and zero-alloc unless someone is metering it
```

The built-in channels record **non-internal** nodes only, so the idle baseline is
zero. `inspect()` still returns a pull snapshot of the whole graph, and
`depsOf(read | stop)` returns a node's dependencies.

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
      onclick={() => count(count() + 1)}
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

On the chaos workload, with inspection off (the default), Loom runs within
`~1.02x` (manual cells) to `~1.07x` (`fields()`) of native `alien-signals` — the
per-operation read/write/effect hot paths carry only branch-predicted channel
guards and otherwise match the native primitives. Enabling inspection
(`configure({ inspect: true })`) adds one metadata object plus a `WeakRef` per
node created, which is what widens the gap to ~`1.2x` on create-heavy work.

## Design notes

Loom uses `alien-signals` as the reactive graph implementation detail. The
public API stays small: callable state cells, computed reads, effects, batching,
manual triggers, object field cells, and an observability surface.

The built-in observability channels are gated by a per-channel meter count, so
reads, writes, computed updates, and effect runs stay allocation-free and pay
only a predicted-not-taken branch when nothing is metering them; records are
written into a pre-allocated ring. Inspection is opt-in
(`configure({ inspect: true })`): while it is off, nodes carry no metadata at
all; while it is on, each node carries a lightweight metadata record so
`inspect()` and `depsOf()` work without any further setup.

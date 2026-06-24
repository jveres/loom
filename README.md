<p align="center">
  <img src="./assets/loom.svg" alt="Loom" width="96" height="96">
</p>

<h1 align="center">Loom</h1>

<p align="center">
  <strong>A tiny runtime reactive UI core.</strong><br>
  Callable state cells, computed reads, effects, and a small DOM layer —
  no compiler, no virtual DOM.
</p>

<p align="center">
  <a href="./LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-green"></a>
  <img alt="status: alpha" src="https://img.shields.io/badge/status-alpha-orange">
  <img alt="gzip ~5 kB" src="https://img.shields.io/badge/gzip-~5%20kB-blue">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
  <img alt="built on alien-signals" src="https://img.shields.io/badge/built%20on-alien--signals-8957e5">
</p>

> Loom is under active development. The API is intentionally small and can still
> change while the core and inspector surface are refined.

## Why Loom

- **Runtime, not compiled.** Plain functions and live DOM nodes — no build-step
  transform and no virtual-DOM diff. JSX returns real elements.
- **Near-native speed.** Built on [`alien-signals`](https://github.com/stackblitz/alien-signals);
  the per-operation read/write/effect path stays within `~1.03x`–`~1.07x` of the
  raw primitives on the chaos benchmark. That thin margin is the always-on channel
  instrumentation; inspection (the heavier per-node metadata) is off by default.
- **Callable cells.** `count()` reads, `count(1)` writes — the whole state model
  in one shape, no setters or hooks.
- **Generic channel/meter primitives.** A gated ring-buffer `channel` and a pull-based
  `meter` for any event or sample stream — zero allocation until metered. Loom uses them
  to instrument itself; that self-watching surface is the opt-in `@jveres/loom/observe`.
- **Lean core, opt-in surfaces.** `@jveres/loom` (reactivity, lifecycle, channel/meter) ·
  `@jveres/loom/observe` (watch loom's internals) · `@jveres/loom/dom` · `@jveres/loom/html`
  (SSR/SSG) · `@jveres/loom/devtools` (dev panel).

## At a glance

```tsx
import { computed, state } from "@jveres/loom";

const count = state(0);
const label = computed(() => `count: ${count()}`);

function Counter() {
  return <button onclick={() => count(count() + 1)}>{label}</button>;
}

document.body.append(<Counter />);
```

State cells are callable: calling without an argument reads the value, calling
with an argument writes the next one. A `computed` caches a derived read; an
`effect` re-runs when its dependencies change. JSX evaluates once and returns a
real DOM node, with reactive reads wired in place.

## Install

```sh
npm install @jveres/loom
```

To use browser JSX, point TypeScript (and your bundler) at Loom's automatic
runtime — see [JSX](#jsx). For local development of Loom itself, see
[Develop](#develop).

## Guide

### Core primitives

Import reactive primitives from `@jveres/loom`.

```ts
import { batch, computed, effect, state, update } from "@jveres/loom";

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
  change. Pass `{ target }` (an `EffectOptions` extra) to associate the effect
  with the DOM node it writes — the DOM layer does this for its bindings so the
  inspector can highlight what a cell drives.
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
- `channel(name, options?)` declares a named channel — a **generic**, gated,
  overwriting ring buffer that records cheaply (no allocation until metered) and
  is drained, not pushed. A reusable primitive for any event or sample stream, not
  just telemetry.
- `meter(channels)` attaches a pull-based meter; `read()` returns a Frame per
  channel (`{ count, dropped, samples }`) since the last read. A meter is a scope
  resource, so it detaches on `scope.pause()`.
- `configure({ inspect, onError })` sets runtime options. `inspect` toggles the
  inspection layer — **off by default**, so node creation allocates no metadata
  (zero cost); turn it on once at startup, before creating the nodes you want
  visible, when you need tooling. `onError` installs a global effect error
  boundary (see [Error handling](#error-handling)).

> `channel` and `meter` are generic core primitives. **Watching Loom's *own* internals**
> — the `events` registry (the runtime's built-in streams) and the graph-snapshot tools
> `inspect` / `inspectResources` / `depsOf` — is a separate opt-in surface,
> [`@jveres/loom/observe`](#observability). Keeping it out of the core means the default
> `@jveres/loom` import stays lean: reactivity, lifecycle, and `channel`/`meter` only.

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
- `InspectNode` describes a graph node (also the `configure({ onError })` node
  param); `InspectSnapshot` and `ResourceCounts` (the `inspect()` /
  `inspectResources()` result shapes) come with `@jveres/loom/observe`.
- `Channel` is a named channel; `Meter` drains channels;
  `Frame` is a per-channel `{ count, dropped, samples }`; `ChannelOptions`
  configures `{ capacity, fields }`.
- `NodeOptions` (`{ internal, namespace, label }`) and `EffectOptions` (adds
  `{ target }`) are the option bags accepted by the primitives; `NodeKind` is the
  `"state" | "computed" | "effect"` union reported on an `InspectNode`.

Pass `{ label, namespace }` to `state`, `computed`, `effect`, or `fields` when
you want meaningful names in tooling. Pass `{ internal: true }` for Loom-owned
tooling state that must not appear in app-level event streams by default.

### Object fields

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

### In-place mutation

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

### External sources

Bridge imperative or external data into the graph. `polled()` re-samples on an
interval (eager, deduped); `source()` is lazy — it connects on first subscriber
and disconnects on last, so the producer only runs while observed.

```ts
import { effect, polled, source } from "@jveres/loom";

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

### Scopes

`scope(fn)` groups the effects created in `fn` so a whole subtree can be torn
down or suspended at once. `stop()` disposes; `pause()` suspends runs (changes
just mark effects dirty) and `resume()` re-runs the ones that went dirty — so a
hidden panel does no reactive work without losing its state or DOM.

```ts
import { effect, scope, state } from "@jveres/loom";

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
import { effect, fields, scope } from "@jveres/loom";

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

### Error handling

By default an effect that throws propagates the error to whatever triggered the
run — a `state` write or `batch` — and aborts the rest of that flush. Install a
global boundary with `configure({ onError })` to contain it: the throw is routed
to your handler and the flush continues running the other effects.

```ts
import { configure, effect, state } from "@jveres/loom";

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
const seen = effect(() => (document.title = String(count())));

count(1); // does not throw here; onError fires and `seen` still runs
```

The handler is a single global boundary; pass `configure({ onError: undefined })`
to remove it. Errors raised while *reading* a `computed` still surface at the
reader — `onError` covers effect runs, the push side of the graph.

### DOM and events

Import DOM helpers from `@jveres/loom/dom`. The DOM layer creates nodes, binds reactive
text, attributes, classes, and styles, reconciles keyed lists, and disposes
owned effects when nodes are removed.

```ts
import { state } from "@jveres/loom";
import { attr, classed, h, style, text } from "@jveres/loom/dom";

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
- `tap(node, handler)` binds a robust tap (see below).

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

For long lists, `@jveres/loom/dom/vlist` is a standalone fixed-row-height
virtualizer — only the rows in (and just around) the viewport stay in the DOM. It
takes a `{ rowHeight, key, render }` and windows against an existing scroll
container; the inspector's graph tree is built on it.

### JSX

Loom supports JSX through standard automatic JSX runtime entrypoints. The
browser runtime returns live DOM nodes and uses the same DOM binding helpers as
`h()`. Function components are plain functions; there is no virtual DOM.

Configure TypeScript for browser JSX with `jsxImportSource: "@jveres/loom"`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@jveres/loom"
  }
}
```

If your bundler transpiles TSX directly, configure it to use the same automatic
runtime. This repository sets Vite's `oxc.jsx.importSource` to `"@jveres/loom"`.

Reactive reads can be used directly as children, attribute values, and class
map values.

```tsx
import { state } from "@jveres/loom";

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
/>;
```

Style values can be strings, arrays, object maps, or explicit `style()`
bindings. Object keys can use camelCase or CSS property names. Reactive style
reads can return `null` to remove the property.

```tsx
import { style } from "@jveres/loom/dom";

const active = state(false);

<section
  style={[
    "font-size:12px",
    { backgroundColor: "white" },
    { opacity: () => (active() ? 1 : 0.5) },
    style("color", () => (active() ? "red" : null)),
  ]}
/>;
```

Loom is runtime-only: JSX expressions run once when the DOM node is created, so
derived reactive values need a read function or `computed()`.

```tsx
import { computed, state } from "@jveres/loom";

const running = state(false);
const label = computed(() => (running() ? "Stop chaos" : "Start chaos"));

<button class={{ running }} aria-pressed={running}>
  {label}
</button>;

<button>{() => (running() ? "Stop chaos" : "Start chaos")}</button>;
```

Use these entrypoints for browser JSX:

- `@jveres/loom/jsx-runtime` powers browser JSX.
- `@jveres/loom/jsx-dev-runtime` powers browser JSX in development mode.

### SSR and SSG

Use `@jveres/loom/html` when you want static HTML for server-side rendering or
static-site generation. This runtime escapes interpolated text, supports
components and fragments, serializes common attributes, and omits event
handlers because there is no live DOM.

```tsx
/** @jsxImportSource @jveres/loom/html */
import { renderToString } from "@jveres/loom/html";

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

The `@jveres/loom/html` entrypoint exports:

- `renderToString(child)` serializes a node tree to an HTML string.
- `html(strings, ...values)` is a tagged template that escapes interpolated
  values and returns an `Html` node.
- `raw(value)` marks a pre-trusted string as `Html` so it is emitted verbatim
  (no escaping) — use only for content you control.
- `isHtml(value)` is the type guard for an `Html` node.
- `escapeText(value)` / `escapeAttribute(value)` are the underlying escapers, for
  hand-built markup.
- `Html` and `HtmlChild` are the node types.

Use these entrypoints for static HTML JSX:

- `@jveres/loom/html/jsx-runtime` powers static HTML JSX.
- `@jveres/loom/html/jsx-dev-runtime` powers static HTML JSX in development mode.

### Observability

**`channel` and `meter` are generic core primitives.** A channel is a gated,
overwriting ring buffer that a consumer **drains on its own clock**: it records
nothing (and allocates nothing) until a meter attaches, and under load keeps only
its most recent samples, so it stays bounded and the producer runs at full speed
regardless of how fast the consumer reads. Use them for any event or sample stream.

The runtime emits to a built-in set of these streams — the **`events` registry**,
exposed from `@jveres/loom/observe` (loom watching its own pipeline, so it lives in
the observability surface, not the core). Meter them to get pipeline rates:

```ts
import { channel, meter } from "@jveres/loom"; // generic primitives
import { events } from "@jveres/loom/observe"; // loom's own built-in streams

// Drain the reactive pipeline on your own cadence (here, every 250ms):
const m = meter([events.write, events.effect, events.flush]);
setInterval(() => {
  const f = m.read();
  console.log("writes/s≈", f["loom:write"].count * 4);
  const lastFlush = f["loom:flush"].samples.at(-1);
  if (lastFlush) console.log("last flush", lastFlush.batchSize, lastFlush.durationMs);
}, 250);

// Your own channel — counter-only or with a bounded detail ring:
const paint = channel("app:paint", { capacity: 256, fields: ["ms"] });
paint.emit(16.7); // no-op and zero-alloc unless someone is metering it
```

The built-in `events` record **non-internal** nodes only, so the idle baseline is
zero. The rest of `@jveres/loom/observe` snapshots the reactive graph:

- `inspect()` returns a snapshot of the current graph (empty unless inspection is
  enabled via `configure({ inspect: true })`). Pass `{ active: true }` to skip
  state/computed cells with no subscribers — idle cells and "ghosts" (cells of a
  removed object, unreachable but not yet GC'd); effects are always kept.
- `inspectResources()` returns a live census `{ states, computeds, effects, views,
  sources, scopes, channels, unread }` — one cheap walk, no per-node allocation.
  `views` are the DOM bindings (effects in the `"dom"` namespace); `unread` is the
  count of states/computeds nothing currently reads (a rising count hints at a leak).
- `depsOf(read | stop)` returns a node's inspected dependencies.

### Inspector

`@jveres/loom/devtools` is a self-contained dev panel built entirely on the public
surface (`inspect`, `inspectResources`, `meter`/`events`, `scope`,
`polled`, `source`). Mount it to get a live, draggable, resizable overlay; it is
purely a consumer of the runtime, so the same data is available to any tooling
you write yourself.

```ts
import { mountInspector } from "@jveres/loom/devtools";

mountInspector(); // appends to document.body by default; pass an Element to host it elsewhere
```

The entrypoint exports four functions:

- `mountInspector(target?)` builds and shows the panel (no-op if already
  mounted, or outside a DOM).
- `unmountInspector()` tears it down and releases its meters, heartbeat and
  observers.
- `inspectorMounted()` reports whether it is currently shown.
- `toggleInspector(target?)` mounts if hidden, unmounts if shown — handy on a
  hotkey.

**Mounting turns inspection on.** `mountInspector()` calls
`configure({ inspect: true })` for you, but only nodes created *after* that point
carry metadata. To see pre-existing nodes in the census and graph, enable
inspection at startup before creating them:

```ts
import { configure } from "@jveres/loom";
import { mountInspector } from "@jveres/loom/devtools";

configure({ inspect: true }); // earliest opportunity — every node from here is visible
// ... build your app ...
mountInspector(); // or wire it to a hotkey via toggleInspector()
```

The panel has three tabs:

- **Info** — the `inspectResources()` census (states, computeds, effects, views,
  sources, scopes, channels, `unread`) plus a live rendering-pipeline sparkline
  (writes in vs DOM updates out) driven by a `meter` over the built-in `events`.
- **Graph** — the reactive graph as a virtualized tree of state/computed cells,
  grouped by `fields()` group and namespace. A filled dot means the cell drives a
  DOM node downstream; a hollow dot means it doesn't. Hovering a cell (or a group
  header) highlights every DOM target it feeds; the locate button scrolls the
  first target into view. Primitive state cells are editable in place, and values
  flash on change.
- **Writes** — a live stream of graph events (in progress).

The panel is styled by a single `inspector.css` — ordinary formatted CSS, authored
with native nesting and scoped under `#loom-inspector` (and `#loom-inspector-menu`
for the portalled menu). It is imported as a string via Vite's `?inline` and
injected once at runtime as a `<style>`, so the panel ships fully styled with no
CSS-in-JS and nothing for consumers to set up. The id scoping is deliberate — it
keeps the panel styled correctly inside arbitrary host pages (light-DOM isolation by
specificity, not Shadow DOM); theme colours are `--li-*` custom properties switched
by a `data-theme` attribute (`light` / `dark` / `system`).

## Performance

The CLI benchmark compares Loom against native `alien-signals` primitives under a
full-chaos workload (`vitest bench`). It runs three variants on the same machine:
`loom` (using `fields()`), `loom manual` (manually declared state cells), and
`alien native` (native `alien-signals` cells).

```sh
npm run bench
```

With inspection off (the default), Loom runs within `~1.03x` (manual cells) to
`~1.07x` (`fields()`) of native `alien-signals`. The per-operation
read/write/effect hot paths carry only branch-predicted channel guards and
otherwise match the native primitives — see [Design notes](#design-notes) for the
attribution. Enabling inspection (`configure({ inspect: true })`) adds one
metadata object plus a `WeakRef` per node created, which widens the gap to
~`1.2x` on create-heavy work.

A browser benchmark is also available from the dev server at `/bench/`. It uses a
js-framework-benchmark style table workload and compares Loom DOM bindings
against a hand-written vanilla DOM baseline.

## Design notes

Loom uses `alien-signals` as the reactive graph implementation detail. The
public API stays small: callable state cells, computed reads, effects, batching,
manual triggers, object field cells, and an observability surface.

The built-in event channels are gated by a per-channel meter count, so
reads, writes, computed updates, and effect runs stay allocation-free and pay
only a predicted-not-taken branch when nothing is metering them; records are
written into a pre-allocated ring. Inspection is opt-in
(`configure({ inspect: true })`): while it is off, nodes carry no metadata at
all; while it is on, each node carries a lightweight metadata record so
`inspect()` and `depsOf()` work without any further setup.

### Hot path

The per-operation read/write/effect path is deliberately kept at parity with the
underlying `alien-signals` primitives. The callable cell shape (`signal(...value)`
read/write dispatch) is the same one `alien-signals` uses, so Loom adds no
allocation of its own there.

The whole measured gap over native `alien-signals` is the channel
instrumentation — the `someCh.meters !== 0 && …` guard inlined at each
read/write/compute/effect/create/dispose site. A controlled experiment (stripping
just the state-path guards and re-running the chaos bench) attributes ~3% to it on
the manual-cells path: the cost of keeping observability always available with
zero allocation when idle. With the guards in place Loom lands within `~1.03x`
–`~1.07x` of native, and that margin *is* the channel layer, not overhead to
optimize away.

Two things are intentionally left as-is: the read/write rest parameter (shared
with `alien-signals`, so removing it would diverge from the reference for no real
win) and `kindOf`'s `in`-operator dispatch (off the measured hot path — it runs in
the dirty-check callbacks, which a state→effect graph barely exercises). Inspection
metadata is the one cost that *was* per-node allocation, which is why it is opt-in
and off by default.

## Develop

Loom is developed from source with `pnpm`:

```sh
pnpm install
pnpm run check   # tsc --noEmit
pnpm run lint    # biome
pnpm test        # vitest
pnpm run bench   # CLI chaos benchmark
pnpm run dev     # dev server
```

With the dev server running, open `/demo/` for the realtime UI demo or `/bench/`
for the browser benchmark. The demo is a realtime stress UI written in Loom JSX:
it exercises state cells, object fields, computed values, effects, keyed list
reconciliation, direct JSX text/attribute/class bindings, cleanup through DOM
disposal, and the browser JSX runtime.

## License

[MIT](./LICENSE) © Janos Veres

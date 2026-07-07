<p align="center">
  <img src="./assets/loom.svg" alt="Loom" width="96" height="96">
</p>

<h1 align="center">Loom</h1>

<p align="center">
  <strong>A tiny runtime reactive UI core.</strong><br>
  Callable signals, computed reads, effects, and a small DOM layer —
  no compiler, no virtual DOM.
</p>

<p align="center">
  <a href="./LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-green"></a>
  <img alt="status: alpha" src="https://img.shields.io/badge/status-alpha-orange">
  <img alt="gzip ~6 kB" src="https://img.shields.io/badge/gzip-~6%20kB-blue">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
  <img alt="built on alien-signals" src="https://img.shields.io/badge/built%20on-alien--signals-8957e5">
</p>

> Loom is under active development. The API is intentionally small and can still
> change while the core and inspector surface are refined.

## Why Loom

- **Runtime, not compiled.** Plain functions and live DOM nodes — no build-step
  transform and no virtual-DOM diff. JSX returns real elements.
- **Native speed, zero dependencies.** The reactive engine is a vendored copy of
  [`alien-signals`](https://github.com/stackblitz/alien-signals)' 224-line
  propagation core (`src/core/graph.ts`, MIT) — no runtime dependencies, and the
  full pipeline measures statistically at parity with the raw primitives on the
  chaos benchmark. The always-on channel instrumentation costs ~3% in a controlled
  experiment; inspection (the heavier per-node metadata) is off by default.
- **Small and tree-shakable.** A minimal `state`/`computed`/`effect` app bundles
  to ~3.5 kB gzip; the meter/inspect machinery loads only with `loom/observe`,
  and per-entry budgets are enforced in CI (`pnpm size`).
- **Callable signals.** `count()` reads, `count(1)` writes — the whole state model
  in one shape, no setters or hooks.
- **Generic channel/meter primitives.** A gated ring-buffer `channel` and a pull-based
  `meter` for any event or sample stream — zero allocation until metered. Loom uses them
  to instrument itself; that self-watching surface is the opt-in `loom/observe`.
- **Lean core, opt-in surfaces.** `loom` (reactivity, lifecycle, channel/meter) ·
  `loom/observe` (watch loom's internals) · `loom/async` (async resources) ·
  `loom/dom` · `loom/html` (SSR/SSG) · `loom/devtools` (dev panel).

## At a glance

```tsx
import { computed, state } from "loom";

const count = state(0);
const label = computed(() => `count: ${count()}`);

function Counter() {
  return <button onclick={() => count(count() + 1)}>{label}</button>;
}

document.body.append(<Counter />);
```

State signals are callable: calling without an argument reads the value, calling
with an argument writes the next one. A `computed` caches a derived read; an
`effect` re-runs when its dependencies change. JSX evaluates once and returns a
real DOM node, with reactive reads wired in place.

## Install

Loom is installed straight from GitHub (it is not published to npm). The compiled
`dist` (ES bundles + `.d.ts`) is committed, so the install runs no build step and
works with any package manager:

```sh
pnpm add github:jveres/loom
# or: npm install github:jveres/loom
```

Pin to a tag or commit for reproducible builds:

```sh
pnpm add github:jveres/loom#v0.3.0
```

It then imports as `loom` (and `loom/observe`, `loom/dom`, …).

To use browser JSX, point TypeScript (and your bundler) at Loom's automatic
runtime — see [JSX](#jsx). For local development of Loom itself, see
[Develop](#develop).

## Guide

### Core primitives

Import reactive primitives from `loom`.

```ts
import { batch, computed, effect, state, update } from "loom";

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

- `state(initial, options?)` creates a callable signal: `count()` reads,
  `count(next)` writes.
- `computed(getter, options?)` creates a cached derived read.
- `effect(fn, options?)` runs `fn` immediately and again when its
  dependencies change. `fn` may return a cleanup that runs before each re-run
  and on stop. `{ target }` associates the effect with the DOM node it writes
  (inspector attribution); `{ defer, maxStale }` moves re-runs off the
  critical path ([Deferred effects](#deferred-effects)).
- `batch(fn)` groups writes and flushes effects once after the batch. A
  top-level write outside `batch` flushes synchronously before it returns.
- `untrack(fn)` reads state inside `fn` without subscribing the active
  effect — and, because a nested effect links to the running one, it is also
  the ownership escape ([Ownership & disposal](#ownership--disposal)).

#### Deriving and reacting

- `update(source, fn)` writes `fn(source())` back to a signal. The read is
  **untracked**: inside an effect, `update(v, n => n + 1)` does not subscribe
  the effect to `v` — `v(v() + 1)` does, and re-triggers the effect.
- `watch(read, onChange, options?)` reacts to a source's **changes**: `read`
  is tracked, `onChange(value, previous)` runs untracked, and it is skipped
  on the initial evaluation and when the derived value is unchanged.

> **Self-dependency warning (dev):** with inspection on
> (`configure({ inspect: true })` + `loom/observe` loaded), loom warns once
> per pair when an effect writes a signal it also reads — the `v(v() + 1)`
> pattern that silently re-triggers the effect. `update()`/`untrack()` are
> the fixes.

For in-place mutation of objects and arrays, `mutate` and `trigger` —
[In-place mutation](#in-place-mutation).

#### Runtime configuration

`configure({ inspect, onError, deferScheduler })` sets runtime options.
`inspect` toggles the inspection layer — **off by default**, so node creation
allocates no metadata; turn it on once at startup, before creating the nodes
you want visible. Enabling it also requires the `loom/observe` module to be
loaded (importing `inspect`/`events` — or mounting the inspector — does
that). `onError` installs a global effect error boundary
([Error handling](#error-handling)); `deferScheduler` overrides the
deferred-lane scheduler ([Deferred effects](#deferred-effects)).

#### API index — `loom`

| Export | Documented in |
| --- | --- |
| `state`, `computed`, `effect`, `batch`, `untrack` | [Core primitives](#core-primitives) |
| `update`, `watch` | [Deriving and reacting](#deriving-and-reacting) |
| `mutate`, `trigger` | [In-place mutation](#in-place-mutation) |
| `props` | [Object properties](#object-properties) |
| `poll`, `source` | [External data](#external-data) |
| `scope` | [Scopes](#scopes) |
| `channel`, `meter` | [Observability](#observability) |
| `configure` | [Runtime configuration](#runtime-configuration) |

Types: `State<T>` (callable read/write signal), `Read<T>`, `Stop`, `Scope`,
`Polled<T>` (`poll`'s `Read<T> & { stop }`), `SourceConnect<T>`, `EffectFn`,
`CleanupEffectFn` (effect body returning a cleanup), `ErrorHandler`,
`Props<T>` (string keys to `State<T[K]>`), `NodeInfo` (`id`/`kind`/`label`,
what an `onError` boundary receives), `NodeKind`, `Channel`, `Meter`,
`Frame`, `MeterAggregation`, `ChannelOptions`, `NodeOptions`
(`{ internal, label }`), `EffectOptions` (adds `{ target, defer, maxStale }`),
`DeferScheduler`.

Pass `{ label }` to `state`, `computed`, `effect`, or `props` when you want
meaningful names in tooling. Pass `{ internal: true }` for Loom-owned tooling
state that must not appear in app-level event streams by default.

### Object properties

Use `props()` when you want fine-grained updates for a plain object. Each
enumerable string key becomes its own signal.

```ts
const model = props(
  {
    title: "Hello",
    likes: 0,
  },
  { label: "post" },
);

effect(() => {
  document.title = `${model.title()} (${model.likes()})`;
});

model.likes(1);
```

`props()` rejects non-plain objects such as arrays and dates. Symbol keys are
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

### External data

Four bridges carry outside data into the graph, split by **how the data
arrives**:

| Your data arrives as… | Reach for | Mechanism |
| --- | --- | --- |
| a value you can read at any time | `poll(sample, ms)` | pull — loom samples it on an interval |
| a producer that pushes values | `source(connect, initial)` | push — connects while observed |
| an async request/response | `resource(fetcher)` ([loom/async](#async-resources)) | request — loading/error as reads |
| discrete events to count or sample | `channel` + `meter` | events — gated ring, pull-drained |

The pull bridge, `poll`, suits values that always exist and merely change —
clocks, `performance` counters, media positions:

```ts
import { poll } from "loom";

const heap = poll(() => performance.memory?.usedJSHeapSize ?? 0, 5000);
// heap() reads; bindings re-run only when the sampled value changed
```

The push bridge, `source`, is for producers that call *you* — event listeners,
observers, sockets. It is lazy: `connect(set)` runs when the source gains its
first subscriber and the returned teardown runs when it loses its last, so the
producer is only live while something actually reads it:

```ts
import { effect, source } from "loom";

// A media query that only listens while something reads it.
const darkMode = source<boolean>((set) => {
  const mq = matchMedia("(prefers-color-scheme: dark)");
  const onChange = () => set(mq.matches);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange); // runs when unobserved
}, matchMedia("(prefers-color-scheme: dark)").matches);

const stop = effect(() => console.log("dark:", darkMode()));
stop(); // last subscriber gone -> the listener is removed automatically
```

The dev inspector uses both: a `poll()` heartbeat drives its per-tick metric
math, and the CLS/LCP/INP web vitals are `source()`s whose `PerformanceObserver`s
connect and disconnect with the panel — no manual teardown. For the request
bridge (async fetches with loading/error state) see
[Async resources](#async-resources); for event streams see
[Observability](#observability).

### Async resources

`loom/async` is a small opt-in entrypoint (~0.3 kB gzip; costs nothing unless
imported) for async data with fine-grained loading and error state:

- `resource(fetcher, options?)` is an async computed: it runs
  `fetcher(previous, signal)` immediately and again whenever the fetcher's
  **synchronously tracked** reads change (reads after the first `await` are
  outside the tracked run). The previous value is passed untracked; `signal` is
  an `AbortSignal` that fires when this fetch becomes obsolete (a newer fetch
  started, or the resource was disposed) — forward it to `fetch()` and the
  obsolete request is cancelled on the wire, not just ignored, and its abort
  rejection never surfaces through `error()`. The returned handle is itself
  callable — with `const r = resource(...)`: `r()` reads the latest value
  (`undefined` until the first settle), `r.loading()` and `r.error()` are
  fine-grained reads, `r.refresh()` forces a refetch, and `r.stop()` disposes
  (a resource created inside a scope stops with the scope). While a fetch is in
  flight the previous value stays readable (stale-while-revalidate), and a
  response that lands after a newer fetch started is dropped.

```ts
import { effect, state } from "loom";
import { resource } from "loom/async";

const page = state(1);
const users = resource((_previous, signal) =>
  fetch(`/api/users?page=${page()}`, { signal }).then((response) =>
    response.json(),
  ),
);

effect(() => {
  if (users.loading()) return renderSpinner();
  renderList(users() ?? []);
});

page(2); // tracked read changed -> refetch; the page-1 request aborts, stale list stays visible
```

### Scopes

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

Scopes own resources, not just effects: a `poll()` or `source()` created inside
a scope is suspended with it too. Pausing the scope clears a `poll()`'s timer
(resuming takes a fresh sample) and disconnects a `source()`'s producer even
though its paused subscribers stay linked (resuming reconnects it); stopping the
scope tears them all down. So a hidden subtree stops not only re-rendering but
also the timers and observers feeding it.

A scope's second argument sets default options for everything created inside it —
handy for marking an entire subsystem `internal` (or giving it a shared `label`)
without repeating the options on every primitive. A node's own options win, and
nested scopes inherit and can override:

```ts
import { effect, props, scope } from "loom";

scope(
  () => {
    const settings = props({ theme: "dark", zoom: 1 }); // signals inherit the defaults
    effect(() => apply(settings.theme())); // so does this effect
  },
  { internal: true },
);
```

The dev inspector relies on this: its panel scope is created with
`{ internal: true }`, so every binding, the
heartbeat, the web-vital sources and the heap timer are filtered from the
observability it reports — without passing options to each one.

### Deferred effects

Pass `{ defer: true }` to run an effect's **re-runs** off the critical
path — idle-first and coalesced — instead of in the synchronous flush. The
first run stays synchronous (deps are tracked, the initial output is
immediate); only re-runs defer. Use it for non-frame-critical reactive work:
telemetry, debounced persistence, secondary UI, or a tool's own rendering.
A deferred effect that throws (with no `onError` boundary) is re-thrown on a
fresh task — it reaches `window.onerror` like any uncaught error — and never
stalls the lane: the remaining queued effects still run.

```ts
effect(() => save(doc()), { defer: true, maxStale: 2000 });
configure({ deferScheduler }); // override the lane's scheduler; for example, synchronous in tests
```

- **Coalesced — latest value, not every transition.** Many changes before the
  next drain collapse into **one** run at the latest value; for
  every-transition, use a `channel`.
- **`maxStale`** (ms) is the guaranteed-refresh floor — idle-first, but at least
  this often under load. It is **best-effort, not hard real-time**: a single app
  task longer than `maxStale` delays everything (the lane bounds Loom's
  contribution, not the app's long tasks).
- **Scope-aware** — a paused scope doesn't drain its deferred effects; resume re-runs them.
- Deferred effects are **sinks** (render / log / persist), not links in a derivation chain.

The synchronous, glitch-free default is untouched — this is a separate lane,
not concurrency in the core.

### Error handling

By default an effect that throws propagates the error to whatever triggered the
run — a `state` write or `batch` — and aborts the rest of that flush. Install a
global boundary with `configure({ onError })` to contain it: the throw is routed
to your handler and the flush continues running the other effects.

```ts
import { configure, effect, state } from "loom";

configure({
  onError: (error, node) => {
    // `node` is the offending effect's lean NodeInfo — id/kind/label — when
    // inspection is on, otherwise undefined.
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

The construction and binding core:

- `h(tag, props, children)` creates an element (JSX compiles to it).
- `text(read)` creates a text node bound to a reactive read.
- `attr`, `classed`, `style` treat an attribute, a class, and an inline style
  property as signals — see
  [Element state as signals](#element-state-as-signals).
- `list(container, read, options)` reconciles a keyed list into a container.
  Reorders move as few nodes as possible (longest-increasing-subsequence) and
  use the state-preserving `Element.moveBefore` where the platform has it, so
  iframes, focus, and CSS animations survive keyed moves.
- `each(items, render, key)`, `when(cond, render, fallback?)`, and
  `match(selector, cases, fallback?)` are the child-expression forms —
  [Conditional rendering](#conditional-rendering).
- `dispose(root)` disposes effects owned by a node subtree; `remove(node)`
  disposes and detaches — [Ownership & disposal](#ownership--disposal).

#### Element state as signals

`attr`, `classed`, and `style` each carry three forms; the first argument and
arity select the direction, as with a signal — read without a value, write
with one:

```ts
attr("aria-pressed", hot);          // JSX binding descriptor (string first)
attr(el, "hidden");                 // Read<string | null> — reactive read
attr(el, "data-mode", () => mode()); // node-owned write binding
```

- `classed(name, read)` / `classed(el, name)` → `Read<boolean>` of the
  class's presence / `classed(el, name, read, options?)`.
- `style(name, read)` / `style(el, prop)` → `Read<string>` of the inline
  value (empty when unset) / `style(el, prop, read, options?)`. Property
  names accept camelCase or kebab-case.
- Write bindings coerce like JSX attributes (nullish/false removes, true sets
  empty); `options` relabels the binding or marks it `internal`.

The reads share one app-wide `MutationObserver`: each watched element carries
an `attributeFilter` of exactly its subscribed names, and the observation set
is rebuilt only when a subscription changes, never per mutation.
Subscriber-counted like every source — nothing observed, nothing exists.
Typical guardrail:

```ts
watch(
  () => connected(el)() && attr(el, "hidden")() === null,
  (visible) => visible && clampIntoView(),
);
```

#### Lifecycle

- `onMount(el, fn)` runs `fn(el)` **once**, on a microtask after the task
  that inserted the element — inserted and measurable, not yet painted.
  Insertion in the same synchronous task creates no observer; a late
  insertion is caught by a transient shared observer that lives only until
  the element connects. Returns a cancel.
- `onUnmount(el, stop)` attaches a disposer to the node's Loom lifecycle —
  the contract is in [Ownership & disposal](#ownership--disposal).
- `bind(el, fn, options?)` — reactive DOM state that dies with this node:
  `effect(fn)` target-attributed to `el` and disposed with it. The one-call
  form of `onUnmount(el, effect(fn, { target: el }))`. Returns the stop.

`onMount` and `onUnmount` are also JSX props — see the prop documentation
below.

#### Browser state and observers

External browser state with loom lifetime — signals where state is read,
observers where a callback reacts:

- `connected(node)` returns a `Read<boolean>`, true while the node is in the
  document: `onUnmount(el, watch(connected(el), (on) => on && measure()))`.
  Backed by one shared document-level `MutationObserver` that exists only
  while at least one connection signal is observed. **Cost while live** (the
  observer records every childList mutation in the document, measured on the
  comparative bench): ~3.5% on `create-10k`, ~0.3 ms per 1k-node `clear`,
  nothing on update/swap; unused, zero. Moves confined to shadow roots are
  invisible to it.
- `persisted(key, initial, options?)` — a `State<T>` backed by
  `localStorage`: read-validate once at creation, write-through on set. A
  plain signal (`update`/`watch`/bindings compose); `options` add
  `serialize`/`parse` (default JSON) and `validate`, which drops a corrupt or
  out-of-range stored value instead of leaking it into the app. Absent or
  throwing storage degrades to an unpersisted signal. The inspector's panel
  chrome sits on it.
- `observeSize(el, cb)` — `cb(entry)` on ResizeObserver's clock (including
  the initial delivery on attach), detached on node teardown. One shared
  observer serves the whole app. Returns a stop.
- `observeIntersection(el, cb, options?)` — `cb(entry)` on
  IntersectionObserver's clock, detached on node teardown. Observers with
  equal `rootMargin`/`threshold` and the default root are shared; a custom
  `root` gets a dedicated observer. Returns a stop.
- `observeMutation(el, cb, options)` — the raw `MutationObserver` contract
  (`cb(records)`, batched per microtask, `MutationObserverInit` options),
  detached on node teardown. One observer per call: with `subtree` a
  record's target is the mutated descendant, so shared observers cannot
  route records. Returns a stop.

#### Scroll fade

`scrollFade(el, options?)` masks a scroller's edges so content fades out
exactly while more lies beyond — driven by scroll position and kept current
across resizes and content changes (no styling opinions; the effect is a
`mask-image` on the element). `options.size` sets the fade length in px
(default 14); `options.axis` picks the scroll axis (`"y"` default, `"x"` for
horizontal strips). Returns a disposer. While no edge fades, the mask is an
opaque gradient rather than none — clearing it would flip the element off the
masked raster path and the next fade-in flashes for a frame. The dev
inspector's own scrollers use it.

#### API index — `loom/dom`

| Export | Documented in |
| --- | --- |
| `h`, `text` | [DOM and events](#dom-and-events) |
| `attr`, `classed`, `style` | [Element state as signals](#element-state-as-signals) |
| `list` | [DOM and events](#dom-and-events) |
| `each`, `when`, `match` | [Conditional rendering](#conditional-rendering) |
| `dispose`, `remove`, `onUnmount`, `bind` | [Ownership & disposal](#ownership--disposal) |
| `onMount` | [Lifecycle](#lifecycle) |
| `onTap` | [The `onTap` synthetic event](#the-ontap-synthetic-event) |
| `connected`, `persisted`, `observeSize`, `observeIntersection`, `observeMutation` | [Browser state and observers](#browser-state-and-observers) |
| `scrollFade` | [Scroll fade](#scroll-fade) |
| `morph` | [Morphing static trees](#morphing-static-trees) |
| `virtualList` (`loom/dom/virtual-list`) | [Virtualized lists](#virtualized-lists) |

Types: `Child`, `ElementProps` (the props bag `h()` and JSX accept),
`ListOptions`, `SvgTagName`, the binding handles
`AttrBinding`/`ClassBinding`/`StyleBinding`/`DynamicChild`, `MorphOptions`,
`ScrollFadeOptions`, `PersistedOptions`, `SizeCallback`,
`IntersectionCallback`/`IntersectionOptions`, `MutationsCallback`,
`ListSource`/`VirtualList`/`VirtualListOptions` (virtual list).

#### Naming convention

- **`on…(el, …)`** — imperative twin of a JSX prop of the same name and
  spelling: `onMount`, `onUnmount`, `onTap`. Props also accept the
  all-lowercase spelling.
- **`observe…(el, cb, options?)`** — parameterized observation with node
  lifetime: `observeSize`, `observeIntersection`, `observeMutation`.
  Function-only; the callback detaches on node teardown.
- **Unprefixed** — signals and signals, the reactive grain: `connected`,
  `persisted`, and the signal forms of `attr`/`classed`/`style` (direction by
  first argument and arity, as with a signal: read without a value,
  write with one).
- **Behaviors** — apply an enhancement, return a disposer: `scrollFade`,
  `morph`, `virtualList`. Verb- or noun-accurate names, camelCase when
  multiword.
- Core reactivity uses `watch` (tracked read, untracked callback, no DOM);
  `observe…` is DOM observation with node lifetime. The prefixes mark the
  grain.

These split by where they go. **Child bindings** produce nodes or slot
descriptors to place among children — `text`, `each`, `when`, and `match`.
`list()` is the imperative container reconciler when you already have a host
element. **Prop bindings** — the descriptor forms of `attr` / `classed` /
`style` — return opaque handles you pass as a prop *value*
(`h("a", { class: classed("on", isOn) })`); the element forms of the same
functions bind or read directly when you hold the element. (In JSX you rarely
need descriptors: a reactive read as a child, class-map value, or attribute
is enough.)

Event props accept both spellings: the DOM's own lowercase names (`onclick`,
`oninput`, `onpointerup`) and camelCase (`onClick`, `onInput`) — the runtime
lowercases `on*` before `addEventListener`, so both wire the same listener
with standard bubbling and the precise DOM event type in the handler:

```ts
h("input", { oninput: (event) => value(event.currentTarget.valueAsNumber) });
```

#### The `onTap` synthetic event

iOS Safari **drops the synthesized
`click`** when the DOM mutates between `touchstart` and `touchend`. An app that
rewrites the DOM during interaction (a live dashboard, a game, the demo's chaos
mode) will see taps silently do nothing — the button shows `:active` but the
handler never runs. `onTap` is built from raw `pointerdown`+`pointerup`, which
are dispatched directly rather than hit-test-synthesized, so it survives:

```ts
h("button", { onTap: () => stop() }); // fires reliably even under DOM churn
```

It fires on release when the pointer hasn't moved more than ~10px from the press
(so a drag or scroll doesn't trigger it). Use plain `onclick` everywhere else;
reach for `onTap` only in the rare continuous-mutation case. `onTap(node, handler)`
is the same logic for imperative (non-JSX) call sites.

**`onMount` / `onUnmount` — lifecycle hooks, not DOM events.** `onMount` runs
once, on a microtask after the task that inserted the node — connected and
measurable, not yet painted, so measure-then-classify work causes no flash.
`onUnmount` runs a cleanup when the node is torn down the Loom way —
`remove()` / `dispose()`, or an ancestor `when` / `match` / `each` slot
swapping it out — riding the same node-owned disposer channel as the reactive
bindings, so it fires exactly when they do. Both are also importable
functions (`onMount(el, fn)` / `onUnmount(el, stop)`) for imperative call
sites:

```tsx
<div
  onMount={(el) => measureAndClassify(el)}
  onUnmount={() => socket.close()}
>
  {() => status()}
</div>
```

`onUnmount` does **not** fire on a raw `node.remove()` / `replaceChildren()`
that bypasses Loom's teardown — same caveat as every Loom binding. For
grouping many effects, prefer a `scope()`; `onUnmount` is the per-node escape
hatch, and `bind(el, fn)` is the effect-shaped shorthand for the common case.

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

#### Virtualized lists

For long lists, `loom/dom/virtual-list` is a standalone fixed-row-height
virtualizer — only the rows in (and just around) the viewport stay in the DOM.
`virtualList(options)` takes a `VirtualListOptions` (`{ rowHeight, key, render,
overscan? }`) and windows against an existing scroll container, returning a
`VirtualList` handle: `el` (mount it inside the scroller), `setItems(source)`,
`refresh()`, `scrollToIndex(i)`, `scrollToEnd()`, and `destroy()` to tear it down. The inspector's
graph tree is built on it.

Two contracts the virtualizer relies on: **`render(item, reuse)` reuses rows** —
it's called with `reuse = null` to build a row and with the existing element to
update in place, so return the updated `reuse` rather than a fresh node (this is
what keeps DOM churn flat as you scroll). And the elements it returns **must be
absolutely positioned** within `el` (which the module sets to
`position: relative`); it only sets each row's `transform`, so rows without
absolute positioning stack in the wrong place.

#### Ownership & disposal

The contract, precisely:

- Effects created by the DOM layer's own bindings — `text`, `attr`/`classed`/
  `style`, `list`, `each`, `when`, `match`, reactive props — are **owned by
  their nodes**. `dispose(root)` runs every owned disposer in the **entire
  subtree** (all descendants, not just `root`), and `remove(root)` disposes
  then detaches. A keyed row leaving a `list()`/`each()` is removed the same
  way, so its bindings die with it.
- A raw `effect()` call inside a component function is **not** node-owned.
  Tie it to an element with `bind(el, fn)` (effect + attribution + lifetime
  in one), with `onUnmount(el, stop)` for a disposer you already hold, or
  group it with `scope()` and stop the scope.
- `effect`'s `{ target }` option is **inspector attribution only** — it names
  which node an effect renders for the devtools; it does not create ownership.

```ts
function widget(): HTMLElement {
  const el = <div class="widget" /> as HTMLElement;
  bind(el, () => syncSomething(el)); // effect, dies with el, shows on hover
  // — the one-call form of: onUnmount(el, effect(() => …, { target: el }))
  return el;
}
```

One more ownership rule, easy to hit without noticing: an effect created
**while another effect is running** links to it as a child and is disposed on
the parent's next rerun. That's usually right — a rerendering region cleans
up its own bindings. But when a host effect *builds* UI that should outlive
its reruns, wrap the construction in `untrack()`: clearing the active
subscriber is also the **ownership escape**, not just a read guard:

```ts
effect(() => {
  frame(current()); // tracked: this effect reruns per navigation
  // The toolbar is panel-owned, not frame-owned — built tracked, its internal
  // effects would be disposed on this effect's next rerun (its selected mark
  // silently stops updating). untrack() detaches the construction.
  toolbar ??= untrack(() => buildToolbar());
});
```

#### Derived writable (recipe)

UI vocabulary often maps onto a domain signal — a picker shows `"All cards"`
while the domain stores `type: null`. Loom's callable-signal convention makes
the two-way link a three-line function, so there is no `link()` API:

```ts
// Reads map domain -> label; writes map label -> domain.
const typeLabel = (next?: string): string =>
  next === undefined
    ? labelFor(type()) // tracked read: re-runs bindings when type changes
    : (type(domainFor(next)), next);

// It now behaves like a signal wherever a Read/State is expected:
h("select", { value: typeLabel, onchange: (e) => typeLabel(e.target.value) });
```

The wrapper is just a function — it subscribes through the signals it reads, so
bindings, `computed`, and `watch` all compose with it unchanged.

#### Keyed rows with per-row state

Rebuilding a whole list per keystroke is the wholesale-rerender trap. Give
each row its own signals and key the list — updates then write one signal and
patch one text node, and reorders move nodes without rebuilding them:

```ts
interface RowModel { id: number; label: State<string> }

const rows = state<readonly RowModel[]>([]);
list(tbody, () => rows(), {
  key: (row) => row.id,
  render: (row) => h("tr", null, text(() => row.label())),
});

// update-in-place: one write, one text-node patch — no list churn
rows()[3]?.label("renamed");
```

#### Morphing static trees

`morph(from, to, options?)` patches a live DOM subtree to match a freshly
built one — the tool for server-rendered or string-built HTML that re-renders
wholesale but must keep expensive node state alive (iframe documents, playing
media, canvas contents, scroll positions, CSS animations):

```ts
import { morph } from "loom/dom";

const next = document.createElement("main");
next.innerHTML = await fetchRenderedHtml();
morph(document.querySelector("main")!, next, {
  key: (element) => element.getAttribute("data-key"), // optional
});
```

Matching is positional by node type and tag; the optional `key` hook matches
elements by a stable key across positions first (a keyed match still requires
the same tag), and moves matched nodes with the same LIS-minimal,
state-preserving move path as `list()`/`each()`. Duplicate keys throw, like the keyed
list reconcilers. Attributes, text, and form state are synced — the focused
element is never overwritten (including a focused radio's group siblings), and
selects sync per-option so multi-selects survive. `options.skip` marks
elements the morph must never touch — the hook for enhancer-injected nodes
(streaming cursors, copy buttons, post-render highlighting): a matched
element is left exactly as-is, an unmatched one is kept instead of removed.
A selector string is shorthand: `skip: "[data-chrome]"`.

> **Note:** `morph` is for **static** trees only. It removes and adopts nodes
> with raw DOM operations, so a subtree containing loom bindings (`text`,
> `list`, `onUnmount`, …) must be updated reactively or torn down with
> `remove()` — morphing it would strand the bindings' effects.

### JSX

Loom supports JSX through standard automatic JSX runtime entrypoints. The
browser runtime returns live DOM nodes and uses the same DOM binding helpers as
`h()`. Function components are plain functions; there is no virtual DOM.

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
/>;
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
/>;
```

Loom is runtime-only: JSX expressions run once when the DOM node is created, so
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

### Conditional rendering

JSX runs **once** and returns live DOM nodes, so the React habits for branching
do not update. A bare `{open() && <Panel />}` evaluates a single time when the
node is built; wrapping it in a function — `{() => open() && <Panel />}` — does
**not** fix it, because a function child is bound as reactive **text** (it would
stringify the element). What stays reactive in JSX is the leaf bindings: text,
attributes, classes, and styles.

So pick by what you actually need:

**Show / hide** — keep the subtree mounted and toggle visibility with a reactive
class or style binding. Cheapest; state inside the subtree is preserved while
hidden.

```tsx
const open = state(true);

<section style={{ display: () => (open() ? null : "none") }}>
  <Details />
</section>;
```

**Mount / unmount, or swap branches** — use `when()` / `match()` from `loom/dom`.
Each returns a child you drop straight into JSX (or `h()`); it manages an anchored
slot that rebuilds **only when its key changes**, disposing the old subtree's
effects when it swaps.

`when(cond, render, fallback?)` keys on the **truthiness** of `cond`. It builds
`render()` while truthy and the optional `fallback()` while falsy:

```tsx
import { when } from "loom/dom";

const open = state(false);

<aside>{when(open, () => <Panel />, () => <Empty />)}</aside>;
```

Because it only rebuilds when the truthiness **flips**, a `cond` that changes
while staying truthy does *not* recreate the subtree — read live state with your
own bindings inside `render` for that:

```tsx
// `user` changing from one object to another keeps <Profile> mounted; its inner
// bindings update fine-grained. It rebuilds only when user goes null ↔ non-null.
{when(user, () => <Profile name={() => user()?.name} />)}
```

`match(selector, cases, fallback?)` is the switch/case form, keyed on
`selector()`:

```tsx
import { match } from "loom/dom";

const tab = state<"info" | "graph" | "trace">("info");

<main>
  {match(tab, {
    info: () => <Info />,
    graph: () => <Graph />,
    trace: () => <Trace />,
  })}
</main>;
```

For a **keyed list** as a child expression, use `each(items, render, key)` — the
same reconciliation as `list()` (existing rows are moved, not rebuilt; missing
keys are removed and their effects disposed) but inline, without a container
reference:

```tsx
import { type State, state } from "loom";
import { each } from "loom/dom";

interface Row {
  readonly id: string;
  readonly title: State<string>;
  readonly done: State<boolean>;
}

const rows = state<readonly Row[]>([]);

<ul>
  {each(
    rows,
    (row) => <li class={{ done: row.done }}>{row.title}</li>,
    (row) => row.id,
  )}
</ul>;
```

`render(item, key)` must return a single Element; `key(item)` identifies rows
across updates. Reach for `list(container, …)` instead when you already hold the
container element (or need the `reorder` option).

Both `each` and `list` render a row **once per key** — like the conditional
helpers, they reconcile structure, not row contents. A row whose key is unchanged
is reused as-is; its `render` does not re-run when the item behind that key is
replaced. So make the row model expose Loom reads/signals and pass those reads into
bindings (`{row.title}`, `class={{ done: row.done }}`), or, if a row is a
static snapshot, fold the fields it shows into the `key` so a changed field
produces a new key and rebuilds the row.

`when`, `match`, and `each` must each be placed as a child of a Loom element
(that is what wires the slot); they are not standalone mount points.

### SSR and SSG

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

The pragma selects the JSX runtime per file — it is needed only in projects
that mix browser JSX and static JSX. A project whose JSX is entirely static
sets `jsxImportSource: "loom/html"` once in `tsconfig.json` (and the
bundler's equivalent, e.g. Vite's JSX `importSource`) and omits the pragma.

The `loom/html` entrypoint exports:

- `renderToString(child)` serializes a node tree to an HTML string.
- `html(strings, ...values)` is a tagged template that escapes interpolated
  values and returns an `Html` node.
- `unsafeHtml(value)` marks a pre-trusted string as `Html` so it is emitted
  verbatim, bypassing escaping — **trusted input only**: never pass user-supplied
  content (everything interpolated into `html` is escaped; this is the one hole).
- `isHtml(value)` is the type guard for an `Html` node.
- `escapeText(value)` / `escapeAttribute(value)` are the underlying escapers, for
  hand-built markup.
- `Html` and `HtmlChild` are the node types.

Use these entrypoints for static HTML JSX:

- `loom/html/jsx-runtime` powers static HTML JSX.
- `loom/html/jsx-dev-runtime` powers static HTML JSX in development mode.

### Observability

**`channel` and `meter` are generic core primitives.** A channel is a gated,
overwriting ring buffer that a consumer **drains on its own clock**: it records
nothing (and allocates nothing) until a meter attaches, and under load keeps only
its most recent samples, so it stays bounded and the producer runs at full speed
regardless of how fast the consumer reads. Use them for any event or sample stream.

The runtime emits to a built-in set of these streams — the **`events` registry**,
exposed from `loom/observe` (loom watching its own pipeline, so it lives in
the observability surface, not the core). A meter reads its channels through one of
two **views**: `"count"` (the default — exact counts for rates, with zero per-event
allocation) or `"samples"` (the channel's retained ring records, for event streams
and value histograms):

```ts
import { channel, meter } from "loom"; // generic primitives
import { events } from "loom/observe"; // loom's own built-in streams

// Rates — the "count" view (default), allocation-free:
const rates = meter([events.write, events.effect]);
// Records — the "samples" view; for example, each flush's batch size + duration:
const flushes = meter([events.flush], "samples");
setInterval(() => {
  console.log("writes/s≈", rates.read()["loom:write"].count * 4);
  const last = flushes.read()["loom:flush"].samples.at(-1);
  if (last) console.log("last flush", last.batchSize, last.durationMs);
}, 250);

// Your own channel — count-only, or a bounded detail ring read via the "samples" view:
const paint = channel("app:paint", { capacity: 256, fields: ["ms"] });
paint.emit(16.7); // no-op and zero-alloc unless someone is metering it
// paint.active is true only while a meter is attached — gate expensive
// argument prep behind it when the values themselves are costly to build.
```

A `"samples"` view yields each channel's ring as untyped records;
`sampleOf<T>(record)` is the one sanctioned narrowing to a known payload shape
— `ReadSample` / `WriteSample` / `FlushSample` for the built-ins (above:
`sampleOf<FlushSample>(flushes.read()["loom:flush"].samples.at(-1))` types the
record as `{ batchSize, durationMs }`, carrying the `undefined` through). The
inspector's Trace tab is built on exactly this.

The built-in `events` record **non-internal** nodes only, so the idle baseline is
zero. The rest of `loom/observe` snapshots the reactive graph:

- `inspect()` returns a snapshot of the current graph (empty unless inspection is
  enabled via `configure({ inspect: true })`). Pass `{ active: true }` to skip
  state/computed signals with no subscribers — idle signals and "ghosts" (signals of a
  removed object, unreachable but not yet GC'd); effects are always kept.
- `inspectResources()` returns a live census `{ states, computeds, effects,
  targetedEffects, sources, scopes, channels, unread }` — one cheap walk, no
  per-node allocation. `targetedEffects` is the subset of `effects` that declared
  an `EffectOptions.target` (loom/dom's bindings set it to the bound DOM node, so
  tooling like the inspector reads them as "views"); `unread` is the count of
  states/computeds nothing currently reads (a rising count hints at a leak).

### Inspector

`loom/devtools` is a self-contained dev panel built entirely on the public
surface (`inspect`, `inspectResources`, `meter`/`events`, `scope`,
`poll`, `source`). Mount it to get a live, draggable, resizable overlay; it is
purely a consumer of the runtime, so the same data is available to any tooling
you write yourself.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/inspector-info-dark.png">
    <img src="./assets/inspector-info-light.png" alt="Inspector Info tab" width="320">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/inspector-graph-dark.png">
    <img src="./assets/inspector-graph-light.png" alt="Inspector Graph tab" width="320">
  </picture>
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/inspector-trace-dark.png">
    <img src="./assets/inspector-trace-light.png" alt="Inspector Trace tab" width="320">
  </picture>
</p>

<p align="center">
  <em><strong>Info</strong> — FPS, web-vitals and live pipeline rates ·
  <strong>Graph</strong> — signals grouped by source with current values ·
  <strong>Trace</strong> — the live event stream, pausable and filterable.</em>
</p>

```ts
import { mountInspector } from "loom/devtools";

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
import { configure } from "loom";
import { mountInspector } from "loom/devtools";

configure({ inspect: true }); // earliest opportunity — every node from here is visible
// ... build your app ...
mountInspector(); // or wire it to a hotkey via toggleInspector()
```

The panel has three tabs:

- **Info** — the `inspectResources()` census (states, computeds, effects, views,
  sources, scopes, channels, `unread`) plus live pipeline rates and page health
  (FPS, frame-time histogram, write/effect/create/dispose rates) driven by a
  `meter` over the built-in `events`.
- **Graph** — the reactive graph as a virtualized tree of state/computed signals,
  grouped by `props()` group. A filled dot means the signal drives a
  DOM node downstream; a hollow dot means it doesn't. Hovering a signal (or a group
  header) highlights every DOM target it feeds; the locate button scrolls the
  first target into view. Primitive signals are editable in place, and values
  flash on change.
- **Trace** — a live, newest-on-top causal trace of reactive events, read from the
  `loom:read` and `loom:write` channels' `samples` views. Each row shows the signal, the
  change (`prev → next` for writes), and the **source** — the effect/computed that read
  or wrote it (`by dom.class.chaos`), so the stream reads as "who did what". A header
  selector picks reads / writes / all; pause, clear, and a name filter narrow it; the
  last window (1k–25k, set from the menu) is kept, with filtered matches accumulating
  their own window. Hover a row to highlight the DOM node(s) the signal drives; click a
  name to jump to it in the Graph.

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
`loom` (using `props()`), `loom manual` (manually declared signals), and
`alien native` (native `alien-signals` signals).

```sh
pnpm run bench
```

With inspection off (the default), Loom measures statistically at parity with
native `alien-signals` — the three variants land within each other's error
margins run to run. The per-operation read/write/effect hot paths carry only
branch-predicted channel guards and otherwise match the native primitives — see
[Design notes](#design-notes) for the attribution. Enabling inspection
(`configure({ inspect: true })`) adds one metadata object plus a `WeakRef` per
node created, which widens the gap to ~`1.2x` on create-heavy work.

Two browser benchmarks run from the dev server. `/bench/` compares Loom DOM
bindings against a hand-written vanilla baseline on a js-framework-benchmark
style table workload. `/bench/compare/` drives Loom, ArrowJS, Shablon, and the
vanilla baseline through one shared command surface (create/update/swap/clear
1k rows, create 10k); as of July 2026 Loom leads or ties every op among the
frameworks and stays within ~3–8% of the vanilla floor — the table above is
generated from it. `/bench/morph/` benches `morph()` against Idiomorph on a
streaming-markdown workload (full-document and per-block-skip modes).

## Design notes

Loom's reactive graph is a vendored copy of `alien-signals`' propagation core
(`src/core/graph.ts`, 224 lines, MIT notice retained) — the library has zero
runtime dependencies. The public API stays small: callable signals,
computed reads, effects, batching, manual triggers, object field signals, and an
observability surface.

The v2 architecture — the vendoring, the tree-shakable core split, the
comparative benchmark harness, and the bench-gated experiments (including the
ones the gates rejected) — is recorded in the commit history; every
performance-relevant decision carries its measurements in the commit that
made it. The proposed next consolidation (node-lifetime as the unifying
ownership concept, surface pruning driven by real import data) is drafted in
[docs/api-consolidation.md](docs/api-consolidation.md).

The built-in event channels are gated by a per-channel meter count, so
reads, writes, computed updates, and effect runs stay allocation-free and pay
only a predicted-not-taken branch when nothing is metering them; records are
written into a pre-allocated ring. Inspection is opt-in
(`configure({ inspect: true })`): while it is off, nodes carry no metadata at
all; while it is on, each node carries a lightweight metadata record so
`inspect()` works without any further setup.

### Teardown

The teardown vocabulary is layered deliberately, and each return shape follows
from how the thing is used. In the core you **stop** processes: `effect()` and
`list()` hand back a bare `Stop` function because the disposer is the only
handle you need; `scope()` and `meter()` return objects because stopping is
one of several operations (`stop`/`pause`/`resume`, `read`/`stop`); and
`poll()` must stay callable, so its `stop` rides on the read
(`Polled = Read & { stop }`). In `loom/dom` you **dispose** trees —
`dispose(root)` tears down everything a subtree owns, `remove(node)` disposes
and detaches. In `loom/devtools` you **mount** and **unmount** the panel. Same
lifecycle, three altitudes: stop a process, dispose a tree, unmount a UI. New
APIs should pick the shape their layer already uses.

### Hot path

The per-operation read/write/effect path is deliberately kept at parity with the
underlying `alien-signals` primitives. The callable signal shape (`signal(...value)`
read/write dispatch) is the same one `alien-signals` uses, so Loom adds no
allocation of its own there.

The whole measured gap over native `alien-signals` is the channel
instrumentation — the `someCh.meters !== 0 && …` guard inlined at each
read/write/compute/effect/create/dispose site. A controlled experiment (stripping
just the state-path guards and re-running the chaos bench) attributes ~3% to it on
the manual-signals path: the cost of keeping observability always available with
zero allocation when idle. With the guards in place Loom lands at parity with
native (within run-to-run noise), and what margin remains *is* the channel
layer, not overhead to optimize away.

Two things are intentionally left as-is: the read/write rest parameter (shared
with `alien-signals`, so removing it would diverge from the reference for no real
win) and `kindOf`'s `in`-operator dispatch (off the measured hot path — it runs in
the dirty-check callbacks, which a state→effect graph barely exercises; a v2
experiment replacing it with a numeric field measured no win). Inspection
metadata is the one cost that *was* per-node allocation, which is why it is opt-in
and off by default.

## Develop

Loom is developed from source with `pnpm`:

```sh
pnpm install
pnpm run check   # tsc --noEmit
pnpm run lint    # biome
pnpm test        # vitest
pnpm run bench   # CLI benchmarks (chaos, micro, hot-path)
pnpm size        # per-entry bundle budgets (gzip)
pnpm run dev     # dev server
pnpm run build   # dist/loom (ES bundles) + dist/types (.d.ts)
```

`pnpm run build` compiles the `dist` that the `exports` map points at. **`dist`
is committed** (so a GitHub install needs no build step), so rebuild and commit
it whenever you change `src`. While developing Loom itself, its own `loom` /
`loom/*` imports resolve to `src` instead (a shared alias in `loom.aliases.ts`,
plus `tsconfig` `paths`), so `check` / `test` / `dev` never need a build.

With the dev server running, open `/demo/` for the realtime UI demo or `/bench/`
for the browser benchmark. The demo is a realtime stress UI written in Loom JSX:
it exercises signals, object props, computed values, effects, keyed list
reconciliation, direct JSX text/attribute/class bindings, cleanup through DOM
disposal, and the browser JSX runtime.

The browser benchmark (`/bench/`) is a
[js-framework-benchmark](https://github.com/krausest/js-framework-benchmark)-style
keyed-table suite that times Loom against a hand-written vanilla-DOM baseline
on the same operations — create 1k/10k rows, append 1k, update every 10th,
swap, select, remove, and clear. **Run** reports each operation's median time
and the Loom/vanilla ratio (plus a geo-mean) against indicative published
slowdowns for other frameworks; **Profile** re-runs Loom in a split mode that
separates synchronous reconciliation work from forced browser layout, so you can
see which of the two dominates a given operation. Compare ratios, not absolute
milliseconds — they are machine-specific. This is the in-browser counterpart to
the CLI `pnpm run bench` (the `bench/*.bench.ts` chaos, micro, and hot-path
suites).

## License

[MIT](./LICENSE) © Janos Veres

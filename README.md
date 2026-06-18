# Loom

Loom is a tiny runtime reactive UI layer for static-first pages and small
interactive surfaces. This package contains the core runtime, strict TypeScript
quality gates, a full core coverage gate, and a core benchmark.

> **Note:** This is a preview package under active development.

The demo, browser benchmark page, and dev inspector are not part of this
package yet. They will be added after the core API and behavior are stable.

## Goals

Loom keeps the public API compact while making advanced reactive behavior
explicit. It uses plain object state, effects, manual invalidation signals,
derived values, keyed DOM reconciliation, and observable runtime events.

The core API includes these pieces:

- `effect()` runs side effects and render effects.
- `state(obj, { label, namespace })` owns dev metadata in core.
- `signal()` creates explicit invalidation sources.
- `computed()` provides cached derived values.
- `scope()` groups disposal for complex UI teardown.
- `observe()` subscribes to runtime events.
- `depsOf()` returns semantic dependencies for effects.
- `classed()` is the class binding helper.

## Install dependencies

Install project dependencies from the package root:

```sh
pnpm install
```

Run the validation commands:

```sh
pnpm run check
pnpm test
pnpm run coverage
pnpm run lint
pnpm run bench
```

## Basic usage

Create reactive state with `state()`, then use `effect()` for side effects.
Effects auto-track state reads when you don't provide explicit dependencies.

```ts
import { effect, flush, state } from "loom";

const counter = state({ count: 0 }, { label: "counter" });

effect(() => {
  console.log(counter.count);
});

counter.count += 1;
flush();
```

Use `text()`, `classed()`, and `attr()` for DOM bindings. These bindings own
their effects, so `remove()` and `dispose()` can clean them up before a subtree
leaves the DOM.

```ts
import { classed, h, state, text } from "loom";

const item = state({ label: "Save", active: false });

const button = h(
  "button",
  {
    class: ["button", classed("active", () => item.active)],
    onclick: () => {
      item.active = !item.active;
    },
  },
  text(() => item.label),
);
```

## Explicit effects

Pass explicit dependency sources to `effect()` when you want a coarse render
effect that reruns only when named invalidators change. The effect body runs
untracked in this mode.

```ts
import { effect, list, signal } from "loom";

const structure = signal({ label: "row structure" });

effect(() => {
  list(container, rowModels(), {
    key: (row) => row.key,
    render: (row) => row.build(),
  });
}, [structure]);

structure.bump();
```

Use this pattern when a view derives rows from plain arrays, maps, browser
metrics, or other non-reactive data. `signal()` states that something external
changed without forcing that data into Loom state.

## Derived values

Use `computed()` for cached derived values. A computed value auto-tracks the
state it reads and notifies downstream effects when its value changes.

```ts
import { computed, effect, state } from "loom";

const cart = state({ prices: [10, 20] });
const total = computed(() => cart.prices.reduce((sum, price) => sum + price, 0));

effect(() => {
  console.log(total.value);
});
```

## Scoped cleanup

Use `scope()` to group effects, observers, and reactive DOM work under one
disposable owner.

```ts
import { effect, scope, state } from "loom";

const panel = scope({ label: "panel" });
const model = state({ open: true });

panel.run(() => {
  effect(() => {
    document.body.classList.toggle("panel-open", model.open);
  });
});

panel.dispose();
```

## Structural updates

Use `patch()` when one live element must match a fresh rebuild. Use `render()`
for a single-root container, and `list()` for keyed children.

```ts
import { h, list, patch, text } from "loom";

function rowView(row: Row) {
  return h("article", null, [
    h("h2", null, row.title),
    text(() => row.likes),
  ]);
}

patch(liveRow, () => rowView(row));

list(feed, rows, {
  key: (row) => row.id,
  render: rowView,
});
```

Keys must be unique within one keyed child set. By default, Loom throws on
duplicate keys. Use `configure({ duplicateKeys: "ignore" })` when you need
permissive keyed reconciliation.

## Runtime observation

Use `observe()` to subscribe to runtime events for diagnostics, profiling, and
developer tools.

```ts
import { observe } from "loom";

const observer = observe({
  mutation(event) {
    console.log(event.label, event.path, event.key);
  },
  dependency(event) {
    console.log(event.effect.label, event.dependency);
  },
  effect(event) {
    console.log("effect", event.label);
  },
  flush(event) {
    console.log("flush", event.batchSize, event.durationMs);
  },
  patch(event) {
    console.log("patch", event.kind, event.size);
  },
});

observer.dispose();
```

Observation stays out of the normal UI hot path. When no observer is registered,
Loom skips observer event construction for mutations, dependency reads, effect
runs, structural patches, and flush timing.

Use `depsOf(handle)` to inspect the current semantic dependencies for an effect.
It returns state, signal, and computed dependencies without exposing internal
slot objects.

## API

Loom exports these core functions and types from `src/loom.ts`.

| Export | Purpose |
| --- | --- |
| `state(obj, options?)` | Create a deep reactive proxy with optional `label` and `namespace`. |
| `signal(options?)` | Create an explicit invalidation source. |
| `computed(read, options?)` | Create a cached derived value. |
| `effect(fn, options?)` | Run an auto-tracked effect. |
| `effect(fn, deps, options?)` | Run an effect from explicit dependency sources. |
| `scope(options?)` | Create a disposable owner for grouped work. |
| `observe(observer)` | Subscribe to runtime events. |
| `depsOf(handle)` | Return semantic dependencies for an effect. |
| `untrack(fn)` | Read reactive data without subscribing the active effect. |
| `h(tag, props?, children?)` | Create an HTML or SVG element. |
| `key(node, value)` | Set `data-loom-key` and return the node. |
| `text(node, read, options?)` | Bind an existing element's text content. |
| `text(read, options?)` | Create a bound `<span>` element. |
| `classed(node, className, read)` | Toggle one class on an existing element. |
| `classed(className, read)` | Create a class binding for `h()` props. |
| `attr(node, name, read)` | Bind one attribute on an existing element. |
| `attr(name, read)` | Create an attribute binding for `h()` props. |
| `patch(live, nextOrBuild)` | Patch one live element from a fresh element or builder. |
| `render(container, build)` | Mount or patch a single-root container. |
| `list(container, models, options)` | Reconcile keyed element children from models. |
| `dispose(node)` | Dispose bindings owned by an element subtree. |
| `remove(node)` | Dispose an element subtree, then remove its root. |
| `effectsOf(node)` | Return effect handles owned by a node. |
| `flush()` | Run pending effects immediately. |
| `configure(options)` | Set scheduler and duplicate-key options. |
| `createScheduler(options?)` | Create an isolated scheduler. |
| `Disposable` | Common disposable handle shape. |
| `SchedulerHandle` | Isolated scheduler handle returned by `createScheduler()`. |
| `EffectOptions` | Options for labels and custom schedulers on effects. |
| `EffectHandle` | Disposable handle returned by `effect()` and bindings. |
| `Signal` | Manual invalidation source returned by `signal()`. |
| `SignalOptions` | Options for signal labels and namespaces. |
| `Computed` | Cached derived value returned by `computed()`. |
| `ComputedOptions` | Options for computed labels and namespaces. |
| `ScopeHandle` | Disposable owner returned by `scope()`. |
| `ScopeOptions` | Options for scope labels. |
| `Observer` | Runtime event observer shape. |
| `Dependency` | Semantic dependency returned by `depsOf()`. |
| `EffectDep` | Explicit dependency source accepted by `effect(fn, deps)`. |
| `MutationEvent` | Mutation event emitted by `observe()`. |
| `DependencyEvent` | Dependency-read event emitted by `observe()`. |
| `EffectEvent` | Effect-run event emitted by `observe()`. |
| `FlushEvent` | Flush event emitted by `observe()`. |
| `PatchEvent` | Structural patch event emitted by `observe()`. |
| `Child` | Type for values accepted as `h()` children. |
| `Props` | Type for values accepted as `h()` props. |
| `ClassBinding` | Type returned by `classed(className, read)`. |
| `AttrBinding` | Type returned by `attr(name, read)`. |
| `TextOptions` | Options for `text()`. |
| `ListOptions` | Options for `list()`. |
| `StateOptions` | Options for state labels and namespaces. |
| `ConfigureOptions` | Options for scheduling and duplicate-key handling. |

## Development

Use these scripts while working on Loom:

```sh
pnpm test
pnpm run coverage
pnpm run check
pnpm run lint
pnpm run format
pnpm run bench
```

Coverage is enforced at 100% for statements, branches, functions, and lines in
`src/loom.ts`. When behavior changes, update the focused tests in
`src/loom.test.ts` with the implementation.

TypeScript runs with strict module, optional-property, implicit-return, indexed
access, side-effect import, and unchecked-index checks enabled in
`tsconfig.json`.

The benchmark in `bench/core.bench.ts` measures core behavior: state writes,
effect scheduling, and keyed row reconciliation.

## Next steps

The next implementation phase is to add a demo and browser benchmark that
exercise the core under realistic DOM workloads. The inspector comes after that
and uses `observe()` and `depsOf()` for runtime diagnostics.

# Loom v2 architecture

This document records the research and recommendations behind the Loom v2
architecture: a zero-dependency, tree-shakable reshaping of the current
library, driven by benchmarks rather than a from-scratch rewrite. It compares
Loom against three contemporary designs (ArrowJS, Shablon, and SolidJS 2.0),
states what v2 keeps, adopts, and rejects, and defines the bench-gated roadmap
that decides every change. Research and benchmark facts are as of
July 2, 2026.

## Summary

Loom's reactive engine is already the state of the art: the propagation core
it builds on (`alien-signals/system`) is the same design SolidJS 2.0 credits
in its own source, and Loom benchmarks about 2x faster than ArrowJS and
Shablon under load. The v2 plan is therefore not a rewrite of the engine. It
is three low-risk structural moves — vendor the 224-line propagation core to
reach zero dependencies, split the core into internal modules for
tree-shaking, and gate per-entry bundle sizes in CI — plus a short list of
measured experiments (template-clone creation, `moveBefore` reconciliation,
an async resource primitive). No experiment ships without a benchmark win or
a proven zero cost.

## Baseline facts

These are the verified starting conditions that any change must be judged
against.

- Loom consumes exactly one file of its one dependency:
  `alien-signals/system.mjs`, 224 lines (MIT, Johnson Chu). It provides the
  linked-list graph operations `link`, `unlink`, `propagate`, `checkDirty`,
  and `shallowPropagate`. The package's remaining 370 lines (its bundled
  `signal`/`computed`/`effect` wrappers) are unused — Loom builds its own
  primitives on the raw system.
- Loom benchmarked ~2x faster than ArrowJS and Shablon under sustained load
  (project benchmark, 2026; external to this repo — stage 0 makes it
  reproducible in-repo).
- Current source size: core `loom.ts` 1,775 lines; `dom/index.ts` 749 lines.

## Measured evidence

All numbers in this section were produced on July 2, 2026 (Apple M2,
Node v22.21.1, vitest bench and esbuild 0.x via the repo toolchain) and are
reproducible with the commands shown. They are the proofs behind the
decisions and the yardsticks for the roadmap gates.

### Runtime: Loom is at parity with raw alien-signals

`pnpm bench` (`bench/chaos.bench.ts`, the full chaos core workload):

| Variant | hz | mean (ms) | rme |
| --- | --- | --- | --- |
| loom (fields cells) | 226.00 | 4.42 | ±1.49% |
| loom (manual cells) | 231.46 | 4.32 | ±1.04% |
| alien-signals native | 228.52 | 4.38 | ±1.02% |

All three are within each other's error margins: **Loom's full pipeline —
with the observability channel gates compiled in — is statistically
indistinguishable from raw alien-signals** on this workload (the manual-cells
variant measured 1.01x *ahead* of native in this run). This is the proof
behind "vendor, don't replace": there is no headroom left in the engine to
win by rewriting it. Supporting hot-path numbers from the same run: 100k
untracked reads at 16,998 hz, 100k writes at 14,468 hz, 10k state creates at
4,217 hz (inspection off).

### Bundle: per-entry cost today

Sizes of the built entrypoints (`pnpm build`, gzip -9):

| Entry | raw | gzip |
| --- | --- | --- |
| core chunk (shared by `loom`/`loom/observe`) | 18.1 kB | 5.86 kB |
| `loom/dom` | 7.7 kB | 2.71 kB |
| `loom/html` | 0.85 kB | 0.49 kB |
| `loom/dom/virtual-list` | 1.7 kB | 0.87 kB |

### Tree-shaking: what a minimal import pays today

Method: bundle small apps with esbuild (`--bundle --minify --format=esm`,
aliasing `loom` to `src/index.ts`), then gzip -9. This measures what a
consumer's bundler can actually shake, which the dist chunk sizes above
cannot show.

| App | imports | raw | gzip |
| --- | --- | --- | --- |
| minimal | `state`, `computed`, `effect` from `loom` | 10.1 kB | 4.00 kB |
| full core | `export * from "loom"` | 14.8 kB | 5.66 kB |
| minimal DOM | above + `h`, `text` from `loom/dom` | 13.7 kB | 5.41 kB |
| floor | same minimal app on raw `alien-signals` | 4.5 kB | 1.72 kB |

Reading: tree-shaking already removes ~1.7 kB gzip of unused exports
(`source`, `polled`, `fields`, `trigger`, and so on), but a minimal Loom app
still carries **~2.3 kB gzip over the alien-signals floor** — the channel
layer, inspect metadata paths, and deferred lane are reachable from
`state`/`effect` and cannot be shaken while they live in one module. Part of
that is Loom's identity (the hot-path channel gates stay by design); the
rest — inspect registration, the deferred lane, meter machinery — is what the
stage 2 module split targets.

## Expected outcomes

What the refactor delivers, quantified against the evidence above. Stated
plainly: **steady-state update performance does not increase** — the engine
already measures at parity with the fastest known core, and the roadmap's
gates exist to guarantee it does not *decrease*. The wins are elsewhere:

- **Zero runtime dependencies** (stage 1). Bundle delta ≈ 0 — the
  alien-signals code is already inlined in the core chunk — but supply-chain
  surface drops to nothing and the engine's hidden-class/flag discipline
  comes fully under Loom's control. The callback-indirection removal is a
  possible small hot-path win; it ships only if the benchmark confirms it.
- **Smaller minimal-import bundles** (stage 2). Target: minimal
  `state`/`computed`/`effect` app from 4.00 kB gzip to **≤3.0 kB gzip**
  (–25%), holding the channel gates. Full-core size unchanged; runtime
  unchanged (gate: bench-neutral).
- **Creation-path headroom** (stage 3, conditional). The one place research
  suggests real perf upside — clone-based creation for creation-heavy
  workloads. Unknown until measured; gated at ≥20% on create-10k with zero
  update-path regression.
- **State-preserving list moves** (stage 4) and **async DX** (stage 5) are
  developer-experience wins gated to be perf- and size-neutral respectively.

## Research findings

Three libraries were researched in depth from their actual sources. Each
contributes something to v2 — none replaces Loom's engine.

### ArrowJS (v1.0.6, ~4.6 kB brotli, zero dependencies)

ArrowJS pairs proxy-based reactivity with tagged-template rendering. Its
reactive core is weaker than Loom's — no equality cutoff at the set trap,
whole-array invalidation through parent emits, and id-indexed metadata arrays
that never shrink — but its rendering machinery contains the best creation
path of the surveyed group:

- Templates are cached per call-site by `TemplateStringsArray` identity: the
  static HTML is parsed once into a `<template>`, expression holes are
  located via sentinel comments, and hole positions are stored as a
  compressed integer path tape.
- Instances are `cloneNode(true)` copies drawn from an object pool; unmounted
  chunks are recycled by template signature for near-free remounts.
- Expression values live in a flat global pool; re-rendering `Object.is`-diffs
  each slot, so static holes update with no watcher at all.
- Events use one shared dispatcher that reads the current handler from the
  expression pool, so handler updates never rebind listeners.

### Shablon (v0.0.1-rc, ~6.6 kB minified, zero dependencies)

Shablon (by the PocketBase author, built for its plugin system) is a
1,071-line exercise in API minimalism: four exports (`store`, `watch`, `t`,
`router`), no components, no build step. Its reactivity — deep proxies with
string-path subscriptions (`"todos/0/title"`) — is the measured performance
loser: array reindexing patches parent references and deletes prefix-scan the
path map. Two ideas stand out anyway:

- Keyed reconciliation reuses elements verbatim (never patches them — their
  own bindings handle updates), minimizes moves with a longest-increasing-
  subsequence pass, and uses the state-preserving `Element.moveBefore` with
  an `insertBefore` fallback.
- Ownership is DOM connectivity: one global MutationObserver fires
  `onmount`/`onunmount` and tears down every watcher in a removed subtree.
  Elegant, but O(subtree) per mutation and unusable off-document.

### SolidJS 2.0 (`@solidjs/signals` 2.0.0-beta.15)

Solid 2.0 is the deepest redesign: a push-pull system with CHECK/DIRTY
two-color marking and a topological height heap (both descending from
Reactively), equality-gated propagation that enqueues only direct
subscribers, and — the headline — async folded into the graph itself. Any
memo may return a promise; pending-ness propagates as status bitflags,
enabling loading/error boundaries, automatic transitions, and optimistic
update lanes with no parallel primitive. Three observations matter for Loom:

- Solid's dependency-link structure carries source comments crediting
  `alien-signals` — the ecosystem converged on the engine Loom already uses.
- The async machinery (transitions, optimistic lanes, zombie queues) is most
  of the library's complexity, and the beta currently tracks a known
  creation-time regression versus Solid 1.
- Its scheduling went microtask-first (as did Vue and Svelte); Loom's
  synchronous flush is now a differentiator, not a lag.

## The v2 architecture

The v2 layout keeps the current entrypoint taxonomy (core → observe →
surfaces → devtools) and reorganizes the inside of the core for zero
dependencies and per-entry tree-shaking.

```
loom                    zero dependencies
├─ core/graph.ts        vendored alien-signals system (224 lines, MIT
│                       notice retained)
├─ core/signals.ts      state · computed · effect · scope · batch · untrack
├─ core/channels.ts     channel · meter (generic, gated ring buffers)
├─ core/defer.ts        deferred effect lane
loom/observe            events · inspect · inspectResources (opt-in)
loom/dom                h · JSX runtime · bindings · when/match/each/list
loom/dom/virtual-list   standalone windowing list
loom/tmpl               EXPERIMENT — tagged-template clone creation path
loom/async              EXPERIMENT — resource(): value/loading/error reads
loom/html               SSR string rendering
loom/devtools           inspector panel
```

### Decisions

Each decision below names its grounds.

- **Vendor the engine; don't replace it.** The 224-line system comes in-tree
  under `core/graph.ts` with its MIT notice. One structural experiment rides
  along: `createReactiveSystem` currently receives `update`/`notify`/
  `unwatched` as closure parameters; converting them to direct function calls
  removes an indirection on the hot path. Keep only if the benchmark says it
  wins.
- **Keep synchronous flush as the default.** Every surveyed competitor moved
  to microtask batching. Loom's sync flush means a write is observable in the
  DOM immediately — a real developer-experience property — and it is part of
  the benchmarked baseline. `batch()` and the deferred lane already cover
  coalescing. Revisit only with numbers.
- **Keep the observability layer verbatim.** Gated channels cost a measured
  ~3% when active and nothing when idle; opt-in inspection costs nothing when
  off. No surveyed library has an equivalent. This is Loom's identity
  feature.
- **Keep explicit ownership.** `scope()` plus node-owned disposers stays.
  Shablon's MutationObserver ownership is rejected for core (O(subtree)
  walks, document coupling); it could only ever be an optional addon.
- **Hold the API surface at the current curated core.** Tree-shaking makes
  unused exports free in bytes, so minimalism is a cognitive budget: the
  core keeps its ~15 audited exports, and every new capability must justify a
  new name. New APIs follow the teardown-shape rule already recorded in
  README "Design notes > Teardown".
- **Gate bundle sizes in CI.** Adopt ArrowJS's `size-limit` discipline with
  per-entry budgets: core ≤ ~3 kB gzip, dom ≤ ~3 kB gzip. Experiments pay
  for themselves in their own entrypoints or don't ship.

### Explicitly rejected

These were considered against the research and rejected for v2:

- **Proxy-based deep reactivity as the core model** (ArrowJS, Shablon): the
  measured 2x performance gap under load traces to exactly this layer —
  path-string subscriptions and whole-array invalidation.
- **Solid's transition/optimistic machinery**: the largest complexity item in
  the survey, solving problems (concurrent rendering, optimistic UI lanes)
  outside Loom's scope. If async lands at all, it lands as the minimal
  `resource()` experiment.
- **The height-heap scheduler**: it solves glitch-freedom that
  `alien-signals`' push-pull `checkDirty` already solves, with worse creation
  cost (Solid's own tracked regression).
- **MutationObserver ownership**: see decisions above.

## Bench-gated roadmap

The baseline principle: no stage ships on aesthetics. Every stage names its
hypothesis, the benchmark that decides it, and the go/no-go gate. Stages 0-2
are the actual restructuring and carry near-zero risk; stages 3-5 are
independent, skippable experiments.

| Stage | Hypothesis | Gate |
| --- | --- | --- |
| 0 | Baselines are locked: current `pnpm bench` suites plus a krausest-style create/update/swap-rows harness against ArrowJS and Shablon | Partially done — runtime and bundle baselines are recorded above (July 2, 2026); remaining: the in-repo comparative DOM harness that reproduces the external 2x result |
| 1 | Vendoring `alien-signals/system` is perf-neutral; direct calls beat the callback indirection | **Done** — vendored as `core/graph.ts`, loom-vs-native chaos ratio preserved (1.01x, two runs). The indirection removal was tested and **rejected**: importing the hooks across the loom↔graph module cycle measured ~2.2x slower on `write->effect x50k` (445 → 207 hz, rme ≤0.35%) — the factory's closure-captured hooks inline better than cross-cycle live bindings |
| 1a | Vendored-graph optimizations beat upstream (numeric `kind` field replacing the `in`-operator dispatch in the update/unwatched hooks) | **Rejected** — neutral-to-negative on every suite (`write->effect` 404–418 hz vs 420–445 baseline band; chaos unchanged). V8 already optimizes the upstream `in` probes; the extra node slot buys nothing |
| 2 | The internal module split changes nothing at runtime and shrinks per-entry bundles | **Done** — core split into `core/{graph,channels,meter,inspect}.ts`; meter/ring-writer and the whole inspect subsystem now load only with `loom/observe` (install-on-import hooks). Minimal app 4.00 → 3.29 kB gzip (−18%; 3.47 kB under the in-repo vite-esbuild that `pnpm size` gates on); minimal-dom −13%. The original ≤3.0 kB guess assumed extracting the deferred lane too — it stays by design so `effect({ defer })` works without extra imports. Bench-neutral after one caught regression (below); ring buffers now allocate lazily (runtime-memory win). Budgets enforced by `pnpm size`. Two behavior notes: `configure({ inspect: true })` requires `loom/observe` to be loaded (the devtools load it), and `onError` now receives the lean `NodeInfo` rather than a full `InspectNode`. Lesson recorded: under live-binding transforms (vitest/vite SSR), hot-path reads of imported bindings are per-access getters — the split initially measured **10x slower writes** until the channel nodes were aliased into module-local consts; the same mechanism explains the stage-1 cycle result |
| 3 | `loom/tmpl` template-clone creation beats `h()` on creation-heavy workloads | ≥20% on create-10k with zero update-path regression, else drop the entrypoint |
| 4 | `moveBefore` + LIS in `each`/`list` is bench-neutral and preserves node state across moves | No regression on list suites; state preservation verified in-browser |
| 5 | `loom/async` `resource()` adds zero cost when unused | Fully tree-shaken from apps that don't import it; DX evaluated separately |

## Sources

- ArrowJS: `standardagents/arrow-js` (v1.0.6, July 2026) — `packages/core/src/reactive.ts`, `html.ts`.
- Shablon: `ganigeorgiev/shablon` (v0.0.1-rc.21, June 2026) — `src/state.js`, `src/template.js`.
- SolidJS 2.0: `solidjs/solid` `next` branch, `packages/solid-signals` (2.0.0-beta.15, July 2026) — `src/core/*`, in-repo 2.0 RFC docs; "The Road to 2.0" (solidjs/solid discussion #2425).
- alien-signals: `node_modules/alien-signals/esm/system.mjs` (v3.2.1).
- Loom baselines: README "Design notes > Hot path"; project benchmark runs vs ArrowJS/Shablon (2026).

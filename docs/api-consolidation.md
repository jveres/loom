# API consolidation — the shape seam's feedback is pointing at

*Working note. The import census and thesis are from 2026-07-06; the naming
convention is implemented (2026-07-07). Remaining proposals are marked in the
Sequencing section.*

## Thesis

Three rounds of seam feedback grew `loom/dom` by six names, but by only **one
concept**: every request was "X, tied to a node's lifetime."

| request | shipped as | which is |
| --- | --- | --- |
| effect that dies with its node | `bind(el, fn)` | effect + lifetime |
| ResizeObserver without leak | `observeSize(el, cb)` | observer + lifetime |
| mount hook, before-paint | `onmount(el, fn)` | lifetime edge (enter) |
| disposal contract | `onunmount(el, stop)` | lifetime edge (exit) |
| reactive connectivity | `connected(el)` | lifetime as a signal |
| storage-backed state | `persisted(key, v)` | state + a *different* lifetime |

That is convergence pretending to be sprawl: **the node is a scope.** The
surface grew additively because each item was implemented on its own; none of
them was derived from the concept they share.

## Evidence: what consumers actually import

Import-site counts across every real consumer (seam `src/`, branching-tree
`demo/`, loom's own `demo/` and `src/devtools/`), counted per file,
2026-07-06:

```
11 effect        4 dispose        2 fields          1 each
 7 state         3 untrack        1 virtualList     1 connected
 6 onunmount     2 when           1 text            1 computed
 5 observeSize   2 watch          1 morph           1 batch
 5 bind          2 update         1 meter           1 attrOf
 4 scrollFade    2 tap            1 list            1 bindAttr
 4 persisted     2 scope          1 mountInspector  0 attr/classed/style
                 2 renderToString 1 inspect         0 match/trigger/mutate
                                                    0 poll/source/channel*
```

*(Census names are as of 2026-07-06; since renamed: `fields` → `props`,
`onunmount` → `onUnmount`, `tap` → `onTap`; `attrOf`/`bindAttr` were absorbed
into `attr`'s element forms.)*

*\* `poll`/`source`/`channel` are used by devtools internals via `loom`'s own
modules, but have no app-level importer.*

Readings:

- Usage concentrates in ~a dozen names: `state`/`effect` + the node-lifetime
  kit + `dispose` + a keyed list + escape hatches (`untrack`, `watch`,
  `update`).
- **`attr`/`classed`/`style` have zero external importers.** JSX made the
  descriptor factories invisible plumbing; they are de-facto internal API for
  the JSX runtime.
- `h` is barely imported directly — JSX again.
- `computed` appears in one file. Inline `() => …` reads in JSX cover most
  display-side derivation; computeds earn their keep for expensive/cached
  derivations, which real apps have few of.
- `match`, `trigger`, `mutate` and the public `channel()` have no customer
  pull yet.

The verbosity cost of the wide surface is **conceptual, not bytes** — every
entry is tree-shakable, so unused exports are free at runtime. The problem is
what the docs make a newcomer read, and how many names describe one idea.

## The three moves

### 1. Unify ownership (node-as-scope)

Loom has two parallel lifetime systems today:

- `scope()` — resource registry, `stop`/`pause`/`resume`, nests;
- the DOM layer's node-owned disposer WeakMap (`onunmount`,
  `dispose`/`remove` subtree walk).

If node lifetime *is* a scope (or carries one), then `bind`, `observeSize`,
`onmount`, `onunmount` become projections of one mechanism — and the next
"X + lifetime" request (IntersectionObserver, event listeners with lifetime,
rAF loops — they're coming) needs **no new API**, only the one registration
point. Capability gained for free: per-subtree `pause`/`resume` — freezing an
offscreen tab's bindings exactly the way the inspector already freezes itself
when minimized.

Gate: this touches the teardown path the keyed-list reconciler hammers (every
row exit runs the owned-disposer walk). Bench-gated like everything else —
the 1k-row clear/swap ops and the chaos bench must hold their bands.

### 2. Demote, don't just add

Candidates (all breaking → batched for v0.5, informed by the table above):

- ~~`attr`/`classed`/`style` → internal plumbing~~ — superseded: the naming
  round promoted all three to documented three-form signal accessors
  (descriptor / element read / element write binding) and absorbed the
  imperative binder into them.
- `when` folds into `match` (boolean selector is the degenerate case).
- `trigger` folds under `mutate` (trigger is its notify half).
- `poll` and `resource` positioned explicitly as sugar over `source` — they
  already are conceptually; the docs should say so instead of presenting
  three peer bridges.

### 3. Present families, not items

The browser bridges — `connected`, the element reads of
`attr`/`classed`/`style`, `observeSize`, `persisted`, `scrollFade` — are one
idea: *external browser state with loom lifetime*.
One docs section, one shared internal pattern (subscriber-counted shared
observers), five entries that read as variations.

## Naming convention

Implemented 2026-07-07; normative for all future surface work. The full rule
set also lives in the README.

- **`on…(el, …)`** — imperative twin of a JSX prop of the same name and
  spelling: `onMount`, `onUnmount`, `onTap`. A function takes this prefix
  only when the prop exists. Props additionally accept the all-lowercase
  spelling; generic `on<event>` props are lowercased before
  `addEventListener`, so both spellings wire every DOM event.
- **`observe…(el, cb, options?)`** — parameterized observation with node
  lifetime: `observeSize`, `observeIntersection`, `observeMutation`.
  Function-only: options exceed what a prop value can carry, and each wired
  prop adds its module to every `h()` bundle.
- **Unprefixed** — signals: `connected`, `persisted`, and the signal
  forms of `attr`/`classed`/`style`. Signal direction follows the state-signal
  convention — read without a value argument, write/bind with one; the JSX
  descriptor form is selected by a string first argument.
- **Behaviors** — apply an enhancement, return a disposer: `scrollFade`,
  `morph`, `virtualList`. Verb- or noun-accurate names; camelCase when
  multiword. Names that read as actions on the element (`resize(el)`) or
  collide with core exports are invalid. Widgets and standalone behaviors are
  subpath entrypoints (`loom/dom/virtual-list`, `loom/dom/scroll-fade`); the
  `loom/dom` barrel holds rendering, binding, lifecycle, and browser state.
  An umbrella entrypoint for behaviors requires three members.
- **Grain markers**: core reactivity is `watch` (tracked read, untracked
  callback, no DOM); DOM observation with node lifetime is `observe…`.
- Callback sugar over an existing signal is not added when the composition
  is a one-liner (`onUnmount(el, watch(connected(el), cb))`).

## Sequencing

1. **Next tag** — main carries the naming round (a breaking hard cut:
   `attrOf`/`bindAttr`/`tap`/`fields`/`own` removed) plus the kit and the
   browser bridges; consumers get a stable pin.
2. **v0.5 theme: node-as-scope + pruning** — ownership unification first
   (internal, bench-gated, non-breaking), docs taxonomy second, remaining
   deletions last (`when`/`match`, `trigger`/`mutate` folds — breaking,
   batched, justified by a fresh import census).

## Open questions

- Does node-scope nest into `scope()` (a row's scope inside the app scope),
  and what does `pause` of an ancestor mean for DOM bindings mid-frame?
- Does the `when`/`match` fold happen in v0.5, and does anything adopt
  `match` beyond the docs by then?
- Is `computed`'s low pull real or an artifact of small apps? (Cheap to keep
  either way — it's core to the engine; this only affects docs emphasis.)

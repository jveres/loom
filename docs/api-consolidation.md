# API consolidation — the shape seam's feedback is pointing at

*Status: proposal / working note, 2026-07-06. Nothing here is decided; this
records the analysis so the v0.5 discussion starts from evidence instead of
taste.*

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

- `attr`/`classed`/`style`/`bindAttr` → internal JSX plumbing; out of the
  headline docs (kept exported for the imperative escape hatch, or dropped —
  decide on a consumer census at the time).
- `when` folds into `match` (boolean selector is the degenerate case).
- `trigger` folds under `mutate` (trigger is its notify half).
- `poll` and `resource` positioned explicitly as sugar over `source` — they
  already are conceptually; the docs should say so instead of presenting
  three peer bridges.

### 3. Present families, not items

The browser bridges — `connected`, `attrOf`, `observeSize`, `persisted`,
`scrollFade` — are one idea: *external browser state with loom lifetime*.
One docs section, one shared internal pattern (subscriber-counted shared
observers), five entries that read as variations.

## Naming convention (agreed 2026-07-07)

The rule set that keeps the surface predictable as it consolidates:

- **`on…(el, …)` — imperative twin of a JSX prop of the same name.** The
  prefix is *earned by the prop*: `onmount`/`onunmount` (and `ontap`, pending
  the rename from `tap`) exist in both syntaxes, spelled identically, so prop
  and function are visibly one concept. No prop → no `on` prefix.
- **`observe…(el, cb, options?)` — parameterized observation with node
  lifetime.** `observeSize`, plus the proposed `observeIntersection` /
  `observeMutation`. These stay function-only (no JSX prop): they take
  options a prop value can't carry, and every wired prop costs baseline
  bytes for all `h()` users (measured: +231 B for `onmount`). Bare
  event-style names were rejected here because they read as actions —
  `resize(el)` looks like it resizes the element — and `mutate` collides
  with core's `mutate(source, fn)`.
- **Unprefixed names — signals and cells, the reactive grain.**
  `connected(el)` returns a `Read`; `attr` follows the callable-cell
  convention, direction by arity/first-arg:
  `attr(name, read)` = JSX descriptor, `attr(el, name)` = reactive read,
  `attr(el, name, read)` = node-owned write binding (absorbing `attrOf` and
  `bindAttr` — one name, three sides of "the attribute as a cell").
- **Callback sugar over signals is not added when it's a one-liner.**
  `onconnected` was deliberately rejected:
  `onunmount(el, watch(connected(el), cb))` composes from existing grain, and
  the name would fight both the rule (no prop) and the `connected()` signal.
- **Lowercase throughout** — the props ride the platform's own event-prop
  grammar (`onclick`, not `onClick`), and the functions match their props.

Status: rule agreed; the renames it implies (`tap` → `ontap`, `attrOf` +
`bindAttr` → `attr` overloads) and the two new observers are **proposed,
awaiting approval** — nothing implemented yet.

## Sequencing

1. **v0.4.0 now** — everything since v0.3.0 is additive
   (`connected`/`attrOf`/kit/`onunmount` rename); consumers get a stable pin.
2. **v0.5 theme: node-as-scope + pruning** — ownership unification first
   (internal, bench-gated, non-breaking), docs taxonomy second, deletions
   last (breaking, batched, justified by a fresh import census).

## Open questions

- Does node-scope nest into `scope()` (a row's scope inside the app scope),
  and what does `pause` of an ancestor mean for DOM bindings mid-frame?
- Do `attr`/`classed`/`style` stay exported-but-undocumented, or go? (Check
  imports again when v0.5 starts; seam's `bindAttr as bindDomAttr` alias is
  the one live consumer today.)
- Is `computed`'s low pull real or an artifact of small apps? (Cheap to keep
  either way — it's core to the engine; this only affects docs emphasis.)

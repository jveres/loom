# Loom 0.9.0

Version 0.9.0 speeds up reactive effect creation, deep scope pause/resume,
deferred effect scheduling, and DOM bindings, deduplicates internal helpers across
families, and shrinks every bundle while making no breaking API changes.

## Performance

- **Bitflag node & lifecycle discrimination**: `Computed`, `Source`, `Paused`, and
  `Deferred` are encoded directly in the upper bits of `node.flags` alongside
  graph propagation flags, and `EffectNode` instances use a fixed monomorphic
  shape with zero missing-property `.meta` reads on the unobserved path.
- **Transition-guarded scope pause propagation**: `bumpPausedCount` walks scope
  effects only when a scope's `pausedCount` transitions between `0` and `1`.
- **Monotonic deadline fast path in `loom/defer`**: `deferEffect` skips binary
  heap pushes while queued `maxStale` deadlines remain monotonic, lazily
  materializing the heap only when a tighter deadline arrives out of order.
- **DOM hot-path refinements**: `h()` / JSX reactive attribute, class, style, and
  form-property bindings register directly with node ownership without
  allocating per-binding manual stop closures; `reconcileKeyed` folds key
  validation and existing-row lookup into a single pass; `positionOrdered`
  short-circuits when no desired nodes are missing or all present nodes are in
  order; `virtualList` tracks live rows with a monotonic pass counter instead of
  allocating a `Set` per pass.

Representative benchmark improvements (`vitest bench`):

| Workload | Change |
| --- | ---: |
| `create-stop/10000-effects` | −32.5% |
| `scope/10000-effects` | −25.0% |
| `depth 50: dirty-while-paused + resume` | +126.1% ops/s |
| `10k deferred effects: budgeted continuation chunks` | +86.3% ops/s |

## Size

All fixture and whole-family bundle sizes decrease:

- Minimal core (`state` + `computed` + `effect`): `3,031 B` gzip (budget `3,500 B`)
- Full core (`loom`): `4,699 B` gzip (budget `6,000 B`)
- Minimal DOM (`h` + `text`): `5,817 B` gzip (down 177 B; budget `6,050 B`)
- Full `loom/dom`: `10,003 B` gzip (down 170 B; budget `10,240 B`)
- `loom/devtools`: `29,692 B` gzip (budget `29,952 B`)

Install from the GitHub tag with `pnpm add github:jveres/loom#v0.9.0`.

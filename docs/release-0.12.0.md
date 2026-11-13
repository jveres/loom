# Loom 0.12.0

Version 0.12.0 delivers a measured >2× performance pass across reactive state
mutation, keyed DOM reconciliation, live HTML morphing, and server-side HTML
serialization, tightens internal ownership and reconciliation architecture
within every family bundle budget, and replaces the root demo with the Loom
Observatory. There are no public API breaks and no new runtime dependencies.

## Runtime, DOM, and SSR performance

- **Direct `mutate()` and `trigger()` resolution (`2.06×–2.22×` faster)**:
  plain `state()` accessors cache their backing `StateNode` lazily on first
  `mutate`, `trigger`, or `hasStateSubscribers` call instead of allocating,
  linking, and tearing down a temporary watcher node on every invocation, with
  a direct single-subscriber effect queue path. Production ESM throughput
  (`node bench/core-production.mjs`, 50,000 updates) improves from `2.92 ms` to
  `1.32 ms` (`2.22×`) for `mutate` and `2.78 ms` to `1.35 ms` (`2.06×`) for
  `trigger`.
- **Keyed DOM reconciliation (`1.72×–3.84×` faster)**: `placeKeyedNodes` trims
  shared prefixes and suffixes before consulting the Longest Increasing
  Subsequence fallback, fast-paths single-element moves and two-element swaps
  in constant time without auxiliary maps, and folds unchanged/append/prepend
  checks into a zero-allocation sibling scan. `reconcileKeyed` stores optional
  `update()` item baselines on the owned row element rather than maintaining a
  parallel per-list `Map`. In Chromium 158 (`bench/dom-performance.ts`),
  1,000-row `keyed/swap` drops from `0.169 ms` to `0.044 ms` (`3.84×`),
  `keyed/unchanged` from `0.075 ms` to `0.031 ms` (`2.46×`), and `keyed/remove`
  from `0.141 ms` to `0.064 ms` (`2.20×`).
- **Live HTML `morph()` (`1.56×` faster; `2.55×` faster than Idiomorph)**:
  unkeyed `morph()` without `skip` walks live child pointers in place with zero
  array or map allocations, while attribute syncing walks `NamedNodeMap`
  directly. Across the 180-tick streaming article benchmark
  (`bench/morph-stream.ts`), full-tree `morph()` drops from `65.2 ms` to
  `41.7 ms` (vs `106.4 ms` for Idiomorph).
- **SSR HTML escaping and serialization (`1.54×–2.11×` faster)**: `escapeText`
  returns clean strings without replacement passes, `serializeStyle` avoids
  intermediate entry arrays, and `loom/async` `resource.refresh()` advances its
  internal counter state directly instead of pulling `trigger` into the async
  bundle (`loom/async` drops by 223 B gzip). In `node bench/html-production.mjs`,
  `escapeText/200-clean` improves `2.11×` (`0.0132 ms` to `0.0063 ms`),
  `serializeAttributes/200-rich` `1.78×`, and `html` tagged templates `1.60×`.

## Loom Observatory demo

The root demo (`/`, `index.html`, `demo/main.tsx`) is now the **Loom
Observatory**, pairing live `loom/observe` pipeline telemetry and a frame-time
oscilloscope with interactive proofs of Loom's architecture:

1. **336-cell Harmonic Signal Matrix**: real reactive DOM cells driven by wave
   interference and pointer ripples up to `40×` overdrive, split into a live
   left hemisphere and a `pause()` / `resume()` time-freezable right hemisphere
   with optional `MutationObserver` DOM X-Ray highlighting.
2. **Atomic `moveBefore()` & Minimum-Move LIS workbench**: 8 live instrument
   channels with continuous CSS orbital animations and text inputs that retain
   focus, caret position, and animation phase while reordering.
3. **Live streaming `morph()` with `skip` islands**: progressive HTML token
   reconciliation around a protected client-reactive island whose counter and
   input state survive every morph pass.

Qualification: zero-warning lint, strict TypeScript 7 check, 618 unit tests
(including exhaustive 6-row 720-permutation minimum-move verification), 60
database checks and 21 platform checks per Chromium/Firefox/WebKit plus both
Chromium forced-GC retention scenarios, 15 Stockroom demo workflows per engine
and subpath production build, all 20 family budgets and 9 bundle size gates,
samples, API snapshot check, and clean distribution rebuild.

Install with `pnpm add github:jveres/loom#v0.12.0`.

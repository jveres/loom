# API consolidation measurements

These measurements compare the consolidation with commit `51df3fb` on September
5, 2026. They validate specific workloads on one machine; they are not a
cross-browser performance guarantee. The vendored graph algorithm is unchanged.

## Verification results

The final implementation passes the following checks.

- TypeScript 7.0.2 checks the complete repository and emitted declarations.
- All 546 tests pass across 58 files, with no skips. Vitest workers receive
  `--execArgv=--expose-gc`, including the existing meter/scope retention tests and
  the new long-lived-node binding retention test.
- Biome reports no lint or formatting issues. README compilation checks seven
  self-contained examples. Library and demo builds pass.
- An actual npm tarball installs into a temporary consumer outside the checkout.
  Strict TypeScript 7 consumers pass Bundler and NodeNext resolution without
  source aliases. All 19 entrypoints import in Node 22 without DOM globals.
- Exact runtime exports and 60 reachable declaration files match reviewed
  fixtures. Negative compile checks reject removed imports, synthetic interaction
  props, descriptor types, unschematized keyed state, and unchecked storage.
- Chromium 152 passes 16 browser assertions covering keyed focus/selection,
  virtual-window cache behavior, iframe frame cancellation, native observer
  teardown, pointer fallback cancellation, finite animation repetitions, and
  stopped transition completion.
- Browser forced-GC checks retain zero of 1,000 removed nodes while their resource
  group remains live, both with and without a creating reactive scope. The new
  lifetime requires Loom removal/disposal; native removal plus scope stop no
  longer ends node-owned bindings.

## Composed bundle fixtures

These are minified ESM bytes compressed with gzip level 9 through the package's
real exports and side-effect metadata. The same fixtures run against the tarball.

| Fixture | Baseline bytes | Consolidated bytes | Ceiling |
| --- | ---: | ---: | ---: |
| Minimal state/computed/effect | 2,929 | 3,001 | 3,500 |
| Complete root exports | 5,281 | 4,568 | 6,000 |
| Minimal with deferred lane | 3,743 | 3,808 | 4,350 |
| Minimal with observation hooks | 3,584 | 3,649 | 3,664 |
| Async resource | 3,103 | 3,156 | 3,700 |
| Quiet-period watcher | 3,268 | 3,427 | 4,000 |
| DOM h/text | 5,860 | 5,970 | 6,000 |
| Standalone virtual list | 1,439 | 2,010 | 2,100 |

Only the pre-existing observation ceiling changes, from 3,600 to 3,664 bytes.
The accepted 65-byte baseline increase reflects the explicit untrack hook and
core boundary used to keep platform helpers standalone. It retains a measurable
side-effect delta, so a stripped instrumentation import fails the gate.

The root loses model helpers, reducing its complete export cost by 713 bytes.
Minimal core adds 72 bytes. Uniform binding stops, signal handling, and corrected
lifecycle behavior add 110 bytes to minimal DOM, within its original ceiling.
Virtual-list terminal teardown and explicit document/signal support add 571
bytes, within its original standalone ceiling. These are accepted correctness
and API-consistency costs; there is no claim that every fixture becomes smaller.

Complete-family budgets are established in `api/bundle-budgets.json`, separately
from these representative workflows. Their first ceilings use measured packed
builds with narrow rounding headroom. Whole-family exports are not estimates for
single-operation imports. Absence checks verify that h/text excludes tap policy,
a storage slot excludes DOM and reactive-engine implementation, frame delays
exclude watches, and virtual lists exclude the reactive engine. Unused ordinary
helpers produce the same bundle as an empty marker fixture.

## Runtime comparisons

Browser keyed/windowing measurements use `runBenchmarks(9, 100)` from
`bench/dom-performance.ts` in Chromium 152. Each value is milliseconds per
fixture run; keyed operations are out-and-back pairs. Setup is excluded.

| Browser workload | Baseline median | Consolidated median |
| --- | ---: | ---: |
| Keyed unchanged | 0.093 | 0.113 |
| Keyed append | 0.110 | 0.127 |
| Keyed prepend | 0.106 | 0.126 |
| Keyed removal | 0.160 | 0.174 |
| Keyed swap | 0.244 | 0.254 |
| Keyed reverse | 0.781 | 0.863 |
| 100 independent regions | 0.010 | 0.011 |
| Stationary virtual window | 0.002 | 0.003 |
| Virtual movement within window | 0.004 | 0.004 |
| Virtual boundary crossing | 0.040 | 0.040 |
| Remove 900 of 1,000 grouped nodes | 0.510 | 0.519 |
| Revision churn, 1,000 keys | 0.125 | 0.127 |

The keyed workloads show a measurable cost in this run, up to 0.082 ms per
out-and-back reverse operation. Accept this for the explicit untracked callback
and lifetime contracts, while retaining the existing reconciliation algorithm.
Earlier paired runs varied; these numbers do not establish statistical parity.
Windowing's unchanged-window optimization and group release remain intact.

`runConstructionBenchmarks(15, 1000)` measures construction plus explicit removal
of 1,000 bound nodes. The baseline medians were 0.32 ms without a creating scope
and 0.28 ms with one; consolidation measured 0.40 ms and 0.28 ms. This includes
returned stops. A first implementation measured 0.58/0.48 ms and held duplicate
lifetime records; the final implementation removes those records and unregisters
stopped bindings from their nodes.

Production ESM checks use Node 22.21.1 and `bench/core-production.mjs`. Two runs
in separate processes produced these ranges of medians, in milliseconds.

| Core workload | Baseline range | Consolidated range |
| --- | ---: | ---: |
| Create 10,000 states | 0.0757–0.0759 | 0.0797–0.0815 |
| Create 10,000 computeds | 0.1291–0.1291 | 0.1438–0.1452 |
| Create/stop 10,000 effects | 0.2742–0.2792 | 0.2691–0.2744 |
| Mutate 50,000 times | 2.7046–2.9611 | 2.9752–2.9863 |
| Trigger 50,000 times | 2.5239–2.8003 | 2.6944–2.7224 |
| Scope lifecycle, 10,000 effects | 0.4637–0.5230 | 0.4697–0.4716 |

The small creation cost is recorded rather than presented as a speedup. An
intermediate design moved mutable tracking state across a module boundary and
caused much larger source-benchmark slowdowns. The final hook keeps that state
local to the core. The full Vitest benchmark suite also completes; production
measurements avoid treating Vitest's module transformation as shipping code.

## Reproduce and qualify the release

Run package checks and benchmarks from a built checkout.

```sh
pnpm run build
pnpm run check:package
pnpm run samples
pnpm test
pnpm run bench
node bench/core-production.mjs
pnpm run dev
```

In the browser, import `/bench/dom-browser-checks.ts` and call
`runBrowserChecks()`. Import `/bench/dom-performance.ts` for `runBenchmarks`,
`runConstructionBenchmarks`, and `measureRetention`. Retention requires Chromium
started with `--js-flags=--expose-gc`. Use a separate baseline checkout and the
same browser/Node version for comparisons; do not benchmark concurrent workloads.

Release qualification for v0.6.0 adds `pnpm run check:browser`: Chromium
151.0.7922.34, Firefox 153.0, and Playwright WebKit 26.5 each pass 18 checks,
including popup and iframe contexts. Both Chromium retention scenarios pass.
WebKit lacks `Element.moveBefore`; its reorder checks verify identity and input
values, while focus and selection preservation require native atomic moves.
Native Safari is not separately tested. The maintained `markdown-viewer` consumer
is migrated to the v0.6.0 GitHub tag in commit `4baed95`; its lockfile pins
release commit `e1e3c5e`. The installed release passes all 910 viewer tests and
three stress scenarios, as well as type checks and the package build.

# DOM performance and retention benchmarks

The stage 5 comparison uses `b7e3a02` as its baseline. The retained changes
reduce work for contiguous keyed regions, skip source traversal on unchanged
scroll windows, and release individually stopped entries from resource groups.

## Results

Measured on September 5, 2026, with Chromium 152 on macOS 26.6.2 (arm64).
The table shows median milliseconds per operation from 11 samples of 400
iterations after 30 warmup operations. Fixture setup is excluded. Keyed
operations update out and back, so each iteration contains two reconciliations.
Each sibling-region fixture changes one 100-row region; ordinary keyed
fixtures contain 1,000 rows.

| Workload | Baseline ms | Candidate ms | Change |
| --- | ---: | ---: | ---: |
| keyed/unchanged | 0.16150 | 0.09200 | -43.0% |
| keyed/append | 0.17800 | 0.11050 | -37.9% |
| keyed/prepend | 0.17775 | 0.10850 | -39.0% |
| keyed/remove | 0.18175 | 0.15350 | -15.5% |
| keyed/swap | 0.24525 | 0.24925 | +1.6% |
| keyed/reverse | 0.69300 | 0.68900 | -0.6% |
| regions/1 | 0.01375 | 0.00925 | -32.7% |
| regions/20 | 0.06250 | 0.00950 | -84.8% |
| regions/100 | 0.26575 | 0.00925 | -96.5% |
| virtual/stationary | 0.00275 | 0.00200 | -27.3% |
| virtual/within | 0.00400 | 0.00325 | -18.8% |
| virtual/boundary | 0.02800 | 0.02775 | -0.9% |
| group/remove-900-of-1000 | 0.48575 | 0.45100 | -7.2% |
| revisions/churn-1000 | 0.12450 | 0.12525 | +0.6% |

A separate run with 11 samples of 200 iterations gave the same broad result.
Swap medians increased 1.6–4.6% between runs; the ranges overlap, so these
measurements don't establish a reorder speedup or a precise regression bound.
Reverse, window-boundary, and revision-churn timings stayed close to baseline.
See [raw sample summaries](results/dom-stage5.json) for both runs' medians,
minima, and maxima.

The virtual fixtures use real browser geometry, a 400 px viewport, 20 px rows,
six overscan rows, and a 10,000-item source. They dispatch a scroll event and
synchronously execute its scheduled frame callback to isolate reconciliation
cost from frame pacing. Geometry reads remain in every scroll pass, so layout
changes still affect the calculated window. Paint and compositing costs require
a separate frame-level benchmark.

The group workload creates 1,000 rows, removes 900, and disposes the group.
A separate forced-GC check keeps the group live after all 1,000 rows stop:
the baseline retains all 1,000 nodes; the candidate retains zero. This holds
for both granular Loom removal and scope-stopped bindings on detached nodes.
GC measurement runs in a separate task after the construction helper returns,
avoiding local variables keeping the last row alive.

## Decisions

- Keep the contiguous-region check. It scans desired members without allocating
  the desired-position map or scanning unrelated siblings. It handles unchanged
  rows and insertions around an unchanged region, including append and prepend.
- Keep the existing LIS fallback for genuine reorders and interleaved unmanaged
  siblings. Partial prefix/suffix trimming and cached region boundaries add
  invariants around externally moved nodes; the simpler contiguous check
  addresses the measured common-case cost. Fallback scans remain parent-wide.
- Cache only successful scroll windows. `refresh()` still scans the source and
  its keys; `setItems()` changes the revision and updates visible content.
  A failed pass remains retryable.
- Unlink stopped group entries in constant time. Preserve a separate registration
  ordinal for ordered cleanup; suspend array compaction while disposing the group.
  Grouped raw effects also unlink when their owning scope stops.
- Keep revision pruning as implemented in stage 4. Churning and pruning 1,000
  paths leaves zero retained counters, and this comparison found no reason to
  add more revision bookkeeping.

Nine new tests preserve cleanup ordering, repeated disposal, scope-stop behavior,
virtual refresh/retry behavior, and minimum DOM moves across all 120 permutations
of five rows. Seven Chromium checks verify focus/identity and real scroll events.
All 529 tests, type checking, lint, build, and eight bundle budgets pass.
Minimal core grows from 2,906 to 2,929 B gzip; minimal DOM from 5,680 to
5,854 B; standalone virtual list from 1,391 to 1,445 B.

## Reproduce

Start Vite from the repository:

```sh
pnpm exec vite --host 127.0.0.1 --port 4179
```

Open `http://127.0.0.1:4179/bench/dom-performance.html` in Chromium. In its
console, run:

```js
const bench = await import("/bench/dom-performance.ts");
await bench.runBenchmarks(11, 400);
```

For retention checks, start Chromium with `--js-flags=--expose-gc`, then run:

```js
await bench.measureRetention();
await bench.measureRetention(true); // owning-scope stop
const checks = await import("/bench/dom-browser-checks.ts");
await checks.runBrowserChecks();
```

For the baseline, extract `src` from `b7e3a02` into a temporary directory,
copy the same benchmark files into its `bench` directory, and serve that
directory with Vite on another port. Run each version sequentially in the same
browser session, with no tests or builds running concurrently. Repeat the
comparison on other engines before drawing cross-browser conclusions.

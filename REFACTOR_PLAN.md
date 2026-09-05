# Loom refactor plan

Track the architecture review fixes across sessions. Complete correctness work
before API expansion or performance refactoring. Keep each stage independently
reviewable, and record verification and decisions here before handing off.

Baseline: September 5, 2026; type checking and all 455 tests passed. The review
also reproduced computed recovery failures, source ownership conflicts, leaked
list bindings, incomplete list teardown, and inconsistent memo tracking.

## 1. Computed exception recovery

Status: complete. Successful propagation and the vendored graph are preserved.

- [x] Keep failed computed evaluations retryable; never return an invalid cache.
- [x] Route dependency-check failures through the effect error boundary.
- [x] Preserve subscriptions so valid dependency updates recover consumers.
- [x] Cover initial failure, repeated reads, update failure, nested derivations,
      recovery, cleanup, and sibling effects continuing under a boundary.
- [x] Run type checking, core regression tests, graph differential tests, and
      the full test suite.

Acceptance: failed reads consistently throw until evaluation succeeds, effects
recover after valid writes, and handled errors do not abort unrelated effects.

## 2. DOM construction and teardown

Status: complete. Stop must be terminal and idempotent; teardown must attempt all
cleanup before reporting failures.

- [x] Prevalidate keyed-list identities before rendering rows.
- [x] Release staged resources when rendering or insertion fails.
- [x] Remove stale bookkeeping even when row cleanup throws.
- [x] Finish all row removals during list teardown.
- [x] Audit `each()` and dynamic branches for equivalent failure paths.
- [x] Test abandoned bindings, throwing cleanup, and repeated disposal.

Acceptance: failed construction leaves no active abandoned bindings; teardown
leaves no rows or subscriptions behind even when individual cleanups fail.

## 3. Shared-source ownership

Status: complete. Distinguish shared subscriber-owned producers from producers
explicitly owned by a scope.

- [x] Add an internal construction path for shared cached sources.
- [x] Prevent scope-owned connections while paused or after terminal stop.
- [x] Audit connectivity, attribute, class, style, and other pooled reads.
- [x] Document escaped scope-owned source behavior.
- [x] Test two independent consumer scopes and terminal reconnection guards.

Acceptance: one consumer cannot disconnect another consumer's shared producer;
scope-owned producers cannot reconnect outside their owner's active lifetime.

## 4. Public helper contracts

Status: complete. Additive APIs preserve existing callers; final contracts and
verification are recorded below.

- [x] Give `list()` and `each()` consistent same-key item update support while
      retaining the stable-model fast path.
- [x] Run `weakMemo()` computation untracked, matching its imperative contract.
- [x] Add typed keys or a schema for `keyedStates()`; separate factory creation
      from ordinary function-valued state.
- [x] Reject empty revision separators.
- [x] Add revision retention controls without splitting actively observed paths
      into independent cells.
- [x] Add behavioral tests, compile-time API checks, and usage documentation.

Acceptance: immutable item replacement can update without rebuilding DOM;
memo tracking is consistent; keyed values retain type safety; invalid revision
grammar fails immediately.

## 5. Performance and retention

Status: pending. Measure before optimizing; retain changes only with evidence.

- [ ] Benchmark unchanged, append, prepend, removal, and reorder workloads.
- [ ] Benchmark multiple keyed regions sharing one parent.
- [ ] Benchmark virtual scrolling within and across window boundaries.
- [ ] Measure revision-path churn and granular removal within resource groups.
- [ ] Evaluate region-bounded scans and prefix/suffix fast paths while retaining
      LIS for genuine reorders.
- [ ] Evaluate unchanged-window early exits and layout-read costs.
- [ ] Release stopped resource-group entries without changing cleanup order.

Acceptance: demonstrate runtime, allocation, or retention improvements without
regressing DOM identity, cleanup ordering, or representative benchmarks.

## 6. Structural cleanup

Status: pending. Refactor around verified lifecycle invariants.

- [ ] Extract cohesive scope-ownership and keyed-reconciliation internals.
- [ ] Consolidate narrow lifecycle and error-handling helpers.
- [ ] Correct stale comments and move benchmark history out of runtime code.
- [ ] Document ownership, tracking, equality, and disposal consistently.
- [ ] Verify type checking, lint, tests, library build, bundle sizes, relevant
      benchmarks, and real-browser behavior for browser-sensitive changes.

Acceptance: preserve the vendored graph algorithm and optional-addon boundaries;
avoid mixing structural changes into correctness fixes.

## Decisions and verification

Record completed work, commands, results, and outstanding limitations here.

- Stage 1 committed as `b57e268` on September 5, 2026. Added 11 regression cases in
  `src/computed-errors.test.ts`; the initial nine reproduced failures before
  the fix.
- Error contract: cache the thrown value separately from the last successful
  result until dependency invalidation. Subscribe consumers before rethrowing.
  Recovery counts as a change even when the successful value is unchanged.
- `pnpm run check` and direct TypeScript checking of the new test file passed.
- `pnpm test`: 52 files and 466 tests passed, including graph differential
  coverage. `pnpm run lint`, `pnpm run build`, and `git diff --check` passed.
- `node scripts/size.mjs`: all eight budgets passed; minimal core 2,882 B gzip,
  full core 4,965 B gzip. Tracked distribution files were regenerated.
- `pnpm exec vitest bench --run bench/core-algorithm.bench.ts` completed all
  15 cases. Computed chain depth 25: Loom 1.750M ops/s; alien-signals 1.757M
  ops/s in this run. No before/after baseline was collected, so this is a
  benchmark smoke check, not evidence of a speedup or absence of regression.
- Later API decisions remain open; no public signature changes are required for
  stage 1.

- Stage 2 completed on September 5, 2026. Added 17 regression cases in
  `src/dom/reconcile-errors.test.ts`; 13 of the initial 14 cases failed before
  the fix. The final cases cover nested resource groups, rollback errors, and
  conditional insertion failure.
- Construction uses an internal, nestable journal of node-owned resources. It
  releases abandoned bindings without changing public resource-group nesting.
  New keyed rows are published only after placement succeeds; stale keys are
  removed from bookkeeping before running their cleanups.
- Conditional branches commit the new branch before removing old content.
  Cleanup failures cannot leave the selected branch missing or prevent sibling
  teardown. Rollback covers node-owned resources, not arbitrary callback side
  effects or restoration of partially reordered existing DOM after custom
  insertion/move implementations throw.
- Stage 2 verification: `pnpm run check`, direct TypeScript checking of the new
  test file, `pnpm run lint`, `pnpm test` (53 files, 483 tests),
  `pnpm run build`, and `git diff --check` passed.
- All eight bundle budgets pass. Minimal DOM is 5,653 B gzip, up 16 B from
  stage 1; minimal core remains 2,882 B gzip. Distribution files regenerated.
- Chromium 152 smoke checks passed for live-row preservation, abandoned binding
  cleanup, and successful retry in both keyed APIs, plus complete conditional
  teardown after a throwing disposer. Other browser engines were not run.

- Stage 3 completed on September 5, 2026. Added 19 regression cases across
  `src/source-ownership.test.ts` and `src/dom/shared-sources.test.ts`; the
  initial 16 cases all failed before implementation.
- Internal `sharedSource()` creates subscriber-owned sources without inheriting
  the first caller's scope or inspection defaults. Connectivity, attribute
  reads (including derived class/style reads), media queries, hover/focus, and
  pressed state use it. Uncached `scrollEdges()` and devtools producers remain
  scope-owned. Public entrypoint signatures are unchanged.
- Scoped sources check owner pause/stop state before connecting, including
  reads during another resource's lifecycle callback. Terminal stop releases
  the source's reference to its scope. Reentrant connection setup disposes an
  obsolete teardown without overwriting a newer connection.
- Intentional behavior change: callbacks from a disconnected producer are
  ignored after teardown returns. Synchronous final teardown values remain
  supported. The existing meter/source coverage assertion was updated because
  it previously expected a retired callback to keep changing the value.
- Shared sources remain connected while subscriptions exist, including paused
  subscriptions. Stopping the last subscriber disconnects the producer.
- Stage 3 verification: project and direct test-file TypeScript checks, lint,
  `pnpm test` (55 files, 502 tests), build, and `git diff --check` passed.
  All eight size budgets pass: minimal core 2,907 B gzip, full core 5,043 B,
  minimal DOM 5,680 B. Tracked distribution files regenerated.
- Chromium 152 checks passed for shared attributes/connectivity across consumer
  pause/stop, paused connection guards, ignored retired callbacks, and terminal
  reconnection guards. Other browser engines were not run.

- Stage 4 completed on September 5, 2026. Added 18 behavioral regressions across
  the helper tests and `src/dom/item-updates.test.ts`, plus compile-time checks
  for schema keys, value/factory types, and inferred row-update arguments.
- Both keyed DOM APIs accept optional `update(node, item, previous)`. Reused
  keys call it untracked when the item differs by `===`; initial rows and
  unchanged-item reorders skip it. Previous-item storage exists only when an
  update callback is supplied. `each` accepts options as its fourth argument.
  `list` now infers row types from state accessors as `each` already did.
- Item baselines commit after placement and before old-row cleanup. A failed
  update, render, or placement preserves the previous baseline for retry and
  releases staged resources. Callback side effects and arbitrary DOM writes
  aren't transactional; update callbacks must be safe to repeat.
- `weakMemo` runs both computation and version reads untracked. Explicit
  `keyedStates().value()` stores functions literally; `.factory()` creates
  custom states once. `keyedStates<Schema>()` constrains string keys and values.
  The unschematized API retains deprecated `.cell()` compatibility.
- Revisions reject empty separators and expose `size` and untracked
  `prune(match?)`. A temporary internal graph probe prevents pruning cells
  with subscribers, including computed and paused subscriptions, without
  adding bookkeeping to every state. Pruned counters restart at zero;
  callers must separately discard untracked caches that reference retired paths.
- Stage 4 verification: project and direct test-file TypeScript checks, lint,
  `pnpm test` (56 files, 520 tests), build, and `git diff --check` passed.
  All eight size budgets pass: minimal core 2,906 B gzip, full core 5,248 B,
  minimal DOM 5,680 B. Tracked distribution files regenerated.
- Chromium 152 passed ten checks covering both list APIs: immutable replacement
  and reordering preserve focus and DOM identity, update reads are untracked,
  failed updates release staged bindings, and retries receive the last committed
  item. Other browser engines were not run.

## Next steps

Stages 1–4 are complete. Continue with stage 5: establish representative workload
baselines before changing keyed reconciliation, virtual scrolling, or resource
retention. Keep only optimizations supported by measurements.

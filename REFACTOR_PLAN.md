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

Status: pending. Stop must be terminal and idempotent; teardown must attempt all
cleanup before reporting failures.

- [ ] Prevalidate keyed-list identities before rendering rows.
- [ ] Release staged resources when rendering or insertion fails.
- [ ] Remove stale bookkeeping even when row cleanup throws.
- [ ] Finish all row removals during list teardown.
- [ ] Audit `each()` and dynamic branches for equivalent failure paths.
- [ ] Test abandoned bindings, throwing cleanup, and repeated disposal.

Acceptance: failed construction leaves no active abandoned bindings; teardown
leaves no rows or subscriptions behind even when individual cleanups fail.

## 3. Shared-source ownership

Status: pending. Distinguish shared subscriber-owned producers from producers
explicitly owned by a scope.

- [ ] Add an internal construction path for shared cached sources.
- [ ] Prevent scope-owned connections while paused or after terminal stop.
- [ ] Audit connectivity, attribute, class, style, and other pooled reads.
- [ ] Document escaped scope-owned source behavior.
- [ ] Test two independent consumer scopes and terminal reconnection guards.

Acceptance: one consumer cannot disconnect another consumer's shared producer;
scope-owned producers cannot reconnect outside their owner's active lifetime.

## 4. Public helper contracts

Status: pending. Resolve API details before implementation and record the final
choices below. Preserve existing callers through additive APIs where practical.

- [ ] Give `list()` and `each()` consistent same-key item update support while
      retaining the stable-model fast path.
- [ ] Run `weakMemo()` computation untracked, matching its imperative contract.
- [ ] Add typed keys or a schema for `keyedStates()`; separate factory creation
      from ordinary function-valued state.
- [ ] Reject empty revision separators.
- [ ] Add revision retention controls without splitting actively observed paths
      into independent cells.
- [ ] Add behavioral tests, compile-time API checks, and usage documentation.

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

- Stage 1 completed on September 5, 2026. Added 11 regression cases in
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

## Next steps

Start stage 2 with regression cases for failed list construction and throwing
row cleanup. Apply complete-teardown guarantees to lists and dynamic branches.

# Loom runtime architecture

Loom separates reactive graph updates, lifetime ownership, DOM reconciliation,
and optional integrations. The public entrypoints curate the API; internal
modules can share types without expanding those entrypoints.

## Module boundaries

| Module | Responsibility |
| --- | --- |
| `src/index.ts` | Public reactive primitives and helper exports. |
| `src/loom.ts` | Reactive nodes, tracking context, scheduler, computed recovery, and scope operations that coordinate effect queues. |
| `src/core/graph.ts` | Vendored dependency-graph algorithm; preserve its upstream control flow. |
| `src/core/scope-ownership.ts` | Scope/resource types, indexed removal, pause counts, terminal resource stop, and resource traversal. |
| `src/core/errors.ts` | Rethrow one failure unchanged; aggregate multiple disposal failures. |
| `src/dom/index.ts` | DOM factories, bindings, dynamic slots, and public list adapters. |
| `src/dom/keyed-reconcile.ts` | Key validation, staged row construction, item updates, placement, and outgoing-row cleanup. |
| `src/dom/place.ts` | Contiguous-region fast path and minimum-move LIS fallback. |
| `src/dom/ownership-base.ts` | Node-owned resources, construction rollback, resource groups, and subtree disposal. |
| `src/dom/ownership.ts` | Adapter between raw reactive effects and DOM ownership. |
| `src/dom/virtual-list.ts` | Standalone fixed-height windowing, using only the small ownership layer. |

Scope ownership imports reactive types only. Scope creation, active-scope
registration, stop orchestration, and resume flushing remain in `loom.ts` because
they coordinate scheduler state. This keeps ownership traversal independent
without adding a runtime import cycle or an injected scheduler abstraction.

The deferred lane, inspection, async helpers, and devtools remain optional.
The graph algorithm is unchanged by the refactor. Bundle checks cover minimal
core, inspection/deferred combinations, minimal DOM, and standalone windowing.

## Ownership and disposal

An effect can belong to an ambient scope and, when created inside another
effect, to that effect's rerun lifetime. DOM bindings clear the parent-effect
context before construction and register with their owning node. They still
participate in an ambient scope. `untrack()` clears reactive tracking and
parent-effect ownership; it does not escape the ambient scope.

Scope pause counts include paused ancestors. Independently paused descendants
stay paused when an ancestor resumes. Resource traversal snapshots registrations
before invoking user callbacks, because a callback can stop itself or another
resource. Stops mark ownership terminal before cleanup and detach registrations
in constant time.

Public `source()` created in a scope cannot reconnect while that scope is paused
or after it stops. Internal pooled reads use subscriber-owned `sharedSource()`;
one consumer scope cannot terminate another consumer's producer. Paused
subscriptions still retain shared producers.

Node ownership performs descendant-first subtree disposal. A resource group
provides collective teardown while retaining granular removal: stopped entries
leave the arena immediately, including bindings stopped through their scope.
Registration ordinals remain independent of array slots so removal cannot alter
ordered group cleanup.

The construction journal is separate from a resource group's lifetime arena.
Nested construction can roll back newly created node resources without requiring
nested public groups. Cleanup attempts all applicable work before surfacing
errors. DOM cleanup preserves a single thrown value, including `undefined`, and
aggregates multiple failures. Scope operations preserve their existing first-error
contract; they do not use the DOM aggregation helper.

## Tracking and equality

State writes and successful computed values use strict equality. Computed
failures remain retryable after invalidation; recovery is observable even when
the recovered value equals the last successful value.

`weakMemo()` reads its version and computes misses untracked. `revisions.read()`
tracks, while pruning runs untracked and retains subscribed cells. A pruned
counter restarts at zero, so callers must discard untracked caches for retired
paths separately. Typed keyed-state schemas constrain string keys and values;
`value()` stores functions literally and `factory()` creates custom states.

Keyed-list item reads, key selection, and row rendering run during reconciliation;
reads in a renderer can become structural dependencies. Use node-owned bindings
for ongoing row updates. Optional `update(node, item, previous)` callbacks run
untracked when an existing key receives an item that differs by strict equality.
Without that callback, existing rows retain their original bindings and the
reconciler does not retain previous items.

## Reconciliation guarantees

Both keyed APIs validate all identities before rendering. New resources are
staged until placement succeeds, then item baselines commit before outgoing-row
cleanup. Failed construction preserves the prior baseline for retry. Arbitrary
callback side effects and DOM writes are outside the rollback journal, so update
callbacks must be safe to repeat.

Contiguous regions avoid placement maps and unrelated sibling scans. Reorders
use the existing LIS algorithm to minimize moves; unmanaged siblings remain
outside Loom's ownership. Atomic DOM moves preserve browser state where the
platform supports them, with `insertBefore()` as the fallback.

Virtual lists cache only completed scroll windows. Every scroll pass reads
geometry, but unchanged bounds and revision skip source traversal. `refresh()`
still scans source keys; `setItems()` advances the revision and refreshes visible
content. Failed passes remain retryable.

## Verification and history

The [refactor plan](REFACTOR_PLAN.md) records each stage and its checks.
[Benchmark documentation](bench/README.md) describes workloads, reproduction,
measured gains, and limits. Keep benchmark history there rather than embedding
one-machine timing claims in runtime comments.

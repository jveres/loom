# Loom 0.12.1

Version 0.12.1 defers platform observer disconnection and pool eviction in
`src/dom/observer-pool.ts` to the microtask checkpoint while keeping
`unobserve(el)` and callback teardown synchronous.

## Why

In reactive effects and bindings, previous cleanup runs synchronously before the
next body re-registers targets. Previously, dropping the last target of a pooled
`IntersectionObserver` or `ResizeObserver` disconnected and evicted the observer
immediately, causing synchronous stop → re-observe churn to construct a new
platform observer on every update.

With microtask-deferred eviction:
- Stopping the last target calls `unobserve(el)` synchronously so stopped
  callbacks never fire and re-observing the same element triggers a fresh
  browser intersection/resize report.
- Re-subscribing to the same pool key in the same synchronous turn reuses the
  live observer with zero constructor allocations.
- If the pool remains empty at the microtask checkpoint, `disconnect()` and
  `onEmpty()` run as before with no leaked observers.

There are no public API or TypeScript declaration changes from
[v0.12.0](release-0.12.0.md).

## Checks

Qualified with `pnpm run lint`, `pnpm run check`, `pnpm test` (60 files, 620
tests), `pnpm run build`, `pnpm run size`, `pnpm run check:api`,
`pnpm run check:package`, and `pnpm run samples`.

Install with `pnpm add github:jveres/loom#v0.12.1`.

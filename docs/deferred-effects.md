# Design note — deferred (low-priority) effect lane

**Status:** **implemented** — `effect(fn, { defer, maxStale })` + `configure({ deferScheduler,
deferTimeout })`. User-facing docs live in the README ([Deferred effects](../README.md#deferred-effects));
this note is the design rationale + caveats. First consumer **done** (see below).

## Motivation

Loom effects run **synchronously** in the flush after a state write (glitch-free, no torn state).
That's the right default, but some reactive work is *not* frame-critical: logging/telemetry,
debounced persistence, "updated 3s ago" labels, and — the first real consumer — **the inspector's
own rendering**. Today the inspector polls on a fixed 120ms heartbeat; it should instead react to
real changes, but off the critical path, yielding to input and the app's rendering.

This is a **lane, not concurrency in the core.** The synchronous, glitch-free default is untouched;
"this can wait" becomes a per-effect opt-in. We are explicitly **not** adding interruptible flushes /
Fiber-style concurrency — that would trade away the property that makes Loom simple and correct.

## API

```ts
effect(fn, { defer: true, maxStale?: number })   // maxStale in ms; default from configure()
configure({ scheduler?, deferTimeout?: number }) // pluggable scheduler + global default maxStale
```

- `defer: true` — the effect re-runs in the deferred lane instead of the synchronous flush.
- `maxStale` — the **guaranteed-refresh floor**: run when idle, but *at least* every `maxStale` ms
  even under sustained load. Per-effect (inspector ~120–200ms, persistence ~2s, telemetry ~5s), with
  a global default via `configure({ deferTimeout })`.

## Mechanism

Hangs off the reactive system's `notify` hook (where sync effects do `queueEffect` + flush):

```
state write → propagate → notify(effect)
   ├─ normal effect   → queueEffect → flush() runs it now (synchronous)
   └─ deferred effect → push to deferredQueue, schedule a drain, return (skip the sync flush)
```

The drain is cooperative and **must make guaranteed progress**:

```
drain(deadline):
  do:
     run one dirty deferred effect (track deps + side effect)
  while queue not empty AND (deadline.timeRemaining() > 0 OR deadline.didTimeout)
  // under didTimeout (no idle), cap to a small budget (~5ms / N effects) so the forced
  // update doesn't itself pile onto the saturated frame; re-schedule any leftovers.
  if queue not empty: re-schedule
```

Three parts working together:
1. **Idle pass** — when there's slack, process while `timeRemaining() > 0`. Free responsiveness.
2. **Timeout (= maxStale)** — `requestIdleCallback(drain, { timeout: maxStale })`. If no idle within
   `maxStale`, the browser runs it anyway (`deadline.didTimeout`). This is the floor.
3. **Per-drain budget** — forced drains run regardless of `timeRemaining()` (which is ~0), but capped,
   so they make bounded progress instead of blocking the frame.

### Scheduler + browser fallbacks

`requestIdleCallback` does **not** exist on Safari/iOS, so the default scheduler must fall back:
`requestIdleCallback` (with timeout) → `scheduler.postTask({ priority: 'background' })` where present
→ a `MessageChannel` + `setTimeout` pair (one "ASAP after paint, yields to input", one as the timeout
floor). `configure({ scheduler })` lets apps/SSR/tests swap it (a test can make it synchronous; a
server can no-op it).

## Semantics & caveats (read this before implementing)

- **Coalesced → latest value, not every transition.** If a dep changes 50× before the next drain,
  the effect runs **once**, seeing the final value. It's "react to current state eventually," not
  "observe every step." For every-transition, use a **channel/event stream**, not a deferred effect.
  This is the #1 footgun — document it loudly.
- **maxStale is best-effort, NOT hard real-time.** If the *app* runs a single synchronous task longer
  than `maxStale` (e.g. a 300ms burst with no yield), the timeout callback can't fire mid-task —
  everything, including the app's own rAF, waits. Loom's own flushes are short (per-effect); long
  tasks come from the app doing too much synchronously. The lane bounds *Loom's* contribution, it
  cannot bound the app's long tasks. Per-frame workload budgeting stays an app responsibility.
- **Without the timeout, pure idle starves under load.** `requestIdleCallback` with no timeout never
  fires under full chaos → deferred effects never run, which is exactly the scenario the lane exists
  for. The timeout is **mandatory**, not optional.
- **Glitch-free relative to the sync tier.** Drains run *after* synchronous flushes settle, so a
  deferred effect always reads consistent, current state — it may skip intermediates, never tears.
- **Initial run is also deferred.** The effect is dirty from creation and tracks its deps on its
  first drain; until then it has no subscriptions (it's pending its first run).
- **Deferred effects are sinks.** A deferred effect that *writes* a state triggers normal propagation
  (sync subscribers → a flush; deferred subscribers → next drain). Allowed, but discourage write-back
  — the lane is for outputs (render, log, persist), not derivation chains.

## Scope-awareness

A deferred effect is a normal `EffectNode`: owned by the active scope, disposed on `stop()`/scope
teardown (and removed from the deferred queue), and paused/resumed with its scope. The pause check
happens both at enqueue and **at drain time** (skip a now-paused effect, leave it dirty; `resume()`
re-queues if still dirty).

Payoff for the inspector: the panel scope (paused when minimized) and each tab's scope (paused when
inactive) automatically suspend that tab's deferred render — no extra wiring. Under chaos, only the
**active** pane's render drains (every `maxStale`); inactive panes cost nothing. Combined with the
zero-detail-recording-when-off-screen change, the inspector's whole cost under chaos collapses to
"one bounded render of the visible pane at the maxStale floor (~6fps)."

## First consumer (done)

The inspector's `poll()` was split. The cheap metric sampling (rates, sparkline, health) stays on the
`polled(POLL_MS)` heartbeat so the value displays + the always-visible spark stay live on the timer.
The **heavy per-tab refresh** — the node census (stats), the graph reconcile, or draining the trace
ring(s) — moved into `renderActiveTab()`, run by a deferred effect (`bind(fn, { defer: true, maxStale:
POLL_MS })`) ticked by the heartbeat and `untrack`ed so it re-runs only on the tick. So under app load
the expensive part yields (idle-first, POLL_MS floor) instead of competing each frame, and — being in
the panel scope — it pauses with minimize like the heartbeat.

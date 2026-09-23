# Loom 0.8.0

Version 0.8.0 speeds up the reactive core and keyed list reordering, fixes
several lifecycle and inspector bugs, and makes no breaking API changes.

## Performance

Measured against 0.7.0 on Node 24 (built package) and headless Chromium:

| Workload | Change |
| --- | ---: |
| Reading a state and a computed outside effects | −28% |
| Write → effect | −12% |
| `trigger()` | −11% |
| Effect creation | −8% |
| Chain of 100 effects | −5% |
| Keyed list swap (1,000 rows) | −33% |
| Keyed list reverse / remove | −5% / −4% |

Writing a state that has no subscribers is about 2% slower, an accepted
trade-off for the faster write → effect path. Other workloads are unchanged
within measurement noise.

## Fixes

- The inspector's Graph and Trace tabs render again (broken since 0.6.0).
- `pressed()` resets to `false` when its last reader leaves mid-press.
- `scrollEdges()` resyncs when a child grows in place.
- `source()` producer pushes are counted on the `loom:write` channel.
- `withRootAttributes` merges attributes regardless of name case, applying
  the attribute serializer's rules; server-rendered style arrays match the DOM
  runtime.
- Stopping or resuming a scope reports every failure: one error as-is, several
  as an `AggregateError`.
- A cleanup returned by an effect that stopped itself during its first run now
  runs.

## Size

The minimal core is 3,015 bytes gzip. The opt-in observation fixture budget
rises from 3,664 to 3,680 bytes and the minimal DOM fixture budget from 6,000
to 6,050 bytes; all whole-family budgets are unchanged. Install from the GitHub
tag with `pnpm add github:jveres/loom#v0.8.0`.

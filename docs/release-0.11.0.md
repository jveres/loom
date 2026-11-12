# Loom 0.11.0

Version 0.11.0 adds a key-only database read, fixes conditional subtrees that
left nodes behind, and changes when `bindValue` writes to a focused field.
There are no new runtime dependencies.

## Key-only reads

`loom/db` stores and indexes gain `keys(options)`: the primary keys of a
bounded range, in scan order, read through a native key cursor that loads no
values. It takes the same `range`, `direction`, and required `limit` as `scan`
and `entries`, and queries that use it follow the same store-level
invalidation. See the [database guide](db.md#bound-every-collection-read).

## Fixes

`when` and `match` now remove everything their branch rendered, including rows
that an inline `each`, or nodes that a nested `when` or `match`, inserted after
the branch was built. Before, those nodes and their effects stayed in place when
the branch changed. Each `when`/`match` slot now places one more comment node to
mark the start of its branch.

## Changed behavior

`bindValue` no longer holds back state changes while the element has the
focus. Changes from other sources are written to the focused field, unless they
equal its value or an IME composition is in progress, in which case they are
applied at its end and the last value wins. The field's own input is still never
written back, so typing keeps the caret; a state that rewrites the typed value
shows its value when focus leaves. A write that changes a focused text field
moves the caret to the end. See the [API index](api.md#dom-construction-and-ownership).
Applications that cleared a focused field by writing to the element as well as
to the state can now write the state alone.

Qualification: zero-warning lint, strict types, 617 unit tests, 60 database
checks and 19 platform checks per Chromium/Firefox/WebKit, 15 demo workflows
per engine and the production build, packed API/family budgets, samples, size
budgets, and a rebuild with no distribution drift. The Chromium retention check
of the platform checks failed once in five runs under load and passed alone;
its fixture uses none of the changed code. Native Safari and physical iOS remain
unqualified.

Install with `pnpm add github:jveres/loom#v0.11.0`.

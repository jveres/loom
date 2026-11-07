# Loom 0.10.0

Version 0.10.0 adds the optional `loom/db` API and the Stockroom database demo.
Existing public APIs remain compatible. There are no new runtime dependencies.

## Reactive IndexedDB

The [database guide](db.md) covers typed out-of-line stores and indexes, bounded
reads, atomic transactions, schema upgrades, and explicitly owned connections.
Queries integrate with Loom scopes and reactive parameters, notify other tabs
after commit, and recover on resume or explicit refresh. Superseded queries abort
obsolete readonly work. Committed callback failures retain an explicit marker
so applications can avoid unsafe retries.

The module provides local persistence, not server synchronization, offline
command queues, or application-specific cache policy. Cross-tab notifications
are not durable; inspect `crossTab()` for this window's transport mode. Keep
network calls outside transaction callbacks.

## Stockroom demo

Open `/db/` with `pnpm dev`, or use the
[published demo](https://jveres.github.io/loom/db/) after Pages deployment.
Stockroom uses synthetic inventory to demonstrate paging, atomic mutations,
primitive records, multiple tabs, scope lifetimes, resets, and failure handling.
Its concurrency regression verifies twelve simultaneous scenario appends retain
all entries. See the
[demo guide](https://github.com/jveres/loom/blob/v0.10.0/demo/db/README.md).

## Fixes and development tools

Source builds now retain the DOM ownership driver's setup through the package
`sideEffects` declaration. This fixes a production-only crash in source-alias
list consumers; packed v0.9.0 consumers were not affected. Existing CSS ordering
and meter warnings are resolved without lint suppressions.

Development dependencies update Biome, Vite, Vitest, Playwright, and Node types.
The existing tests and bundle scripts now explicitly declare happy-dom and
esbuild. CI uses Node 24 and pnpm 12 and includes the database demo check.

## Qualification and limits

Validation covers 577 unit tests, strict types, clean lint, declarations and
packed consumers, documentation examples, unchanged bundle budgets, and
reproducible distribution. The browser matrix covers Chromium, Firefox, and
Playwright WebKit: 19 platform checks, 52 database checks, real two-tab demo
workflows, and concurrent scenario appends. The demo also runs from a production
build under `/loom/` in Chromium. These are local checks; remote CI reports its
own result after publication.

The database reference consumer adds 4,203 bytes gzip over its reactive baseline,
within the 6 KiB limit. Existing core budgets remain unchanged. Synthetic timing
results are machine-specific; see the database and demo guides for workloads.
Native Safari and physical iOS suspension remain untested. Worker integration
is unqualified; quota, denied access, and unexpected termination use injected
faults rather than destructive device tests.

Install with `pnpm add github:jveres/loom#v0.10.0`.

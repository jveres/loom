# Reactive IndexedDB

`loom/db` provides typed local transactions and reactive, bounded reads over
IndexedDB. Importing it installs nothing. Database handles have explicit ownership;
queries follow Loom scopes and can also be stopped individually. Other Loom
imports do not include the database implementation.

This is a generic storage API. It has no required application fields, cache
protocol, server connection, command retry policy, or UI model. The application
chooses whether its records are primary local data or a rebuildable cache.

## Availability

This entrypoint is included in v0.10.0. Install with
`pnpm add github:jveres/loom#v0.10.0`; the earlier v0.9.0 tag does not contain it.
See the [release notes](release-0.10.0.md) and
[Stockroom demo guide](https://github.com/jveres/loom/blob/v0.10.0/demo/db/README.md) for qualification and examples.

## Open and define a schema

Use out-of-line keys and create the native schema in the synchronous upgrade
callback. Type parameters describe the installed schema; they neither create it
nor validate stored values. Only string, finite numeric, and compound keys are
supported. Do not use inline keys or auto-increment stores with this facade.

```ts
import { effect, scope, state } from "loom";
import { openDatabase } from "loom/db";

interface Notes {
  notes: {
    key: string;
    value: { category: string; position: number; text: string };
    indexes: { byPosition: readonly [string, number] };
  };
  settings: { key: string; value: string; indexes: Record<never, never> };
}

const db = await openDatabase<Notes>({
  name: "example-notes",
  version: 1,
  upgrade(native, oldVersion) {
    if (oldVersion === 0) {
      const notes = native.createObjectStore("notes");
      notes.createIndex("byPosition", ["category", "position"], { unique: true });
      native.createObjectStore("settings");
    }
    return undefined;
  },
  onBlocked() { console.info("Another connection must close before upgrading"); },
});

await db.write(["notes", "settings"], async tx => {
  await tx.store("notes").put("first", {
    category: "work", position: 1, text: "A local record",
  });
  await tx.store("settings").put("selected", "work");
});

const category = state("work");
const view = scope(() => {
  const rows = db.query(["notes"], tx => {
    const selected = category(); // Track parameters before the first await.
    return tx.store("notes").index("byPosition").scan({
      range: { lower: [selected, 0], upper: [selected, 1000000] },
      direction: "prev", limit: 100,
    });
  });
  effect(() => console.log(rows(), rows.loading(), rows.error()));
});
view.pause();
view.resume();
view.stop();
db.close();
```

`name` selects a database in the current origin and storage partition.
`version` must be a positive safe integer; increase it to change stores or
indexes in `upgrade`. Opening an older version than the stored schema rejects
with `VersionError`. A failed upgrade rolls back its schema/data changes; the
module does not delete or rebuild the database automatically.

`openDatabase` rejects if IndexedDB is unavailable or access is denied. There
is no memory fallback or implicit deletion. `signal` cancels opening, including
waiting on a blocked upgrade. A late successful connection is closed. Upgrades
that already committed cannot be undone. A throwing blocked observer cancels
the attempt. Upgrade callbacks cannot return promises; native request handlers
can be installed on the supplied upgrade transaction for migrations.

## Operation reference

The [exported declarations](../dist/types/db/types.d.ts) define the generic
schema, transaction, range, entry, and handle types. Operations use the store
names and key/value/index types in your `Schema`; no schema object is passed
at runtime.

| Operation | Result and behavior |
| --- | --- |
| `openDatabase<S>(options)` | `Promise<Database<S>>`; opens an explicitly owned connection. |
| `db.read(stores, callback)` | Promise of the callback result, after the readonly transaction completes. |
| `db.write(stores, callback)` | Promise of the callback result, after the readwrite transaction commits. |
| `db.query(stores, callback)` | `Resource<T>`; starts a reactive readonly query immediately. |
| `tx.store(name).get(key)` | Promise of the stored value or `undefined`. |
| `store.scan(options)` / `store.entries(options)` | Promise of bounded values or primary-key/value entries. |
| `store.index(name)` | A typed index reader with `scan` and `entries`. |
| `store.put(key, value)` | `Promise<void>`; insert or replace the complete value at an explicit key. No merge or generated key. |
| `store.delete(key)` | `Promise<void>`; remove the key, including a harmless missing-key delete. |
| `store.clear()` | `Promise<void>`; remove all records in that store, preserving schema and indexes. |
| `query.refresh()` | Rerun this query; tracked parameter changes also rerun it. |
| `db.refresh()` | Invalidate all live queries on same-name handles in this window; no broadcast or network fetch. |
| `query.stop()` | Terminal query disposal; does not close the database. |
| `db.close()` | Idempotent connection closure; no records are deleted. |

Write methods exist only inside `db.write`. Values must be structured-cloneable;
the facade does not serialize functions or validate values against TypeScript.
`connection`, `crossTab`, and resource status are reactive reads; their lifetime
and recovery behavior are described below.

## Bound every collection read

`scan` returns values; `entries` returns `{ key, value }` records with the primary
key preserved. Each operation requires a positive safe-integer `limit` and uses
a native cursor that stops at that limit. `direction` is `next` or `prev`.
Index order breaks ties with the primary key. Index ranges use index keys;
entry keys remain primary keys.

Use `range: { only: key }` for an exact key, or `lower`, `upper`, `lowerOpen`,
and `upperOpen` for bounds. An omitted/empty range is unbounded, but the result
limit is always required. Mixing exact and bounded ranges or specifying an open
flag without its bound rejects. Invalid native key ranges preserve `DataError`.

For primary-key continuation, pass the last entry key as an exclusive bound.
For index continuation, use a unique index key. A nonunique index value alone
cannot describe a safe continuation boundary; the module does not manufacture a
pagination token. Applications coordinate multiple windows/pages and rendering.

`get` resolves to the value or `undefined`; as in IndexedDB, storing `undefined`
cannot be distinguished from absence using `get` alone. Use entries or a value
shape with explicit presence if that distinction matters.

## Keep callbacks inside the transaction

`read`, `write`, and `query` declare a nonempty store set. The facade rejects
access to other stores and omits write methods in readonly transactions.
Handles must not escape the callback. Read/write callbacks run untracked;
query callbacks track synchronous Loom reads.

Await only requests made on that same transaction. Fetch, timers, file reads,
and another transaction must finish before entering the callback. IndexedDB
can auto-commit when its request queue drains. There is no transaction keepalive
or nested-transaction emulation.

Operations resolve only after both the callback and the native transaction
succeed. A request failure or callback rejection aborts the active transaction,
even when the caller catches a request's rejection. This includes synchronous
native failures such as structured-clone or quota errors. Successful requests
from a transaction that later aborts are never published as committed changes.
An omitted await does not hide a request failure from the outer operation.

If the native transaction finishes while the callback is still pending, the
outer operation rejects with `TransactionContractError` and `committed: true`.
The same marker applies if a callback fails after native rollback becomes
impossible; a failure known at completion is retained as `cause`. A failure
that arrives after the outer rejection is observed but cannot amend that error.
The write may already be durable and is still broadcast. Later callback failures
are observed, but cannot roll it back. Never automatically retry this error.
Storage errors preserve native `DOMException` names; argument errors use
`TypeError` or `RangeError`. Caller-thrown values are preserved on rollback.

## Own queries and connections

A query reads its declared stores in one snapshot transaction. Any committed
write to one of those stores invalidates it, including conservative no-op
writes. Repeated notifications in one turn coalesce. Superseded results cannot
overwrite the current resource. There is no automatic index-range dependency
analysis; unrelated stores do not invalidate the query.

The returned `Resource<T>` exposes value, `loading`, `ready`, `error`, `refresh`,
and `stop`. It retains its last successful value on refresh/failure. `ready` is a
first-success latch, not readiness for the newest parameters. Parameter identity
and any validity/presentation policy belong to the consumer; the result type is
exactly the callback's `T`.

Scope pause disconnects notifications and suspends new effect-driven reads.
An admitted read may still settle while paused. Resume always performs a fresh
read. Superseding or stopping a query aborts its obsolete native readonly
transaction when still active, so ignored results do not keep scanning. This
does not cancel imperative `read`/`write` calls. `stop` and scope disposal are
terminal. The database itself remains open until `close`; creating it inside a reactive scope does not transfer ownership.

`close` rejects new operations, removes query subscriptions, exposes a closed
connection error to existing queries, and fences pending query delivery. Admitted
imperative transactions still settle, and their successful commits still notify
other handles before transport ownership is released. Reactive query work may
be aborted when its resource is invalidated. Closing is not write rollback.
`connection()` reports `open`, `closed`, `versionchange`, or `terminated`.
Native version changes automatically close old handles. Open a fresh handle and
recreate queries after connection replacement.

`loom/db` handles close automatically on `versionchange`. To demonstrate a
blocked upgrade, use a raw connection that deliberately remains open, as another
library or older application code might.

`onBlocked` is a synchronous observer. Throwing or returning a Promise rejects
opening; late native success is closed, and Promise rejections are observed.

## Observe other tabs

Same-database handles share a window-local bus. Cross-tab delivery requires the
same origin, storage partition, database name, and notification protocol. After commit the bus broadcasts
only database identity, schema version, sender identity, and changed store names.
Other tabs reread IndexedDB; messages are hints, not record updates. Native
versionchange controls schema recovery, so delayed older-version hints cannot
reopen a stale schema or force a newer connection to downgrade.

`crossTab()` reports `broadcast` or `manual`. If BroadcastChannel is absent or
fails, same-window updates and focus/visible/pageshow refresh still work, but
active peers have no automatic delivery guarantee. Call `db.refresh()` explicitly
when needed. `crossTab()` describes only this window: a `broadcast` tab cannot
detect a peer in manual mode and may remain stale after that peer writes until
it refreshes or regains focus/visibility. A transport/listener failure cannot turn a committed write into a
storage failure or cause it to be retried.

All writers must use the module for commit notifications. Raw IndexedDB writers
require explicit refresh. Broadcast delivery is not durable: a writer can die
between commit and broadcast. A resumed view rereads, but an active peer may
remain stale until refresh. Worker integration is not qualified; the initial
support target is browser windows. Storage may be evicted and is not a backup.

## Clear data or reset the schema

For a data-only reset, use one `db.write` callback over the affected stores and
await each store's `clear()`. This preserves the schema and notifies other
module queries only after the complete reset commits. Reset related stores in
one transaction when their records must remain consistent.

For a complete database deletion, stop its queries, close its handles, and use
the native `indexedDB.deleteDatabase(name)` request. Observe `success`, `error`,
and `blocked`; a close-pending transaction can delay deletion, and another tab
may need to close its connection. There is no Loom delete-database wrapper.
Reopen with the original upgrade callback to recreate an empty schema. This is
an explicit application action, never automatic storage-error recovery.

## Foundation and qualification

The implementation uses native IndexedDB, with no new runtime dependencies.
The public facade needs only bounded cursors and a small set of requests. It must
own commit/abort monitoring, caught-request failures, and premature callback
completion regardless of the adapter. `idb` would supply general promise/cursor
wrapping but would not remove those contracts or reactive lifetimes. Native code
keeps that boundary explicit and preserves Loom's dependency policy; reconsider
it if the facade expands enough to justify a broader adapter.

After `pnpm install`, install the test engines with
`pnpm exec playwright install chromium firefox webkit` (CI also uses
`--with-deps` on Linux). Run `pnpm check:db` for real IndexedDB and two-tab scenarios in Chromium, Firefox,
and Playwright WebKit, plus synthetic measurements. Unit opening faults run in
`pnpm test`. `pnpm check:package` verifies a packed consumer and import safety;
`pnpm size` checks core budgets and the optional database's incremental cost.
Physical iOS suspension and native Safari remain separate manual checks.
Quota exhaustion and unexpected termination use named fault injection where
filling the user's disk or killing the browser would be inappropriate.

A November 2026 local qualification on Node 24.21.0 measured approximately
4.1 KiB gzip incremental cost over the same reactive consumer without database
storage (6 KiB limit). All existing core/family budgets passed. The 100,000-record
fixture uses 1 KiB payloads across 100 groups and bounded 100-row reads. Desktop
three-engine warm reads and two-tab 100-row updates passed the 50 ms and 250 ms
p95 gates. These are synthetic development measurements, not device guarantees.

Store-level invalidation still invokes each affected query callback. In the
100-commit/20-query stress test this means 2,000 callback invocations. With
queued writes, superseded transactions are aborted and only the 20 current
queries complete their scans; this is a regression gate in `check:db`. Before
cancellation was connected, that Chromium workload exceeded the 30-second
measurement window. With the fix it completed in about 0.1–0.2 seconds in local
Chromium/WebKit runs and 0.3–1.0 seconds in Firefox runs. These are machine-local
measurements, not universal timing promises.

Sequential writes interleaved with completed reads still cause 2,000 scans:
each snapshot can be current before the next commit. Batch related writes in
one transaction and keep the active query count appropriate for the view.

The [Stockroom demo](../demo/db/README.md) exercises this API through a real UI
across tabs. See the [API index](api.md), [support policy](support.md), and
[native transaction lifecycle](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction).
The alternative adapter's responsibilities are described in the
[idb documentation](https://github.com/jakearchibald/idb).

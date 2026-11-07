# Stockroom: a `loom/db` demo

Stockroom is a small inventory that runs on the public `loom/db` API. All its data
is synthetic. It makes no network requests, needs no credentials, and has no
server. See the [database guide](../../docs/db.md) for the API itself.

| Feature | Where to see it |
| --- | --- |
| Typed stores, explicit keys | `items` keys are not stored in their values. See [`database.ts`](database.ts). |
| Primitive values | `labels` holds bin names and `journal` holds log lines, as plain strings. |
| Indexes | A unique `[bin, position]` index for pages and a nonunique `units` index for Low stock. |
| Bounded reads and paging | Next and Previous use keyset pages. A read scans at most 11 rows, whatever the store size. |
| Atomic writes | **Move 5** changes two rows and adds a journal line in one transaction. |
| Reactive queries | A commit rereads only the queries for that store. **Completed reads** shows the counts. |
| Parameter changes | A different bin or order reruns the query. The old rows stay, inert, until the new ones arrive. |
| Scope lifetime | **Pause**, **Resume**, **Dispose**, and **Mount** in Low stock. |

## Run it

```sh
pnpm install
pnpm run dev
```

Open `/db/` at the address that Vite prints. To see two tabs synchronize, select
**Open a second tab**, then change a row in either tab. **Open a manual-mode tab**
opens a tab without `BroadcastChannel`: it neither sends nor receives notifications.
Commits there reach other tabs only when they refresh, or when they get focus or
become visible. The same applies in the other direction.

`pnpm run build:demo` writes the page to `dist/demo/db/`. It is not deployed from
a branch. The Pages workflow publishes it after a push to `main`.

## Storage and reset

The data stays in IndexedDB for this origin and browser profile. It survives a
reload, but the browser can evict it. It is not a backup.

| Database | Contents | Lifetime |
| --- | --- | --- |
| `loom-db-demo-stockroom` | Items, bin names, and the journal | Until you delete it |
| `loom-db-demo-upgrades` | Upgrade scenario data | Deleted when a scenario ends. If you close the tab during a scenario, the next run deletes it. |

- **Restore sample data** replaces the records in one commit and keeps the schema.
  Other tabs update and stay connected.
- **Delete database** uses the native `indexedDB.deleteDatabase`. This tab reopens
  with new sample data. Other tabs report `versionchange`, keep their last rows, and
  stay closed until you select **Reopen**.
- To remove everything, also clear this site's data in the browser settings.

## Scenarios

Each card causes a real failure, then reads storage back. A card shows
"Unexpected result" if storage did not do what the API promises.

| Scenario | Expected result |
| --- | --- |
| Failed transaction | The callback throws after two puts and a journal line. All three roll back. |
| Caught request error | The callback catches `ConstraintError`. The write still rejects, and an earlier put rolls back. |
| Await outside the transaction | A timer lets IndexedDB commit early. `TransactionContractError` has `committed: true`, and the first line is saved. Never retry this error. |
| Close during a write | `close()` does not cancel an admitted write. It commits and still reaches other tabs. |
| Failed upgrade | The upgrade callback throws. The database stays at version 1 with its data. |
| Blocked upgrade | A raw connection holds the upgrade. Release lets it finish, and Cancel aborts it. |

**Make reads fail** causes query errors on demand. The last good rows stay on the
screen with the error beside them.

The upgrade scenarios use their own database. Raising the stockroom's version
would make every open tab fail with `VersionError` until its code requested the
new version. A `loom/db` handle closes itself on `versionchange`, so the blocked
scenario needs a raw connection that ignores the event.

Manual mode is synthetic: the page removes `BroadcastChannel` before it opens the
database, because `crossTab` reports the mode and does not set it.

## Evidence

`pnpm run check:db-demo` drives the real UI through 15 workflows with real tabs,
in Chromium, Firefox, and WebKit against the source, then in Chromium against a
production build served under `/loom/`. Bundling can remove code that the
development server runs, so the build needs its own check. The script fails on
an unhandled page error, an external request, or a page that scrolls sideways at
360 pixels.

Tab order, focus rings, light and dark themes, a 375-pixel phone layout, and
layout stability during state changes were checked once by hand in Chromium, with
scripted measurements and screenshots. The script does not repeat those checks.

### Performance

November 2026, one development machine, Chromium 158, Firefox 159, Playwright
WebKit 27.2, Node 24.21.0. The store holds 10,120 small synthetic rows.
These are development measurements, not device guarantees.

| Engine | Read p95 (ms) | Two-tab round trip p95 (ms) | Commit 1,000 rows (ms) |
| --- | ---: | ---: | ---: |
| Chromium (source) | 16.9 | 65.1 | 80 |
| Chromium (build) | 17.6 | 53.3 | 79 |
| Firefox (source) | 3 | 71.3 | 72 |
| WebKit (source) | 3 | 49.9 | 94 |

- **Read** is the time inside the query callback for one 11-row indexed read, over
  20 runs. Firefox and WebKit report coarser timers.
- **Two-tab round trip** runs from the click in one tab to the new value in the
  other, over 20 runs, and includes Playwright's click and polling overhead. It is
  not the delivery latency alone.
- The script fails above the guide's proposed budgets of 50 ms and 250 ms.

Every commit to `items` reruns both item queries in every tab. Keep related changes
in one write, as **Add 1,000 in one write** does. See the guide's
[performance notes](../../docs/db.md#foundation-and-qualification).

## Limitations

- Native Safari and physical iOS suspension have not been tested.
- Browser checks use explicit refresh for manual mode. Real focus and visibility
  recovery is covered by `pnpm run check:db`, not by this demo's script.
- `terminated`, quota exhaustion, denied storage, and a `BroadcastChannel` that
  fails at run time have no repeatable scenario here. Their UI text exists, but
  only `pnpm run check:db` and unit tests exercise those paths, with injected faults.
- A `broadcast` tab cannot tell when a peer is in manual mode, so it can stay stale
  until it refreshes or gets focus. Broadcast delivery is a hint and is not durable.
- If two tabs run an upgrade scenario at the same time, one can wait for the other
  because they share a database. The Run button only prevents this within one tab.
- There is no retry, network, or cache policy here. That belongs to an application.

Concurrent scenario regression checks also run in all three source-browser
engines. Twelve separate handles append through the premature-commit and
close-during-write scenarios together. The check verifies every old entry,
exactly twelve new entries, one marker per writer, and no late callback errors.
Journal keys are allocated inside the same write transaction as the append.

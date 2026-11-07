// Stockroom: a small inventory that exercises `loom/db`. See ./README.md to run and reset it.
//
//   openDatabase()   an explicitly owned connection; this file decides when to close and reopen.
//   db.query()       reactive bounded reads, one store set each, owned by a scope per connection.
//   db.write()       atomic writes in ./database.ts; failure scenarios in ./scenarios.ts.
//   scope()          the Low stock panel has its own scope, to pause, resume, and dispose it.
//   state()/list()   retained rows and keyed table rows: a refresh never blanks valid content.
import {
  batch,
  computed,
  effect,
  type Read,
  type Scope,
  scope,
  state,
} from "loom";
import type { Resource } from "loom/async";
import { type DbEntry, TransactionContractError } from "loom/db";
import { list } from "loom/dom";
import {
  addItems,
  binsQuery,
  type Counted,
  changeUnits,
  DATABASE_NAME,
  deleteDatabase,
  deleteItem,
  type InventoryPage,
  type InventoryView,
  type ItemEntry,
  inventoryQuery,
  journalQuery,
  lowStockQuery,
  moveUnits,
  openStockroom,
  PAGE_SIZE,
  restoreSampleData,
  type StockroomDb,
  syntheticNames,
} from "./database.js";
import {
  type BlockedUpgrade,
  blockedUpgrade,
  caughtConstraint,
  closeDuringWrite,
  failedTransfer,
  failedUpgrade,
  prematureCommit,
} from "./scenarios.js";
import "./styles.css";

// Removing the constructor is the synthetic way to reach manual mode: `crossTab` is a report, not a
// switch. It has to happen before the first openDatabase() call in this tab.
const manualTab =
  new URLSearchParams(location.search).get("transport") === "manual";
if (manualTab) Reflect.deleteProperty(globalThis, "BroadcastChannel");

const tab = `Tab ${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
const FIRST_BIN = "bin-a";

function describe(error: unknown): string {
  if (error instanceof TransactionContractError)
    return `${error.message} (committed: ${error.committed}). Do not retry this write.`;
  if (error instanceof DOMException) return `${error.name}: ${error.message}`;
  return error instanceof Error ? error.message : String(error);
}

// -------------------------------------------------------------------------------- Connection state

interface Session {
  readonly db: StockroomDb;
  readonly owner: Scope;
  readonly bins: Resource<Counted<DbEntry<string, string>>>;
  readonly inventory: Resource<InventoryPage>;
  readonly journal: Resource<Counted<DbEntry<string, number>>>;
}
type Connection =
  | "opening"
  | "open"
  | "closed"
  | "versionchange"
  | "terminated"
  | "failed";

const session = state<Session | undefined>(undefined);
const opening = state(true);
const openBlocked = state(false);
const openError = state<string | undefined>(undefined);
const notice = state<{ text: string; error: boolean } | undefined>(undefined);

const view = state<InventoryView>({
  bin: FIRST_BIN,
  direction: "next",
  trail: [],
});
const failReads = state(false);

// Values are kept here, not read from the resources directly, so they survive reconnecting: a new
// connection's queries start empty, and the last good rows stay on screen until they settle.
const page = state<InventoryPage | undefined>(undefined);
const bins = state<Counted<DbEntry<string, string>> | undefined>(undefined);
const journal = state<Counted<DbEntry<string, number>> | undefined>(undefined);

const connection: Read<Connection> = () => {
  if (opening()) return "opening";
  return session()?.db.connection() ?? "failed";
};
const canUse = () => connection() === "open";

function retain<T>(from: Resource<T>, to: (value: T) => void): void {
  effect(() => {
    const value = from();
    if (value !== undefined) to(value);
  });
}

function adopt(db: StockroomDb): void {
  let owned!: Pick<Session, "bins" | "inventory" | "journal">;
  const owner = scope(() => {
    owned = {
      bins: binsQuery(db),
      inventory: inventoryQuery(db, view, failReads),
      journal: journalQuery(db),
    };
    retain(owned.bins, bins);
    retain(owned.inventory, page);
    retain(owned.journal, journal);
  });
  session({ db, owner, ...owned });
  mountLowStock(db);
}

function release(): void {
  const current = session();
  if (!current) return;
  stopLowStock();
  current.owner.stop();
  current.db.close();
  session(undefined);
}

async function connect(): Promise<void> {
  batch(() => {
    release();
    opening(true);
    openBlocked(false);
    openError(undefined);
  });
  try {
    const db = await openStockroom(tab, () => openBlocked(true));
    batch(() => {
      adopt(db);
      opening(false);
    });
  } catch (error) {
    batch(() => {
      openError(describe(error));
      opening(false);
    });
  }
}

async function deleteEverything(): Promise<void> {
  batch(() => {
    release();
    opening(true);
    openBlocked(false);
    notice(undefined);
  });
  try {
    await deleteDatabase(DATABASE_NAME, () => openBlocked(true));
    batch(() => {
      view({ bin: FIRST_BIN, direction: "next", trail: [] });
      failReads(false);
    });
  } catch (error) {
    notice({ text: `Delete failed: ${describe(error)}`, error: true });
  }
  await connect();
}

// A failed write reports what is known: only a contract error can mean data was saved anyway.
function act(label: string, run: () => Promise<string>): void {
  run().then(
    (text) => notice({ text, error: false }),
    (error: unknown) =>
      notice({
        text:
          error instanceof TransactionContractError
            ? `${label}: ${describe(error)}`
            : `${label} failed, so nothing was saved. ${describe(error)}`,
        error: true,
      }),
  );
}

function withDb(run: (db: StockroomDb) => Promise<string>): Promise<string> {
  const current = session();
  return current
    ? run(current.db)
    : Promise.reject(new Error("The database is not open"));
}

// --------------------------------------------------------------------------------- Low stock scope

type LowStockMode = "live" | "paused" | "disposed";
const lowMode = state<LowStockMode>("disposed");
const lowRows = state<Counted<ItemEntry> | undefined>(undefined);
let lowOwner: Scope | undefined;

function mountLowStock(db: StockroomDb): void {
  lowOwner?.stop();
  lowOwner = scope(() => retain(lowStockQuery(db), lowRows));
  lowMode("live");
}

function stopLowStock(): void {
  lowOwner?.stop();
  lowOwner = undefined;
  lowMode("disposed");
}

function pauseOrResume(): void {
  if (lowMode() === "live") {
    lowOwner?.pause();
    lowMode("paused");
  } else if (lowMode() === "paused") {
    lowOwner?.resume();
    lowMode("live");
  }
}

function disposeOrMount(): void {
  const current = session();
  if (lowMode() === "disposed") {
    if (current) mountLowStock(current.db);
  } else {
    stopLowStock();
  }
}

// ------------------------------------------------------------------------------- Status vocabulary

const CONNECTION_TEXT: Record<Connection, string> = {
  opening: "Opening the database.",
  open: "Reads and writes are available.",
  closed: "This tab closed its connection. No records were deleted.",
  versionchange:
    "Another tab deleted or upgraded this database, so this connection closed itself.",
  terminated: "The browser closed this connection unexpectedly.",
  failed: "The database did not open.",
};

const crossTab = () =>
  session()?.db.crossTab() ?? (manualTab ? "manual" : "broadcast");

const crossTabText = () =>
  crossTab() === "broadcast"
    ? "Other tabs reread after each commit in this browser profile."
    : "No automatic delivery. Other tabs catch up when you refresh, or when they get focus or become visible.";

const stale = computed(() => {
  const shown = page();
  return shown !== undefined && shown.request !== view();
});

const binName = (bin: string) =>
  bins()?.rows.find((row) => row.key === bin)?.value ?? bin;

const inventoryStatus: Read<string> = () => {
  const current = session();
  const shown = page();
  if (!canUse())
    return shown
      ? "Not connected. Showing the last rows read."
      : "Not connected.";
  const error = current?.inventory.error();
  if (error)
    return stale() && shown
      ? `Could not read ${binName(view().bin)}. Still showing ${binName(shown.request.bin)}. ${describe(error)}`
      : `Refresh failed. Still showing the last rows read. ${describe(error)}`;
  if (stale() && shown)
    return `Loading ${binName(view().bin)}. Still showing ${binName(shown.request.bin)}.`;
  if (current?.inventory.loading())
    return shown ? "Refreshing. Still showing the last rows read." : "Loading.";
  return shown
    ? `Up to date. Read ${shown.rows.length} rows in ${shown.ms.toFixed(1)} ms; a read scans at most ${PAGE_SIZE + 1}.`
    : "Loading.";
};

const lowStatus: Read<string> = () => {
  if (lowMode() !== "disposed" && !canUse())
    return "Not connected. These rows are the last ones read.";
  const reads = lowRows()?.reads ?? 0;
  switch (lowMode()) {
    case "live":
      return `Live. ${reads} completed ${reads === 1 ? "read" : "reads"}.`;
    case "paused":
      return "Paused. Commits do not reread these rows. Resume always rereads.";
    default:
      return "Disposed. These rows are the last ones read. Mount creates a new query.";
  }
};

// ---------------------------------------------------------------------------------------- Inventory

function Button(props: {
  label: string | Read<string>;
  onclick: () => void;
  testid?: string;
  disabled?: Read<boolean>;
  kind?: string;
  pressed?: Read<boolean>;
  title?: string;
}): HTMLElement {
  return (
    <button
      type="button"
      class={props.kind}
      data-testid={props.testid}
      disabled={props.disabled ?? false}
      aria-pressed={props.pressed}
      title={props.title}
      onclick={props.onclick}
    >
      {props.label}
    </button>
  ) as HTMLElement;
}

function moveTarget(key: string): ItemEntry | undefined {
  const rows = page()?.rows ?? [];
  const index = rows.findIndex((row) => row.key === key);
  return rows[index + 1] ?? rows[index - 1];
}

const rowStates = new WeakMap<Element, (next: ItemEntry) => void>();

function renderRow(initial: ItemEntry): Element {
  const row = state(initial);
  const write = (run: (db: StockroomDb) => Promise<string>) =>
    act(`Changing ${row().value.name}`, () => withDb(run));
  const node = (
    <tr data-testid="item-row" data-key={initial.key}>
      <td class="position">{() => String(row().value.position)}</td>
      <td class="name">
        {() => row().value.name}
        <code class="key">{initial.key}</code>
      </td>
      <td class="units" data-testid="item-units">
        {() => String(row().value.units)}
      </td>
      <td class="actions">
        <Button
          label="−1"
          testid="take-one"
          disabled={() => !canUse()}
          onclick={() => write((db) => changeUnits(db, initial.key, -1, tab))}
        />
        <Button
          label="+1"
          testid="add-one"
          disabled={() => !canUse()}
          onclick={() => write((db) => changeUnits(db, initial.key, 1, tab))}
        />
        <Button
          label={() =>
            page()?.rows.at(-1)?.key === initial.key ? "Move 5 ↑" : "Move 5 ↓"
          }
          testid="move-five"
          title="Move 5 units to the next row, or to the previous row from the last one"
          disabled={() => !canUse()}
          onclick={() =>
            write((db) => {
              const target = moveTarget(initial.key);
              if (!target)
                return Promise.reject(new Error("This page has no other row"));
              return moveUnits(db, initial.key, target.key, 5, tab);
            })
          }
        />
        <Button
          label="Delete"
          testid="delete-item"
          disabled={() => !canUse()}
          onclick={() =>
            write((db) =>
              deleteItem(db, initial.key, row().value.name, tab).then(
                () => `Deleted ${row().value.name}.`,
              ),
            )
          }
        />
      </td>
    </tr>
  ) as Element;
  rowStates.set(node, row);
  return node;
}

function goToBin(bin: string): void {
  view({ bin, direction: view().direction, trail: [] });
}

function goNext(): void {
  const current = view();
  const last = page()?.rows.at(-1);
  if (!last) return;
  view({
    ...current,
    cursor: last.value.position,
    trail: [...current.trail, current.cursor],
  });
}

function goPrevious(): void {
  const { bin, direction, trail } = view();
  const cursor = trail.at(-1);
  view({
    bin,
    direction,
    trail: trail.slice(0, -1),
    ...(cursor === undefined ? {} : { cursor }),
  });
}

function flipDirection(): void {
  const { bin, direction } = view();
  view({ bin, direction: direction === "next" ? "prev" : "next", trail: [] });
}

function addFromForm(event: SubmitEvent): void {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const input = form.elements.namedItem("name") as HTMLInputElement;
  const name = input.value.trim();
  if (!name) return;
  input.value = "";
  const { bin } = view();
  act(`Adding ${name}`, () =>
    withDb((db) =>
      addItems(db, bin, [name], tab).then(
        () => `Added ${name} to ${binName(bin)}.`,
      ),
    ),
  );
}

function addThousand(): void {
  const { bin } = view();
  act("Adding 1,000 items", () =>
    withDb((db) =>
      addItems(db, bin, syntheticNames(1000), tab).then(
        (ms) =>
          `Committed 1,000 rows to ${binName(bin)} in one transaction in ${ms.toFixed(0)} ms.`,
      ),
    ),
  );
}

function Inventory(): HTMLElement {
  const tabs = (<div class="bins" />) as Element;
  list(tabs, () => bins()?.rows ?? [], {
    key: (row) => row.key,
    render: (row) => (
      <Button
        label={row.value}
        testid={`bin-${row.key}`}
        pressed={() => view().bin === row.key}
        onclick={() => goToBin(row.key)}
      />
    ),
  });
  const body = (<tbody data-testid="inventory-rows" />) as Element;
  list(body, () => page()?.rows ?? [], {
    key: (row) => row.key,
    render: renderRow,
    update: (node, row) => rowStates.get(node)?.(row),
  });
  return (
    <section class="panel inventory" aria-labelledby="inventory-title">
      <header class="panel-head">
        <h2 id="inventory-title">Inventory</h2>
        <p class="hint">
          Keyset pages from a unique <code>[bin, position]</code> index. Keys
          are not stored in the values.
        </p>
      </header>
      <fieldset class="bin-picker">
        <legend class="visually-hidden">Bin</legend>
        {tabs}
      </fieldset>
      <p
        class={{
          status: true,
          bad: () => Boolean(session()?.inventory.error()),
        }}
        data-testid="inventory-status"
        aria-live="polite"
      >
        {inventoryStatus}
      </p>
      <div class={{ "table-frame": true, stale }} inert={stale}>
        <table>
          <thead>
            <tr>
              <th scope="col" class="position">
                Pos.
              </th>
              <th scope="col">Item and primary key</th>
              <th scope="col" class="units">
                Units
              </th>
              <th scope="col" class="actions">
                <span class="visually-hidden">Actions</span>
              </th>
            </tr>
          </thead>
          {body}
        </table>
      </div>
      <p class="empty" hidden={() => (page()?.rows.length ?? 1) > 0}>
        No items on this page.
      </p>
      <div class="pager">
        <Button
          label="Previous"
          testid="page-previous"
          disabled={() => view().trail.length === 0}
          onclick={goPrevious}
        />
        <Button
          label="Next"
          testid="page-next"
          disabled={() => stale() || !page()?.more}
          onclick={goNext}
        />
        <span class="pager-position" data-testid="page-number">
          {() => `Page ${view().trail.length + 1}`}
        </span>
        <span class="spacer" />
        <Button
          label={() =>
            view().direction === "next"
              ? "Order: ascending"
              : "Order: descending"
          }
          testid="flip-direction"
          onclick={flipDirection}
        />
        <Button
          label="Refresh this query"
          testid="refresh-query"
          disabled={() => !canUse()}
          onclick={() => session()?.inventory.refresh()}
        />
        <label class="check">
          <input
            type="checkbox"
            data-testid="fail-reads"
            checked={failReads}
            onchange={(event: Event) =>
              failReads((event.currentTarget as HTMLInputElement).checked)
            }
          />
          Make reads fail
        </label>
      </div>
      <form class="add" onsubmit={addFromForm}>
        <label>
          <span class="visually-hidden">New item name</span>
          <input
            name="name"
            data-testid="add-name"
            autocomplete="off"
            placeholder="New item name"
          />
        </label>
        <button
          type="submit"
          data-testid="add-submit"
          disabled={() => !canUse()}
        >
          Add to this bin
        </button>
        <Button
          label="Add 1,000 in one write"
          testid="add-thousand"
          disabled={() => !canUse()}
          onclick={addThousand}
        />
      </form>
    </section>
  ) as HTMLElement;
}

// ----------------------------------------------------------------------------------- Side panels

function StatusPanel(): HTMLElement {
  return (
    <section class="panel" aria-labelledby="status-title">
      <header class="panel-head">
        <h2 id="status-title">This tab</h2>
        <code data-testid="tab-name">{tab}</code>
      </header>
      <dl class="facts">
        <div>
          <dt>Connection</dt>
          <dd>
            <strong data-testid="connection">{connection}</strong>
            <span>
              {() =>
                openBlocked() && opening()
                  ? "Waiting for another connection to close."
                  : (openError() ?? CONNECTION_TEXT[connection()])
              }
            </span>
          </dd>
        </div>
        <div>
          <dt>Cross-tab</dt>
          <dd>
            <strong data-testid="cross-tab">{crossTab}</strong>
            <span>{crossTabText}</span>
          </dd>
        </div>
        <div>
          <dt>Completed reads</dt>
          <dd>
            <span>
              Inventory{" "}
              <strong data-testid="reads-inventory">
                {() => String(page()?.reads ?? 0)}
              </strong>
              , bins{" "}
              <strong data-testid="reads-bins">
                {() => String(bins()?.reads ?? 0)}
              </strong>
              , journal{" "}
              <strong data-testid="reads-journal">
                {() => String(journal()?.reads ?? 0)}
              </strong>
            </span>
            <span>
              A query reruns only for its own stores, so changing units does not
              reread bin names. Focus rereads all of them.
            </span>
          </dd>
        </div>
      </dl>
      <div class="row-of-buttons">
        <Button
          label="Refresh all queries"
          testid="refresh-all"
          disabled={() => !canUse()}
          onclick={() => session()?.db.refresh()}
        />
        <Button
          label={() => (canUse() ? "Close connection" : "Reopen")}
          testid="close-or-reopen"
          disabled={opening}
          onclick={() => {
            if (canUse()) session()?.db.close();
            else void connect();
          }}
        />
      </div>
      <div class="row-of-buttons">
        <Button
          label="Restore sample data"
          testid="restore-data"
          disabled={() => !canUse()}
          onclick={() => {
            view({ bin: view().bin, direction: view().direction, trail: [] });
            act("Restoring sample data", () =>
              withDb((db) =>
                restoreSampleData(db, tab).then(
                  () => "Restored the sample data in one commit.",
                ),
              ),
            );
          }}
        />
        <Button
          label="Delete database"
          testid="delete-database"
          disabled={opening}
          kind="danger"
          onclick={() => void deleteEverything()}
        />
      </div>
      <p class="hint">
        Restore keeps the schema and updates other tabs. Delete removes the
        database, and other tabs have to reopen.
      </p>
    </section>
  ) as HTMLElement;
}

function LowStockPanel(): HTMLElement {
  const body = (<ol class="low" data-testid="low-rows" />) as Element;
  list(body, () => lowRows()?.rows ?? [], {
    key: (row) => row.key,
    render: (initial) => {
      const row = state(initial);
      const node = (
        <li data-testid="low-row" data-key={initial.key}>
          <span>{() => row().value.name}</span>
          <strong data-testid="low-units">
            {() => String(row().value.units)}
          </strong>
          <Button
            label="+1"
            testid="low-add"
            disabled={() => !canUse()}
            onclick={() =>
              act(`Changing ${row().value.name}`, () =>
                withDb((db) => changeUnits(db, initial.key, 1, tab)),
              )
            }
          />
        </li>
      ) as Element;
      rowStates.set(node, row);
      return node;
    },
    update: (node, row) => rowStates.get(node)?.(row),
  });
  return (
    <section class="panel" aria-labelledby="low-title">
      <header class="panel-head">
        <h2 id="low-title">Low stock</h2>
        <code data-testid="low-mode">{lowMode}</code>
      </header>
      <p class="hint">
        A nonunique <code>units</code> index; equal counts order by primary key.
        This panel has its own scope.
      </p>
      <p class="status" data-testid="low-status" aria-live="polite">
        {lowStatus}
      </p>
      {body}
      <div class="row-of-buttons">
        <Button
          label={() => (lowMode() === "paused" ? "Resume" : "Pause")}
          testid="low-pause"
          disabled={() => lowMode() === "disposed" || !canUse()}
          onclick={pauseOrResume}
        />
        <Button
          label={() => (lowMode() === "disposed" ? "Mount" : "Dispose")}
          testid="low-dispose"
          disabled={() => !canUse()}
          onclick={disposeOrMount}
        />
      </div>
    </section>
  ) as HTMLElement;
}

function JournalPanel(): HTMLElement {
  const body = (<ol class="journal" data-testid="journal-rows" />) as Element;
  list(body, () => journal()?.rows ?? [], {
    key: (row) => row.key,
    render: (row) => (
      <li data-testid="journal-row">
        <code>{String(row.key)}</code>
        <span>{row.value}</span>
      </li>
    ),
  });
  return (
    <section class="panel" aria-labelledby="journal-title">
      <header class="panel-head">
        <h2 id="journal-title">Journal</h2>
      </header>
      <p class="hint">
        Plain strings under numeric keys. Each line commits in the same
        transaction as its change. This shows the newest 8 lines.
      </p>
      {body}
    </section>
  ) as HTMLElement;
}

// -------------------------------------------------------------------------------------- Scenarios

type Outcome =
  | { kind: "idle" }
  | { kind: "running"; text?: string }
  | { kind: "passed" | "failed"; text: string };

function outcomeView(outcome: Read<Outcome>, testid: string): HTMLElement {
  const text = () => {
    const current = outcome();
    switch (current.kind) {
      case "idle":
        return "Not run in this tab.";
      case "running":
        return current.text ?? "Running.";
      case "passed":
        return `As expected. ${current.text}`;
      default:
        return `Unexpected result. ${current.text}`;
    }
  };
  return (
    <p
      class={{
        outcome: true,
        ok: () => outcome().kind === "passed",
        bad: () => outcome().kind === "failed",
      }}
      data-testid={testid}
      data-outcome={() => outcome().kind}
      aria-live="polite"
    >
      {text}
    </p>
  ) as HTMLElement;
}

function ScenarioCard(props: {
  id: string;
  title: string;
  about: string;
  disabled: Read<boolean>;
  run: () => Promise<string>;
}): HTMLElement {
  const outcome = state<Outcome>({ kind: "idle" });
  const run = () => {
    outcome({ kind: "running" });
    props.run().then(
      (text) => outcome({ kind: "passed", text }),
      (error: unknown) => outcome({ kind: "failed", text: describe(error) }),
    );
  };
  return (
    <article class="scenario">
      <h3>{props.title}</h3>
      <p>{props.about}</p>
      {outcomeView(outcome, `outcome-${props.id}`)}
      <Button
        label="Run"
        testid={`run-${props.id}`}
        disabled={() => outcome().kind === "running" || props.disabled()}
        onclick={run}
      />
    </article>
  ) as HTMLElement;
}

// The two upgrade scenarios share one database, so only one can run at a time in this tab.
const upgradeRunning = state(false);

function runUpgrade(run: () => Promise<string>): Promise<string> {
  upgradeRunning(true);
  return run().finally(() => upgradeRunning(false));
}

function BlockedUpgradeCard(): HTMLElement {
  const outcome = state<Outcome>({ kind: "idle" });
  const waiting = state(false);
  let active: BlockedUpgrade | undefined;
  const run = () => {
    outcome({ kind: "running", text: "Opening version 2." });
    waiting(false);
    upgradeRunning(true);
    active = blockedUpgrade(() => {
      waiting(true);
      outcome({
        kind: "running",
        text: "Blocked. The version 1 loom/db handle closed itself, but a raw connection is holding the upgrade. Release or cancel it.",
      });
    });
    active.done
      .then(
        (text) => outcome({ kind: "passed", text }),
        (error: unknown) => outcome({ kind: "failed", text: describe(error) }),
      )
      .finally(() => {
        active = undefined;
        waiting(false);
        upgradeRunning(false);
      });
  };
  return (
    <article class="scenario">
      <h3>Blocked upgrade</h3>
      <p>
        A raw connection ignores <code>versionchange</code>, so opening version
        2 waits. Uses its own database.
      </p>
      {outcomeView(outcome, "outcome-blocked-upgrade")}
      <div class="row-of-buttons">
        <Button
          label="Run"
          testid="run-blocked-upgrade"
          disabled={upgradeRunning}
          onclick={run}
        />
        <Button
          label="Release"
          testid="release-blocked-upgrade"
          disabled={() => !waiting()}
          onclick={() => active?.release()}
        />
        <Button
          label="Cancel"
          testid="cancel-blocked-upgrade"
          disabled={() => !waiting()}
          onclick={() => active?.cancel()}
        />
      </div>
    </article>
  ) as HTMLElement;
}

function Scenarios(): HTMLElement {
  return (
    <section class="panel scenarios" aria-labelledby="scenarios-title">
      <header class="panel-head">
        <h2 id="scenarios-title">Failure scenarios</h2>
        <p class="hint">
          Each one causes a real failure, then reads storage back to check what
          happened.
        </p>
      </header>
      <div class="scenario-grid">
        <ScenarioCard
          id="failed-transfer"
          title="Failed transaction"
          about="A callback throws after two puts and a journal line. All three must roll back."
          disabled={() => !canUse()}
          run={() => withDb((db) => failedTransfer(db, view().bin))}
        />
        <ScenarioCard
          id="caught-constraint"
          title="Caught request error"
          about="A duplicate index key fails, and the callback catches it. The transaction still aborts."
          disabled={() => !canUse()}
          run={() => withDb((db) => caughtConstraint(db, view().bin))}
        />
        <ScenarioCard
          id="premature-commit"
          title="Await outside the transaction"
          about="A timer lets IndexedDB commit early. The error must say the write is already saved."
          disabled={() => !canUse()}
          run={() => withDb((db) => prematureCommit(db, tab))}
        />
        <ScenarioCard
          id="close-during-write"
          title="Close during a write"
          about="close() does not cancel admitted work. The write commits and still reaches other tabs."
          disabled={() => !canUse()}
          run={() => withDb((db) => closeDuringWrite(db, tab))}
        />
        <ScenarioCard
          id="failed-upgrade"
          title="Failed upgrade"
          about="An upgrade callback throws. The old version, its schema, and its data remain. Uses its own database."
          disabled={upgradeRunning}
          run={() => runUpgrade(failedUpgrade)}
        />
        <BlockedUpgradeCard />
      </div>
    </section>
  ) as HTMLElement;
}

// -------------------------------------------------------------------------------------- Page shell

const host = document.querySelector("#stockroom");
if (!host) throw new Error("Missing #stockroom root.");

const here = location.pathname;
host.replaceChildren(
  <div class="shell">
    <header class="masthead">
      <div>
        <h1>Stockroom</h1>
        <p>
          A synthetic inventory on <code>loom/db</code>. The data stays in this
          browser profile and survives a reload.
        </p>
      </div>
      <nav class="links" aria-label="Open another tab">
        <a href={here} target="_blank" rel="noopener" data-testid="second-tab">
          Open a second tab
        </a>
        <a
          href={`${here}?transport=manual`}
          target="_blank"
          rel="noopener"
          data-testid="manual-tab"
        >
          Open a manual-mode tab
        </a>
      </nav>
    </header>
    <p
      class={{ banner: true, bad: () => notice()?.error === true }}
      data-testid="notice"
      aria-live="polite"
    >
      {() =>
        notice()?.text ??
        "Change a row here and watch a second tab reread it after the commit."
      }
    </p>
    <div class="columns">
      <main class="primary">
        <Inventory />
        <Scenarios />
      </main>
      <aside class="side">
        <StatusPanel />
        <LowStockPanel />
        <JournalPanel />
      </aside>
    </div>
  </div>,
);

void connect();

// Repeatable failure scenarios. Each one causes a real failure, reads the result back, and rejects
// if storage did not do what the API promises, so a passing card is evidence and not only a label.
import { openDatabase, TransactionContractError } from "loom/db";
import { deleteDatabase, firstRows, type StockroomDb } from "./database.js";

async function twoItems(db: StockroomDb, bin: string) {
  const [first, second] = await firstRows(db, bin, 2);
  if (!first || !second)
    throw new Error("This bin needs at least two items for this scenario");
  return [first, second] as const;
}

function journalLength(db: StockroomDb): Promise<number> {
  return db.read(["journal"], async (tx) => {
    const [last] = await tx
      .store("journal")
      .entries({ direction: "prev", limit: 1 });
    return last?.key ?? 0;
  });
}

function assertUnchanged(actual: unknown, expected: unknown, label: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(`${label} changed, but the transaction should have failed`);
}

/** A callback fails after both puts and the journal line succeeded. */
export async function failedTransfer(
  db: StockroomDb,
  bin: string,
): Promise<string> {
  const [first, second] = await twoItems(db, bin);
  const journal = await journalLength(db);
  const failure = new Error("Forced failure after both puts");
  let caught: unknown;
  try {
    await db.write(["items", "journal"], async (tx) => {
      const items = tx.store("items");
      await items.put(first.key, {
        ...first.value,
        units: first.value.units - 1,
      });
      await items.put(second.key, {
        ...second.value,
        units: second.value.units + 1,
      });
      await tx.store("journal").put(journal + 1, "This line must not persist");
      throw failure;
    });
  } catch (error) {
    caught = error;
  }
  if (caught !== failure) throw new Error("The write did not report the error");
  const [nowFirst, nowSecond] = await twoItems(db, bin);
  assertUnchanged(nowFirst.value, first.value, first.value.name);
  assertUnchanged(nowSecond.value, second.value, second.value.name);
  assertUnchanged(await journalLength(db), journal, "The journal");
  return `Rolled back: ${first.value.name} still has ${nowFirst.value.units} units, ${second.value.name} still has ${nowSecond.value.units}, and the journal has no new line.`;
}

/** Catching a failed request does not save the transaction: IndexedDB aborts it anyway. */
export async function caughtConstraint(
  db: StockroomDb,
  bin: string,
): Promise<string> {
  const [first, second] = await twoItems(db, bin);
  const key = "scenario-duplicate-position";
  let insideCallback = "not reached";
  let outer = "resolved";
  try {
    await db.write(["items"], async (tx) => {
      const items = tx.store("items");
      await items.put(first.key, {
        ...first.value,
        units: first.value.units + 1,
      });
      try {
        await items.put(key, second.value); // Same [bin, position] as the second item.
      } catch (error) {
        insideCallback = error instanceof DOMException ? error.name : "other";
      }
    });
  } catch (error) {
    outer = error instanceof DOMException ? error.name : "other";
  }
  if (insideCallback !== "ConstraintError" || outer !== "ConstraintError")
    throw new Error(
      `Expected ConstraintError twice, saw ${insideCallback} and ${outer}`,
    );
  const [nowFirst] = await twoItems(db, bin);
  assertUnchanged(nowFirst.value, first.value, first.value.name);
  const leftover = await db.read(["items"], (tx) => tx.store("items").get(key));
  if (leftover) throw new Error("The rejected row was stored");
  return `The callback caught ConstraintError, but the write still rejected and the earlier put rolled back: ${first.value.name} still has ${nowFirst.value.units} units.`;
}

/** Awaiting a timer lets IndexedDB commit early. The error must say that data is already saved. */
export async function prematureCommit(
  db: StockroomDb,
  tab: string,
): Promise<string> {
  const key = (await journalLength(db)) + 1;
  let caught: unknown;
  try {
    await db.write(["journal"], async (tx) => {
      await tx
        .store("journal")
        .put(key, `${tab}: saved before a timer ended the transaction`);
      await new Promise((resolve) => setTimeout(resolve, 50));
      await tx.store("journal").put(key + 1, "This line must not persist");
    });
  } catch (error) {
    caught = error;
  }
  if (!(caught instanceof TransactionContractError) || !caught.committed)
    throw new Error("Expected TransactionContractError with committed: true");
  const saved = await db.read(["journal"], (tx) =>
    tx.store("journal").get(key),
  );
  if (saved === undefined)
    throw new Error("The committed journal line is missing");
  return `TransactionContractError with committed: true. The first line is saved, so this write must not be retried.`;
}

/** Closing does not cancel admitted work: the write commits and still notifies other tabs. */
export async function closeDuringWrite(
  db: StockroomDb,
  tab: string,
): Promise<string> {
  const key = (await journalLength(db)) + 1;
  const write = db.write(["journal"], (tx) =>
    tx.store("journal").put(key, `${tab}: saved after close() was called`),
  );
  db.close();
  await write;
  return `The write committed after close(). This tab's connection is ${db.connection()}; other tabs show the new journal line. Reopen to continue here.`;
}

// ------------------------------------------------------------------------------------- Upgrades
// These use their own database. Raising the stockroom's version would make every open tab fail
// with VersionError until its code requested the new version.

const UPGRADE_DATABASE = "loom-db-demo-upgrades";
interface NotesV1 {
  notes: { key: string; value: string; indexes: Record<never, never> };
}
interface NotesV2 extends NotesV1 {
  tags: { key: string; value: string; indexes: Record<never, never> };
}

function openNotesV1() {
  return openDatabase<NotesV1>({
    name: UPGRADE_DATABASE,
    version: 1,
    upgrade(native, oldVersion) {
      if (oldVersion === 0) native.createObjectStore("notes");
      return undefined;
    },
  });
}

/** A native connection, for what the `loom/db` handle deliberately does not expose. */
function openNative(version?: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(UPGRADE_DATABASE, version);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/** A failing upgrade callback leaves the old schema and its data. */
export async function failedUpgrade(): Promise<string> {
  await deleteDatabase(UPGRADE_DATABASE);
  const before = await openNotesV1();
  await before.write(["notes"], (tx) =>
    tx.store("notes").put("kept", "Written at version 1"),
  );
  before.close();
  const failure = new Error("Forced upgrade failure");
  let caught: unknown;
  try {
    const opened = await openDatabase<NotesV2>({
      name: UPGRADE_DATABASE,
      version: 2,
      upgrade(native) {
        native.createObjectStore("tags");
        throw failure;
      },
    });
    opened.close();
  } catch (error) {
    caught = error;
  }
  if (caught === undefined) throw new Error("The failed upgrade opened");
  const native = await openNative();
  const { version } = native;
  const hasTags = native.objectStoreNames.contains("tags");
  native.close();
  if (version !== 1 || hasTags)
    throw new Error(`The upgrade kept version ${version}`);
  const after = await openNotesV1();
  const kept = await after.read(["notes"], (tx) =>
    tx.store("notes").get("kept"),
  );
  after.close();
  await deleteDatabase(UPGRADE_DATABASE);
  if (!kept) throw new Error("The version 1 record is missing");
  return `Opening version 2 rejected. The database is still version 1, it has no "tags" store, and its record is intact.`;
}

export interface BlockedUpgrade {
  /** Close the connection that is holding the upgrade back. */
  release(): void;
  /** Abort opening while it waits. */
  cancel(): void;
  readonly done: Promise<string>;
}

/**
 * `loom/db` handles close themselves on versionchange, so they cannot block an upgrade. Only a raw
 * connection that ignores the event can, which is what another library or old code would look like.
 */
export function blockedUpgrade(onBlocked: () => void): BlockedUpgrade {
  const abort = new AbortController();
  let holder: IDBDatabase | undefined;
  const release = () => {
    holder?.close();
    holder = undefined;
  };
  const run = async () => {
    await deleteDatabase(UPGRADE_DATABASE);
    const live = await openNotesV1();
    await live.write(["notes"], (tx) =>
      tx.store("notes").put("kept", "Written at version 1"),
    );
    holder = await openNative(1);
    let upgraded: Awaited<ReturnType<typeof openDatabase<NotesV2>>>;
    try {
      upgraded = await openDatabase<NotesV2>({
        name: UPGRADE_DATABASE,
        version: 2,
        signal: abort.signal,
        upgrade(native, oldVersion) {
          if (oldVersion < 2) native.createObjectStore("tags");
          return undefined;
        },
        onBlocked,
      });
    } catch (error) {
      if (abort.signal.aborted) {
        release();
        await deleteDatabase(UPGRADE_DATABASE);
        return `Opening was cancelled while it waited. The version 1 handle had already closed: ${live.connection()}.`;
      }
      live.close();
      throw error;
    }
    const connection = live.connection();
    const kept = await upgraded.read(["notes"], (tx) =>
      tx.store("notes").get("kept"),
    );
    upgraded.close();
    await deleteDatabase(UPGRADE_DATABASE);
    if (connection !== "versionchange" || !kept)
      throw new Error(`Unexpected result: ${connection}, ${String(kept)}`);
    return `Version 2 opened after the holder closed. The version 1 handle reports ${connection}, and its record is intact.`;
  };
  const done = run().finally(release);
  return { release, cancel: () => abort.abort(), done };
}

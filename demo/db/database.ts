// The stockroom: a small synthetic inventory built only on the public `loom/db` API.
//
//   items    explicit string keys that are not stored in the value, one unique compound index for
//            paging and one nonunique numeric index whose ties break on the primary key.
//   labels   primitive string values: bin ID -> display name.
//   journal  primitive string values under numeric keys. The transaction that changes items writes
//            its journal line too, so both commit or neither does.
import type { Read } from "loom";
import type { Resource } from "loom/async";
import {
  type Database,
  type DbEntry,
  openDatabase,
  type WriteStore,
} from "loom/db";

export interface Item {
  bin: string;
  position: number;
  name: string;
  units: number;
}
export interface Stockroom {
  items: {
    key: string;
    value: Item;
    indexes: { byBinPosition: readonly [string, number]; byUnits: number };
  };
  labels: { key: string; value: string; indexes: Record<never, never> };
  journal: { key: number; value: string; indexes: Record<never, never> };
}
export type StockroomDb = Database<Stockroom>;
export type ItemEntry = DbEntry<Item, string>;

export const DATABASE_NAME = "loom-db-demo-stockroom";
export const PAGE_SIZE = 10;
const BIN_NAMES = ["Aisle A", "Aisle B", "Aisle C", "Aisle D"];
const SEED_ITEMS_PER_BIN = 30;
const PARTS = ["Hex bolt", "Wing nut", "Washer", "Cable tie", "Hinge", "Fuse"];
const SIZES = ["S", "M", "L", "XL", "M6"];

function binId(index: number): string {
  return `bin-${String.fromCharCode(97 + index)}`;
}

function partName(index: number): string {
  const part = PARTS[index % PARTS.length];
  const size = SIZES[index % SIZES.length];
  return `${part} ${size}`;
}

async function appendJournal(
  journal: WriteStore<Stockroom["journal"]>,
  line: string,
): Promise<void> {
  const [last] = await journal.entries({ direction: "prev", limit: 1 });
  await journal.put((last?.key ?? 0) + 1, line);
}

// A readwrite transaction serializes this with other tabs, so two tabs cannot both seed.
async function seed(
  items: WriteStore<Stockroom["items"]>,
  labels: WriteStore<Stockroom["labels"]>,
  journal: WriteStore<Stockroom["journal"]>,
  tab: string,
): Promise<void> {
  for (const [bin, name] of BIN_NAMES.entries()) {
    await labels.put(binId(bin), name);
    for (let position = 1; position <= SEED_ITEMS_PER_BIN; position++) {
      const serial = bin * SEED_ITEMS_PER_BIN + position;
      await items.put(`seed-${String(serial).padStart(5, "0")}`, {
        bin: binId(bin),
        position,
        name: partName(serial),
        units: ((serial * 7) % 40) + 3,
      });
    }
  }
  await appendJournal(journal, `${tab} added the sample data`);
}

/** Open the stockroom and add the sample data once if it is empty. */
export async function openStockroom(
  tab: string,
  onBlocked?: () => void,
): Promise<StockroomDb> {
  const db = await openDatabase<Stockroom>({
    name: DATABASE_NAME,
    version: 1,
    upgrade(native, oldVersion) {
      if (oldVersion === 0) {
        const items = native.createObjectStore("items");
        items.createIndex("byBinPosition", ["bin", "position"], {
          unique: true,
        });
        items.createIndex("byUnits", "units");
        native.createObjectStore("labels");
        native.createObjectStore("journal");
      }
      return undefined;
    },
    ...(onBlocked ? { onBlocked } : {}),
  });
  try {
    await db.write(["items", "labels", "journal"], async (tx) => {
      const existing = await tx.store("labels").entries({ limit: 1 });
      if (existing.length > 0) return;
      await seed(
        tx.store("items"),
        tx.store("labels"),
        tx.store("journal"),
        tab,
      );
    });
  } catch (error) {
    db.close();
    throw error;
  }
  return db;
}

/** Native deletion: `loom/db` deliberately has no wrapper for this explicit application action. */
export function deleteDatabase(
  name: string,
  onBlocked?: () => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () => onBlocked?.();
  });
}

// ---------------------------------------------------------------------------------- Bounded reads

export interface InventoryView {
  readonly bin: string;
  readonly direction: "next" | "prev";
  /** The exclusive position this page starts after. Absent on the first page. */
  readonly cursor?: number;
  /** The cursors of earlier pages, so Previous can return to them. */
  readonly trail: readonly (number | undefined)[];
}
export interface InventoryPage {
  /** The view that produced these rows. `ready()` cannot say this: it latches on first success. */
  readonly request: InventoryView;
  readonly rows: readonly ItemEntry[];
  readonly more: boolean;
  readonly ms: number;
  readonly reads: number;
}
export interface Counted<T> {
  readonly rows: readonly T[];
  readonly reads: number;
}

export function inventoryQuery(
  db: StockroomDb,
  view: Read<InventoryView>,
  failReads: Read<boolean>,
): Resource<InventoryPage> {
  let reads = 0;
  return db.query(["items"], async (tx) => {
    // Track both parameters before the first await; later reads would not rerun this query.
    const request = view();
    if (failReads()) throw new Error("Reads are set to fail in this tab");
    const { bin, cursor, direction } = request;
    const forward = direction === "next";
    const lower: readonly [string, number] = [
      bin,
      forward && cursor !== undefined ? cursor : 0,
    ];
    const upper: readonly [string, number] = [
      bin,
      !forward && cursor !== undefined ? cursor : Number.MAX_SAFE_INTEGER,
    ];
    const start = performance.now();
    // One row past the page says whether another page exists without a count.
    const rows = await tx
      .store("items")
      .index("byBinPosition")
      .entries({
        range: {
          lower,
          upper,
          lowerOpen: forward && cursor !== undefined,
          upperOpen: !forward && cursor !== undefined,
        },
        direction,
        limit: PAGE_SIZE + 1,
      });
    reads += 1;
    return {
      request,
      rows: rows.slice(0, PAGE_SIZE),
      more: rows.length > PAGE_SIZE,
      ms: performance.now() - start,
      reads,
    };
  });
}

export function binsQuery(
  db: StockroomDb,
): Resource<Counted<DbEntry<string, string>>> {
  let reads = 0;
  return db.query(["labels"], async (tx) => {
    const rows = await tx.store("labels").entries({ limit: 50 });
    reads += 1;
    return { rows, reads };
  });
}

export function journalQuery(
  db: StockroomDb,
): Resource<Counted<DbEntry<string, number>>> {
  let reads = 0;
  return db.query(["journal"], async (tx) => {
    const rows = await tx
      .store("journal")
      .entries({ direction: "prev", limit: 8 });
    reads += 1;
    return { rows, reads };
  });
}

export function lowStockQuery(db: StockroomDb): Resource<Counted<ItemEntry>> {
  let reads = 0;
  return db.query(["items"], async (tx) => {
    const rows = await tx.store("items").index("byUnits").entries({ limit: 5 });
    reads += 1;
    return { rows, reads };
  });
}

/** The first rows of a bin, for writes and scenarios that need two real items. */
export function firstRows(
  db: StockroomDb,
  bin: string,
  limit: number,
): Promise<readonly ItemEntry[]> {
  return db.read(["items"], (tx) =>
    tx
      .store("items")
      .index("byBinPosition")
      .entries({
        range: { lower: [bin, 0], upper: [bin, Number.MAX_SAFE_INTEGER] },
        limit,
      }),
  );
}

// --------------------------------------------------------------------------------- Atomic writes

export function changeUnits(
  db: StockroomDb,
  key: string,
  delta: number,
  tab: string,
): Promise<string> {
  return db.write(["items", "journal"], async (tx) => {
    const items = tx.store("items");
    const item = await items.get(key);
    if (!item) throw new RangeError("This item no longer exists");
    const units = item.units + delta;
    if (units < 0) throw new RangeError(`${item.name} has no units left`);
    await items.put(key, { ...item, units });
    const sign = delta > 0 ? "+" : "";
    await appendJournal(
      tx.store("journal"),
      `${tab}: ${item.name} ${sign}${delta} (now ${units})`,
    );
    return `${item.name} now has ${units} units.`;
  });
}

/** Both rows and the journal line commit together, or none of them do. */
export function moveUnits(
  db: StockroomDb,
  from: string,
  to: string,
  units: number,
  tab: string,
): Promise<string> {
  return db.write(["items", "journal"], async (tx) => {
    const items = tx.store("items");
    const source = await items.get(from);
    const target = await items.get(to);
    if (!source || !target) throw new RangeError("This item no longer exists");
    if (source.units < units)
      throw new RangeError(`${source.name} has only ${source.units} units`);
    await items.put(from, { ...source, units: source.units - units });
    await items.put(to, { ...target, units: target.units + units });
    const line = `${units} units from ${source.name} to ${target.name}`;
    await appendJournal(tx.store("journal"), `${tab}: moved ${line}`);
    return `Moved ${line}.`;
  });
}

/** Add rows after the last position in a bin. Returns how long the transaction took to commit. */
export async function addItems(
  db: StockroomDb,
  bin: string,
  names: readonly string[],
  tab: string,
): Promise<number> {
  const start = performance.now();
  await db.write(["items", "journal"], async (tx) => {
    const items = tx.store("items");
    const [last] = await items.index("byBinPosition").entries({
      range: { lower: [bin, 0], upper: [bin, Number.MAX_SAFE_INTEGER] },
      direction: "prev",
      limit: 1,
    });
    let position = last?.value.position ?? 0;
    for (const name of names) {
      position += 1;
      await items.put(`item-${crypto.randomUUID()}`, {
        bin,
        position,
        name,
        units: 10,
      });
    }
    const added = names.length === 1 ? names[0] : `${names.length} items`;
    await appendJournal(tx.store("journal"), `${tab}: added ${added}`);
  });
  return performance.now() - start;
}

export function syntheticNames(count: number): readonly string[] {
  return Array.from({ length: count }, (_, index) => partName(index));
}

export function deleteItem(
  db: StockroomDb,
  key: string,
  name: string,
  tab: string,
): Promise<void> {
  return db.write(["items", "journal"], async (tx) => {
    await tx.store("items").delete(key);
    await appendJournal(tx.store("journal"), `${tab}: deleted ${name}`);
  });
}

/** A data-only reset: one commit, the same schema, and one notification to other tabs. */
export function restoreSampleData(db: StockroomDb, tab: string): Promise<void> {
  return db.write(["items", "labels", "journal"], async (tx) => {
    const items = tx.store("items");
    const labels = tx.store("labels");
    const journal = tx.store("journal");
    await items.clear();
    await labels.clear();
    await journal.clear();
    await seed(items, labels, journal, tab);
  });
}

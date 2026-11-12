import { computed, type State, scope, state } from "loom";
import { attrRead } from "loom/browser";
import * as dom from "loom/dom";
import { listen, onTap } from "loom/events";
import { keyedStates } from "loom/model";
import { afterFrames, frameCoalescer, watchSettled } from "loom/schedule";
import { bindStorage, codecs, storageSlot } from "loom/storage";
import { virtualList } from "loom/virtual-list";

/** Compile complete workflows against the same public imports used by consumers. */
export function temporaryView(
  durable: State<number>,
  signal: AbortSignal,
): HTMLElement {
  const host = dom.h("div");
  const node = dom.h("button", { title: computed(() => String(durable())) });
  host.append(node);
  const stop = dom.bindClass(node, "selected", () => durable() > 0, { signal });
  listen(
    node,
    "click",
    (event) => {
      event.preventDefault();
      durable(durable() + 1);
    },
    { owner: node, signal },
  );
  onTap(
    node,
    (event) => {
      event.preventDefault();
    },
    { signal },
  ).stop();
  attrRead(node, "title");
  stop();
  return host;
}
export function durableModel(signal: AbortSignal): State<number> {
  const value = state(0);
  bindStorage(value, storageSlot("count", codecs.number()), { signal });
  const view = scope(() => temporaryView(value, signal));
  view.stop();
  return value;
}
export function immutableRows(host: HTMLElement): () => void {
  const rows = state<readonly { id: string; label: string }[]>([]);
  const stop = dom.list(host, rows, {
    key: (row) => row.id,
    render: (row) => dom.h("span", null, row.label),
    update: (node, row) => {
      node.textContent = row.label;
    },
  });
  rows([{ id: "a", label: "First" }]);
  rows([{ id: "a", label: "Updated" }]);
  return stop;
}
export function foreignWindow(view: Window, signal: AbortSignal): void {
  const work = frameCoalescer(() => {}, { window: view, signal });
  work.request();
  work.cancel();
  work.stop();
  afterFrames(2, () => {}, { window: view, signal });
  watchSettled(
    state(""),
    (value) => {
      console.log(value);
    },
    { delayMs: 100, signal },
  );
}

/** Stream static blocks while keeping a completed subtree intact. */
export function reconcileBlocks(
  host: HTMLElement,
  completed: Node,
  changed: Node,
): Node[] {
  return dom.morphChildren(host, [completed, changed], {
    skip: "[data-morph-ignore]",
  });
}

function removedAPI(): void {
  // @ts-expect-error a narrowed string codec requires its allowed values
  codecs.string<"dark" | "light">();
  // @ts-expect-error storage must decode external data explicitly
  storageSlot<number>("count");
  // @ts-expect-error bindings always expose teardown
  dom.bindManual;
  // @ts-expect-error use explicit read or bind direction
  dom.attr;
  // @ts-expect-error event behavior has a separate home
  dom.onTap;
  // @ts-expect-error explicit schema is mandatory
  keyedStates();
  const model = keyedStates<{ count: number }>();
  // @ts-expect-error a value cannot widen its schema
  model.value("count", "wrong");
  // @ts-expect-error ambiguous cell factories were removed
  model.cell("count", 0);
  const view = virtualList<number>({
    rowHeight: 20,
    key: (value) => value,
    render: () => dom.h("div"),
  });
  // @ts-expect-error controllers terminate with stop
  view.destroy();
  // @ts-expect-error tap behavior is installed explicitly
  dom.h("button", { ontap: () => {} });
  // @ts-expect-error old descriptor types are absent
  const descriptor: dom.AttrBinding = {};
  void descriptor;
}
void removedAPI;
async function removedPaths(): Promise<void> {
  // @ts-expect-error use loom/schedule
  await import("loom/settle");
  // @ts-expect-error use loom/virtual-list
  await import("loom/dom/virtual-list");
  // @ts-expect-error use loom/motion
  await import("loom/dom/scroll-fade");
  // @ts-expect-error use loom/layout
  await import("loom/dom/reveal");
}
void removedPaths;

/** Generic persistence without application cache fields or embedded primary keys. */
export async function databaseConsumer() {
  const { openDatabase } = await import("loom/db");
  interface Schema {
    labels: { key: string; value: string; indexes: Record<never, never> };
    records: {
      key: string;
      value: { rank: number };
      indexes: { byRank: number };
    };
  }
  const db = await openDatabase<Schema>({
    name: "packed-consumer",
    version: 1,
    upgrade(native) {
      native.createObjectStore("labels");
      native.createObjectStore("records").createIndex("byRank", "rank");
      return undefined;
    },
  });
  await db.write(["labels"], (tx) => tx.store("labels").put("alpha", "same"));
  const entries = await db.read(["labels"], (tx) =>
    tx.store("labels").entries({ limit: 100 }),
  );
  const primary: string | undefined = entries[0]?.key;
  const ids: readonly string[] = await db.read(["records"], (tx) =>
    tx
      .store("records")
      .index("byRank")
      .keys({ range: { lower: 1 }, limit: 10 }),
  );
  void ids;
  const rows = db.query(["records"], (tx) =>
    tx
      .store("records")
      .index("byRank")
      .scan({ range: { lower: 1 }, limit: 10 }),
  );
  rows.stop();
  db.close();
  return primary;
}

/** Never executed: the package check requires each diagnostic to remain present. */
export async function databaseTypeFailures(
  db: import("loom/db").Database<{
    records: {
      key: string;
      value: { rank: number };
      indexes: { byRank: number };
    };
    other: { key: number; value: boolean; indexes: Record<never, never> };
  }>,
) {
  await db.read(["records"], async (tx) => {
    // @ts-expect-error Stores must be declared in the transaction scope.
    tx.store("other");
    // @ts-expect-error Readonly facades cannot mutate storage.
    tx.store("records").clear();
    // @ts-expect-error Primary key type is string.
    tx.store("records").get(1);
    // @ts-expect-error Only declared indexes can be read.
    tx.store("records").index("missing");
    const index = tx.store("records").index("byRank");
    // @ts-expect-error Index ranges use the numeric index key.
    index.entries({ range: { only: "primary" }, limit: 10 });
    // @ts-expect-error Exact and bounded ranges are mutually exclusive.
    index.scan({ range: { only: 1, lower: 2 }, limit: 10 });
    const entries = await index.entries({ limit: 10 });
    // @ts-expect-error Entry keys remain string primary keys.
    const numeric: number | undefined = entries[0]?.key;
    const keys = await index.keys({ limit: 10 });
    // @ts-expect-error Index key reads return string primary keys.
    const rank: number | undefined = keys[0];
    return [numeric, rank];
  });
  // @ts-expect-error Unknown database stores are rejected.
  db.read(["missing"], () => undefined);
  await db.write(["records"], async (tx) => {
    // @ts-expect-error Stored values must have the declared shape.
    await tx.store("records").put("id", { text: "wrong" });
  });
}

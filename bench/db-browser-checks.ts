import { effect, scope, state } from "loom";
import type { Resource } from "loom/async";
import { type Database, openDatabase, TransactionContractError } from "loom/db";

interface Records {
  items: {
    key: string;
    value: { group: string; position: number; body: string };
    indexes: { byGroup: readonly [string, number] };
  };
  labels: { key: string; value: string; indexes: Record<never, never> };
}
const value = (position: number) => ({
  group: "a",
  position,
  body: "synthetic",
});
const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
export async function until(
  test: () => boolean,
  timeoutMs = 5000,
): Promise<void> {
  const deadline = performance.now() + timeoutMs;
  while (!test()) {
    if (performance.now() > deadline)
      throw new Error("Database condition timed out");
    await pause();
  }
}
export function openFixture(name: string, version = 1) {
  return openDatabase<Records>({
    name,
    version,
    upgrade(db, old) {
      if (old === 0) {
        const items = db.createObjectStore("items");
        items.createIndex("byGroup", ["group", "position"], { unique: true });
        db.createObjectStore("labels");
      }
      return undefined;
    },
  });
}
async function removeDatabase(name: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(name);
    const deadline = setTimeout(
      () => reject(new Error("Fixture connection did not drain")),
      10000,
    );
    request.onsuccess = () => {
      clearTimeout(deadline);
      resolve();
    };
    request.onerror = () => {
      clearTimeout(deadline);
      reject(request.error);
    };
    // A close-pending connection may briefly block deletion while its reads drain.
  });
}

export async function runDatabaseChecks(): Promise<string[]> {
  const checks: string[] = [];
  const check = (ok: boolean, name: string) => {
    if (!ok) throw new Error(name);
    checks.push(name);
  };
  const rejected = async (promise: Promise<unknown>, name: string) => {
    try {
      await promise;
      throw new Error(`Expected ${name}`);
    } catch (error) {
      check(error instanceof Error && error.name === name, `rejects ${name}`);
      return error;
    }
  };
  const name = `loom-db-check-${crypto.randomUUID()}`;
  const db = await openFixture(name);
  const peer = await openFixture(name);
  try {
    await db.write(["items", "labels"], async (tx) => {
      await tx.store("items").put("one", value(1));
      await tx.store("items").put("two", value(2));
      await tx.store("items").put("three", value(3));
      await tx.store("labels").put("alpha", "same");
      await tx.store("labels").put("beta", "same");
    });
    const page = await db.read(["items"], (tx) =>
      tx
        .store("items")
        .index("byGroup")
        .entries({
          range: { lower: ["a", 0], upper: ["a", 3], upperOpen: true },
          direction: "prev",
          limit: 1,
        }),
    );
    check(
      page.length === 1 &&
        page[0]?.key === "two" &&
        page[0].value.position === 2,
      "bounded index ordering retains primary key",
    );
    const labels = await db.read(["labels"], (tx) =>
      tx.store("labels").entries({ limit: 10 }),
    );
    check(
      labels.map((entry) => entry.key).join() === "alpha,beta" &&
        labels.every((entry) => entry.value === "same"),
      "out-of-line primitive entries",
    );
    const next = await db.read(["labels"], (tx) =>
      tx
        .store("labels")
        .entries({ limit: 10, range: { lower: "alpha", lowerOpen: true } }),
    );
    check(
      next.length === 1 && next[0]?.key === "beta",
      "primary key continuation",
    );
    // Key reads must not open value cursors, so value cursors fail here.
    const storeCursor = IDBObjectStore.prototype.openCursor;
    const indexCursor = IDBIndex.prototype.openCursor;
    const valueCursor = () => {
      throw new DOMException("Synthetic value cursor", "InvalidStateError");
    };
    IDBObjectStore.prototype.openCursor = valueCursor;
    IDBIndex.prototype.openCursor = valueCursor;
    try {
      const keys = await db.read(["items"], (tx) => {
        const items = tx.store("items");
        return Promise.all([
          items.keys({ limit: 10 }),
          items.keys({ range: { lower: "one", upper: "three" }, limit: 10 }),
          items.keys({
            range: {
              lower: "one",
              upper: "two",
              lowerOpen: true,
              upperOpen: true,
            },
            limit: 10,
          }),
          items.keys({ range: { only: "two" }, limit: 10 }),
          items.keys({ direction: "prev", limit: 2 }),
          items.keys({ range: { lower: "x" }, limit: 10 }),
          items.index("byGroup").keys({ limit: 10 }),
          items.index("byGroup").keys({
            range: { lower: ["a", 2] },
            direction: "prev",
            limit: 1,
          }),
        ]);
      });
      check(
        keys.map((row) => row.join()).join("|") ===
          "one,three,two|one,three|three|two|two,three||one,two,three|three",
        "key reads honour ranges, direction, and limits without value cursors",
      );
    } finally {
      IDBObjectStore.prototype.openCursor = storeCursor;
      IDBIndex.prototype.openCursor = indexCursor;
    }
    let ownWrites: readonly string[] = [];
    await rejected(
      db.write(["items"], async (tx) => {
        const items = tx.store("items");
        await items.put("five", value(5));
        await items.delete("one");
        ownWrites = await items.keys({ limit: 10 });
        throw new Error("rollback");
      }),
      "Error",
    );
    check(
      ownWrites.join() === "five,three,two" &&
        (
          await db.read(["items"], (tx) =>
            tx.store("items").keys({ limit: 10 }),
          )
        ).join() === "one,three,two",
      "key reads see their own transaction's writes",
    );
    await rejected(
      db.read(["items"], (tx) => tx.store("items").keys({ limit: 0 })),
      "RangeError",
    );
    await rejected(
      db.read(["items"], (tx) =>
        tx.store("items").keys({ limit: 1, range: { lower: "b", upper: "a" } }),
      ),
      "DataError",
    );
    const keyCursor = IDBObjectStore.prototype.openKeyCursor;
    IDBObjectStore.prototype.openKeyCursor = () => {
      throw new DOMException("Synthetic key cursor", "UnknownError");
    };
    try {
      await rejected(
        db.read(["items"], async (tx) => {
          try {
            await tx.store("items").keys({ limit: 1 });
          } catch {
            /* A caught key read failure still aborts the transaction. */
          }
        }),
        "UnknownError",
      );
    } finally {
      IDBObjectStore.prototype.openKeyCursor = keyCursor;
    }
    const escapedItems = await db.read(["items"], (tx) => tx.store("items"));
    await rejected(escapedItems.keys({ limit: 1 }), "TransactionInactiveError");
    const keyQuery = peer.query(["items"], (tx) =>
      tx.store("items").keys({ range: { lower: "s" }, limit: 10 }),
    );
    await until(() => keyQuery.ready());
    await db.write(["items"], (tx) => tx.store("items").put("six", value(6)));
    await until(() => keyQuery()?.join() === "six,three,two");
    await db.write(["items"], (tx) => tx.store("items").delete("six"));
    await until(() => keyQuery()?.join() === "three,two");
    check(
      keyQuery.error() === undefined,
      "key queries follow added and removed keys",
    );
    keyQuery.stop();
    check(
      await db.read(["items"], (tx) => !("put" in tx.store("items"))),
      "readonly facade omits mutations",
    );
    await rejected(
      db.read(["items"], (tx) => tx.store("items").scan({ limit: 0 })),
      "RangeError",
    );
    await rejected(
      db.read(["items"], (tx) =>
        tx.store("items").scan({ limit: 1, range: { lowerOpen: true } }),
      ),
      "TypeError",
    );
    await rejected(
      db.read(["items"], (tx) => {
        // @ts-expect-error Runtime scope enforcement as well as static checking.
        return tx.store("labels").get("alpha");
      }),
      "NotFoundError",
    );
    const escaped = await db.read(["labels"], (tx) => tx.store("labels"));
    await rejected(escaped.get("alpha"), "TransactionInactiveError");
    await rejected(
      db.write(["items", "labels"], async (tx) => {
        await tx.store("labels").put("rolled-back", "no");
        try {
          await tx.store("items").put("duplicate", value(1));
        } catch {
          /* Caller cannot opt out of atomic failure. */
        }
      }),
      "ConstraintError",
    );
    check(
      (await db.read(["labels"], (tx) =>
        tx.store("labels").get("rolled-back"),
      )) === undefined,
      "caught request failure rolls back other store",
    );
    await rejected(
      db.write(["labels"], async (tx) => {
        await tx.store("labels").put("callback", "no");
        throw new Error("callback");
      }),
      "Error",
    );
    check(
      (await db.read(["labels"], (tx) =>
        tx.store("labels").get("callback"),
      )) === undefined,
      "callback throw rolls back",
    );
    await rejected(
      db.write(["labels"], async (tx) => {
        await tx.store("labels").put("clone", "no");
        try {
          // @ts-expect-error Deliberate structured-clone violation.
          await tx.store("labels").put("function", () => undefined);
        } catch {
          /* Native synchronous failures also abort. */
        }
      }),
      "DataCloneError",
    );
    check(
      (await db.read(["labels"], (tx) => tx.store("labels").get("clone"))) ===
        undefined,
      "caught clone failure is atomic",
    );

    const imperative = state(0);
    let imperativeRuns = 0;
    const stopImperative = effect(() => {
      imperativeRuns++;
      void db.read(["labels"], (tx) => {
        imperative();
        return tx.store("labels").get("alpha");
      });
    });
    imperative(1);
    await pause();
    check(
      imperativeRuns === 1,
      "imperative reads do not capture caller dependencies",
    );
    stopImperative();

    let runs = 0;
    const key = state("alpha");
    const query = peer.query(["labels"], (tx) => {
      runs++;
      return tx.store("labels").get(key());
    });
    await until(() => query.ready());
    check(query() === "same", "query initial read");
    const before = runs;
    await db.write(["items"], (tx) => tx.store("items").put("four", value(4)));
    await pause();
    check(runs === before, "unrelated store does not rerun query");
    await db.write(["labels"], (tx) =>
      tx.store("labels").put("alpha", "changed"),
    );
    await until(() => query() === "changed");
    check(query.error() === undefined, "same-window handles observe commits");
    key("beta");
    check(
      query.loading() && query() === "changed",
      "parameter change retains snapshot while reading",
    );
    await until(() => !query.loading());
    check(query() === "same", "query synchronous parameters tracked");
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const premature = db.write(["labels"], async (tx) => {
      await tx.store("labels").put("beta", "committed");
      await gate;
      throw new Error("late callback rejection");
    });
    const error = await rejected(premature, "TransactionContractError");
    check(
      error instanceof TransactionContractError && error.committed,
      "premature completion reports committed outcome",
    );
    await until(() => query() === "committed");
    release();
    await pause();
    query.stop();
    const stoppedRuns = runs;
    await db.write(["labels"], (tx) =>
      tx.store("labels").put("beta", "after-stop"),
    );
    await pause();
    check(runs === stoppedRuns, "stop removes subscription");

    let scoped!: Resource<string | undefined>;
    let scopedRuns = 0;
    const owner = scope(() => {
      scoped = db.query(["labels"], (tx) => {
        scopedRuns++;
        return tx.store("labels").get("beta");
      });
    });
    owner.pause();
    await until(() => scoped.ready()); // An admitted read may settle while paused.
    const pausedRuns = scopedRuns;
    await db.write(["labels"], (tx) =>
      tx.store("labels").put("beta", "paused"),
    );
    await pause();
    check(scopedRuns === pausedRuns, "pause disconnects invalidation");
    owner.resume();
    await until(() => scoped() === "paused");
    check(scopedRuns > pausedRuns, "resume reads missed updates");
    for (let i = 0; i < 100; i++) {
      const child = db.query(["labels"], (tx) =>
        tx.store("labels").get("beta"),
      );
      child.stop();
    }
    owner.stop();
    const finalRuns = scopedRuns;
    await db.write(["labels"], (tx) =>
      tx.store("labels").put("beta", "disposed"),
    );
    await pause();
    check(scopedRuns === finalRuns, "scope disposal is terminal");

    const selection = state(0);
    let nested!: Resource<string | undefined>;
    let nestedRuns = 0;
    const stopParent = effect(() => {
      selection();
      nested = db.query(["labels"], (tx) => {
        nestedRuns++;
        return tx.store("labels").get("beta");
      });
    });
    await until(() => nested.ready());
    selection(1);
    await until(() => nested.ready());
    const nestedBefore = nestedRuns;
    await db.write(["labels"], (tx) =>
      tx.store("labels").put("beta", "nested"),
    );
    await until(() => nested() === "nested");
    check(
      nestedRuns === nestedBefore + 1,
      "parent rerun disposes the earlier query",
    );
    stopParent();
    const ended = nestedRuns;
    await db.write(["labels"], (tx) => tx.store("labels").put("beta", "ended"));
    await pause();
    check(nestedRuns === ended, "parent effect disposal stops queries");

    const originalTransaction = IDBDatabase.prototype.transaction;
    let failCommittedCallback!: (reason: unknown) => void;
    const afterCommit = new Promise<never>((_resolve, reject) => {
      failCommittedCallback = reject;
    });
    IDBDatabase.prototype.transaction = function (...args) {
      const native = originalTransaction.apply(this, args);
      if (this.name === name && native.mode === "readwrite") {
        // Native completion is irreversible; run this listener before the adapter's.
        native.addEventListener(
          "complete",
          () => failCommittedCallback(new Error("late failure")),
          { once: true },
        );
      }
      return native;
    };
    try {
      const failure = await rejected(
        db.write(["labels"], async (tx) => {
          await tx.store("labels").put("commit-boundary", "durable");
          await afterCommit;
        }),
        "TransactionContractError",
      );
      check(
        failure instanceof TransactionContractError && failure.committed,
        "native completion boundary preserves committed error classification",
      );
      check(
        (await db.read(["labels"], (tx) =>
          tx.store("labels").get("commit-boundary"),
        )) === "durable",
        "native completion boundary cannot roll back durable data",
      );
    } finally {
      IDBDatabase.prototype.transaction = originalTransaction;
    }

    const transaction = IDBDatabase.prototype.transaction;
    let cancelledReads = 0;
    IDBDatabase.prototype.transaction = function (...args) {
      const native = transaction.apply(this, args);
      if (this.name === name && native.mode === "readonly")
        native.addEventListener("abort", () => cancelledReads++);
      return native;
    };
    try {
      const stopped = db.query(["items"], (tx) =>
        tx.store("items").scan({ limit: 1000 }),
      );
      stopped.stop();
      await until(() => cancelledReads === 1);
      check(
        !stopped.ready(),
        "stop aborts admitted readonly work without delivering a value",
      );
      const selected = state("alpha");
      const changing = db.query(["labels"], (tx) =>
        tx.store("labels").get(selected()),
      );
      for (let i = 0; i < 20; i++) selected(i % 2 === 0 ? "beta" : "alpha");
      await until(() => changing.ready());
      check(
        changing() === "changed" && changing.error() === undefined,
        "superseded native aborts do not replace the latest result with an error",
      );
      check(
        cancelledReads === 21,
        "parameter changes abort superseded readonly transactions",
      );
      changing.stop();
    } finally {
      IDBDatabase.prototype.transaction = transaction;
    }

    const transportRead = peer.query(["labels"], (tx) =>
      tx.store("labels").get("transport"),
    );
    await until(() => transportRead.ready());
    const post = BroadcastChannel.prototype.postMessage;
    BroadcastChannel.prototype.postMessage = () => {
      throw new DOMException("Synthetic channel failure", "InvalidStateError");
    };
    try {
      await db.write(["labels"], (tx) =>
        tx.store("labels").put("transport", "durable"),
      );
    } finally {
      BroadcastChannel.prototype.postMessage = post;
    }
    await until(() => transportRead() === "durable");
    check(
      db.crossTab() === "manual" && peer.crossTab() === "manual",
      "transport failure preserves commit and local delivery",
    );
    transportRead.stop();

    // Forced quota failure verifies the adapter without filling the user's disk.
    const put = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = () => {
      throw new DOMException("Synthetic quota", "QuotaExceededError");
    };
    try {
      await rejected(
        db.write(["labels"], (tx) => tx.store("labels").put("quota", "no")),
        "QuotaExceededError",
      );
    } finally {
      IDBObjectStore.prototype.put = put;
    }
    check(
      (await db.read(["labels"], (tx) => tx.store("labels").get("quota"))) ===
        undefined,
      "quota error does not publish rows",
    );

    const closeRead = peer.query(["labels"], (tx) =>
      tx.store("labels").get("late"),
    );
    await until(() => closeRead.ready());
    const writing = db.write(["labels"], (tx) =>
      tx.store("labels").put("late", "survives-close"),
    );
    db.close();
    await writing;
    await until(() => closeRead() === "survives-close");
    check(
      db.connection() === "closed",
      "close drains admitted write and notifies peers",
    );
    await rejected(
      db.read(["labels"], (tx) => tx.store("labels").get("late")),
      "InvalidStateError",
    );
    const upgraded = await openFixture(name, 2);
    check(peer.connection() === "versionchange", "upgrade closes old handles");
    check(
      closeRead.error() instanceof DOMException && !closeRead.loading(),
      "closed query exposes error",
    );
    closeRead.stop();
    upgraded.close();
    await rejected(
      openDatabase({
        name,
        version: 3,
        upgrade(native) {
          native.createObjectStore("failed");
          throw new Error("upgrade failed");
        },
      }),
      "Error",
    );
    const restored = await openFixture(name, 2);
    check(
      (await restored.read(["labels"], (tx) =>
        tx.store("labels").get("late"),
      )) === "survives-close",
      "failed upgrade preserves old database",
    );
    restored.close();
  } finally {
    db.close();
    peer.close();
    await removeDatabase(name);
  }

  const manualName = `${name}-manual`;
  const original = globalThis.BroadcastChannel;
  Object.defineProperty(globalThis, "BroadcastChannel", {
    configurable: true,
    writable: true,
    value: undefined,
  });
  const manual = await openFixture(manualName);
  Object.defineProperty(globalThis, "BroadcastChannel", {
    configurable: true,
    writable: true,
    value: original,
  });
  try {
    check(
      manual.crossTab() === "manual",
      "unavailable channel reports manual mode",
    );
    const query = manual.query(["labels"], (tx) => tx.store("labels").get("x"));
    await until(() => query.ready());
    await manual.write(["labels"], (tx) =>
      tx.store("labels").put("x", "local"),
    );
    await until(() => query() === "local");
    check(query() === "local", "manual mode still updates same-window reads");
    const raw = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(manualName, 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      for (const recovery of ["focus", "pageshow", "manual"] as const) {
        await new Promise<void>((resolve, reject) => {
          const tx = raw.transaction("labels", "readwrite");
          tx.objectStore("labels").put(recovery, "x");
          tx.oncomplete = () => resolve();
          tx.onabort = () => reject(tx.error);
        });
        if (recovery === "manual") manual.refresh();
        else window.dispatchEvent(new Event(recovery));
        await until(() => query() === recovery);
        check(
          query() === recovery,
          `${recovery} recovers an unannounced write`,
        );
      }
    } finally {
      raw.close();
    }
    query.stop();
  } finally {
    manual.close();
    await removeDatabase(manualName);
  }
  const blockedName = `${name}-blocked`;
  const initial = await openFixture(blockedName);
  initial.close();
  const blocker = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(blockedName, 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const controller = new AbortController();
  let blocked = false;
  try {
    await rejected(
      openDatabase({
        name: blockedName,
        version: 2,
        signal: controller.signal,
        onBlocked(oldVersion, newVersion) {
          blocked = oldVersion === 1 && newVersion === 2;
          controller.abort();
        },
      }),
      "AbortError",
    );
    check(
      blocked,
      "native blocked upgrade reports versions and accepts cancellation",
    );
  } finally {
    blocker.close();
  }
  const afterCancellation = await openFixture(blockedName, 3);
  afterCancellation.close();
  await removeDatabase(blockedName);
  check(true, "cancelled blocked open closes its late connection");

  const terminatedName = `${name}-terminated`;
  let raw!: IDBDatabase;
  const terminated = await openDatabase<Records>({
    name: terminatedName,
    version: 1,
    upgrade(native) {
      raw = native;
      native.createObjectStore("labels");
      return undefined;
    },
  });
  const terminatedRead = terminated.query(["labels"], (tx) =>
    tx.store("labels").get("x"),
  );
  await until(() => terminatedRead.ready());
  // Inject the platform's unexpected-close event; do not kill the test browser.
  raw.dispatchEvent(new Event("close"));
  check(
    terminated.connection() === "terminated" &&
      terminatedRead.error() instanceof DOMException,
    "unexpected native closure fences queries",
  );
  terminatedRead.stop();
  terminated.close();
  await removeDatabase(terminatedName);
  return checks;
}

let tab: Database<Records> | undefined;
let watched: Resource<string | undefined> | undefined;
let watching = 0;
export async function openTab(name: string) {
  tab = await openFixture(name);
  watched = tab.query(["labels"], (tx) => {
    watching++;
    return tx.store("labels").get("shared");
  });
  await until(() => watched?.ready() === true);
}
export function tabState() {
  return {
    value: watched?.(),
    loading: watched?.loading(),
    runs: watching,
    connection: tab?.connection(),
    mode: tab?.crossTab(),
  };
}
export async function writeTab(value: string, close = false) {
  if (!tab) throw new Error("Tab not opened");
  const write = tab.write(["labels", "items"], (tx) =>
    Promise.all([
      tx.store("labels").put("shared", value),
      ...Array.from({ length: 99 }, (_, position) =>
        tx.store("items").put(String(position), {
          group: "batch",
          position,
          body: value.padEnd(1024, "x"),
        }),
      ),
    ]),
  );
  if (close) tab.close();
  await write;
}
export function closeTab() {
  watched?.stop();
  tab?.close();
}

export async function measureDatabase() {
  const name = `loom-db-measure-${crypto.randomUUID()}`;
  const start = performance.now();
  const db = await openFixture(name);
  const coldOpen = performance.now() - start;
  try {
    const body = "x".repeat(1024);
    const seed = performance.now();
    for (let offset = 0; offset < 100000; offset += 1000) {
      await db.write(["items"], (tx) =>
        Promise.all(
          Array.from({ length: 1000 }, (_, j) => {
            const position = offset + j;
            return tx.store("items").put(String(position), {
              group: String(position % 100),
              position,
              body,
            });
          }),
        ),
      );
    }
    const seededMs = performance.now() - seed;
    const read = () =>
      db.read(["items"], (tx) =>
        tx
          .store("items")
          .index("byGroup")
          .scan({
            range: { lower: ["42", 0], upper: ["42", 100000] },
            direction: "prev",
            limit: 100,
          }),
      );
    const first = performance.now();
    await read();
    const coldRead = performance.now() - first;
    await read();
    const samples: number[] = [];
    for (let i = 0; i < 20; i++) {
      const time = performance.now();
      const rows = await read();
      samples.push(performance.now() - time);
      if (rows.length !== 100)
        throw new Error("Benchmark read was not bounded to 100");
    }
    const earlierSamples: number[] = [];
    for (let i = 0; i < 20; i++) {
      const time = performance.now();
      const rows = await db.read(["items"], (tx) =>
        tx
          .store("items")
          .index("byGroup")
          .scan({
            range: { lower: ["42", 0], upper: ["42", 50042], upperOpen: true },
            direction: "prev",
            limit: 100,
          }),
      );
      if (rows.length !== 100 || rows.some((row) => row.position >= 50042))
        throw new Error("Earlier read violated bounds");
      earlierSamples.push(performance.now() - time);
    }
    let invocations = 0;
    let completedScans = 0;
    const queries = Array.from({ length: 20 }, (_, group) =>
      db.query(["items"], (tx) => {
        invocations++;
        return tx
          .store("items")
          .index("byGroup")
          .scan({
            range: {
              lower: [String(group), 0],
              upper: [String(group), 100000],
            },
            direction: "prev",
            limit: 100,
          })
          .then((rows) => {
            completedScans++;
            return rows;
          });
      }),
    );
    await until(() => queries.every((query) => query.ready()));
    const beforeBurst = invocations;
    const burstStart = performance.now();
    for (let i = 0; i < 100; i++)
      await db.write(["items"], (tx) =>
        tx
          .store("items")
          .put("42", { group: "42", position: 42, body: String(i) }),
      );
    await until(() => queries.every((query) => !query.loading()), 30000);
    const burst = {
      writes: 100,
      openQueries: 20,
      invocations: invocations - beforeBurst,
      elapsedMs: performance.now() - burstStart,
    };
    const beforeQueued = invocations;
    const completedBeforeQueued = completedScans;
    const queuedStart = performance.now();
    await Promise.all(
      Array.from({ length: 100 }, (_, i) =>
        db.write(["items"], (tx) =>
          tx
            .store("items")
            .put("99900", { group: "0", position: 99900, body: String(i) }),
        ),
      ),
    );
    await until(() => queries.every((query) => !query.loading()), 30000);
    if (queries[0]?.()?.[0]?.body !== "99")
      throw new Error("Queued writes did not converge");
    const queuedBurst = {
      writes: 100,
      openQueries: 20,
      invocations: invocations - beforeQueued,
      elapsedMs: performance.now() - queuedStart,
      completedScans: completedScans - completedBeforeQueued,
    };
    for (const query of queries) query.stop();
    samples.sort((a, b) => a - b);
    earlierSamples.sort((a, b) => a - b);
    return {
      rows: 100000,
      groups: 100,
      bodyBytes: 1024,
      coldOpen,
      seededMs,
      coldRead,
      warmP95: samples[18],
      earlierP95: earlierSamples[18],
      burst,
      queuedBurst,
      samples,
    };
  } finally {
    db.close();
    await removeDatabase(name);
  }
}

// Keep the database and outer scope alive while checking disposed query captures.
export async function checkDatabaseRetention(): Promise<number> {
  const name = `loom-db-retention-${crypto.randomUUID()}`;
  const db = await openFixture(name);
  const refs: WeakRef<object>[] = [];
  const owner = scope(() => {
    for (let i = 0; i < 100; i++) {
      const capture = { key: String(i) };
      refs.push(new WeakRef(capture));
      const query = db.query(["labels"], (tx) =>
        tx.store("labels").get(capture.key),
      );
      query.stop();
    }
  });
  try {
    // Drain the admitted requests before asking the collector about closures.
    await db.read(["labels"], (tx) => tx.store("labels").get("drain"));
    for (let i = 0; i < 5; i++) {
      await pause();
      (globalThis as typeof globalThis & { gc: () => void }).gc();
    }
    return refs.filter((ref) => ref.deref() !== undefined).length;
  } finally {
    owner.stop();
    db.close();
    await removeDatabase(name);
  }
}

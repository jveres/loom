// Drive the /db/ demo through its real UI, with real tabs and synthetic data: the source in three
// engines, then a production build under a subpath, as Pages serves it. Bundling can remove code
// that the development server runs, so a build needs its own check.
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium, firefox, webkit } from "playwright";
import { build, createServer, preview } from "vite";

const WAIT = 15000;
const root = resolve(import.meta.dirname, "..");

const configFile = resolve(root, "vite.config.ts");
const server = await createServer({
  root,
  configFile,
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});

const id = (page, testid) => page.getByTestId(testid);
const text = async (page, testid) =>
  (await id(page, testid).textContent()) ?? "";
const number = async (page, testid) => Number(await text(page, testid));
const until = (page, testid, value) =>
  page.waitForFunction(
    ([testid, value]) =>
      document.querySelector(`[data-testid="${testid}"]`)?.textContent ===
      value,
    [testid, value],
    { timeout: WAIT },
  );
const untilIncludes = (page, testid, value) =>
  page.waitForFunction(
    ([testid, value]) =>
      document
        .querySelector(`[data-testid="${testid}"]`)
        ?.textContent?.includes(value),
    [testid, value],
    { timeout: WAIT },
  );
const row = (page, key) =>
  page.locator(`[data-testid="item-row"][data-key="${key}"]`);
const rowUnits = (page, key) =>
  row(page, key).getByTestId("item-units").textContent();
const untilRowUnits = (page, key, units) =>
  page.waitForFunction(
    ([key, units]) =>
      document.querySelector(
        `[data-testid="item-row"][data-key="${key}"] [data-testid="item-units"]`,
      )?.textContent === units,
    [key, String(units)],
    { timeout: WAIT },
  );
const rowKeys = (page) =>
  page
    .locator('[data-testid="item-row"]')
    .evaluateAll((rows) => rows.map((row) => row.dataset.key));
const lowSnapshot = (page) =>
  page
    .locator('[data-testid="low-row"]')
    .evaluateAll((rows) => rows.map((row) => row.textContent));
const journalLines = (page) =>
  page
    .locator('[data-testid="journal-row"]')
    .evaluateAll((rows) => rows.map((row) => row.textContent));

async function ready(page) {
  await until(page, "connection", "open");
  await page
    .locator('[data-testid="item-row"]')
    .first()
    .waitFor({ timeout: WAIT });
  await untilIncludes(page, "inventory-status", "Up to date");
}

async function open(context, url, errors) {
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url);
  await ready(page);
  return page;
}

async function runScenario(page, name) {
  await id(page, `run-${name}`).click();
  await page.waitForFunction(
    (name) => {
      const state = document.querySelector(`[data-testid="outcome-${name}"]`)
        ?.dataset.outcome;
      return state === "passed" || state === "failed";
    },
    name,
    { timeout: WAIT },
  );
  assert.equal(
    await id(page, `outcome-${name}`).getAttribute("data-outcome"),
    "passed",
    `${name}: ${await text(page, `outcome-${name}`)}`,
  );
}

const percentile95 = (samples) =>
  [...samples].sort((a, b) => a - b)[Math.ceil(samples.length * 0.95) - 1];

async function exercise(engineName, context, url) {
  const errors = [];
  const external = [];
  const origin = new URL(url).origin;
  context.on("request", (request) => {
    if (!request.url().startsWith(origin) && !request.url().startsWith("data:"))
      external.push(request.url());
  });
  const a = await open(context, url, errors);
  const steps = [];
  const step = (name) => steps.push(name);

  // Typed rows, explicit keys, and bounded keyset paging.
  assert.equal(await text(a, "cross-tab"), "broadcast");
  const firstPage = await rowKeys(a);
  assert.equal(firstPage.length, 10);
  await id(a, "page-next").click();
  await until(a, "page-number", "Page 2");
  await untilIncludes(a, "inventory-status", "Up to date");
  const secondPage = await rowKeys(a);
  assert.equal(secondPage.length, 10);
  assert.equal(new Set([...firstPage, ...secondPage]).size, 20);
  await id(a, "page-next").click();
  await until(a, "page-number", "Page 3");
  await untilIncludes(a, "inventory-status", "Up to date");
  await a.waitForFunction(
    () => document.querySelector('[data-testid="page-next"]').disabled,
  );
  await id(a, "page-previous").click();
  await id(a, "page-previous").click();
  await until(a, "page-number", "Page 1");
  await untilIncludes(a, "inventory-status", "Up to date");
  assert.deepEqual(await rowKeys(a), firstPage);
  await id(a, "flip-direction").click();
  await untilIncludes(a, "inventory-status", "Up to date");
  await a.waitForFunction(
    (first) =>
      document.querySelector('[data-testid="item-row"]')?.dataset.key !== first,
    firstPage[0],
  );
  const descending = await rowKeys(a);
  await id(a, "page-next").click();
  await until(a, "page-number", "Page 2");
  await a.waitForFunction(
    (first) =>
      document.querySelector('[data-testid="item-row"]')?.dataset.key !== first,
    descending[0],
  );
  await untilIncludes(a, "inventory-status", "Up to date");
  const descendingNext = await rowKeys(a);
  assert.equal(descendingNext.length, 10);
  assert.equal(new Set([...descending, ...descendingNext]).size, 20);
  await id(a, "flip-direction").click();
  await a.waitForFunction(
    (first) =>
      document.querySelector('[data-testid="item-row"]')?.dataset.key === first,
    firstPage[0],
  );
  step("keyset paging in both directions");

  // Query parameter change.
  await id(a, "bin-bin-b").click();
  await a.waitForFunction(
    (first) =>
      document.querySelector('[data-testid="item-row"]')?.dataset.key !== first,
    firstPage[0],
  );
  await untilIncludes(a, "inventory-status", "Up to date");
  await id(a, "bin-bin-a").click();
  await a.waitForFunction(
    (first) =>
      document.querySelector('[data-testid="item-row"]')?.dataset.key === first,
    firstPage[0],
  );
  step("query parameter change");

  // Persistence across a reload.
  const [key, neighbor] = firstPage;
  const before = Number(await rowUnits(a, key));
  await row(a, key).getByTestId("add-one").click();
  await untilRowUnits(a, key, before + 1);
  await a.reload();
  await ready(a);
  assert.equal(Number(await rowUnits(a, key)), before + 1);
  step("persistence across reload");

  // Two active tabs, in both directions, with no focus change or refresh.
  const b = await open(context, url, errors);
  await row(a, key).getByTestId("add-one").click();
  await untilRowUnits(b, key, before + 2);
  await row(b, key).getByTestId("add-one").click();
  await untilRowUnits(a, key, before + 3);
  step("two-tab updates in both directions");

  // A query reruns only for its own stores.
  await untilIncludes(a, "inventory-status", "Up to date");
  const binReads = await number(a, "reads-bins");
  const journalReads = await number(a, "reads-journal");
  await row(a, key).getByTestId("add-one").click();
  await untilRowUnits(a, key, before + 4);
  await a.waitForFunction(
    (count) =>
      Number(
        document.querySelector('[data-testid="reads-journal"]').textContent,
      ) > count,
    journalReads,
  );
  assert.equal(await number(a, "reads-bins"), binReads);
  step("store-level invalidation");

  // Atomic transfer, seen by the other tab, and a natural rollback.
  const sum = async (page) =>
    Number(await rowUnits(page, key)) + Number(await rowUnits(page, neighbor));
  const total = await sum(a);
  await row(a, key).getByTestId("move-five").click();
  await untilIncludes(a, "notice", "Moved 5 units");
  await a.waitForFunction(
    ([key, units]) =>
      document.querySelector(
        `[data-testid="item-row"][data-key="${key}"] [data-testid="item-units"]`,
      )?.textContent === units,
    [key, String(before + 4 - 5)],
  );
  await untilRowUnits(b, key, before + 4 - 5);
  assert.equal(await sum(a), total);
  assert.equal(await sum(b), total);
  assert.match((await journalLines(b))[0], /moved 5 units/);
  for (let i = 0; i < 12; i++) {
    await row(a, key).getByTestId("move-five").click();
    await a.waitForTimeout(30);
    if ((await text(a, "notice")).includes("nothing was saved")) break;
  }
  await untilIncludes(a, "notice", "nothing was saved");
  await untilIncludes(a, "inventory-status", "Up to date");
  assert.equal(await sum(a), total);
  step("atomic transfer and rollback");

  // Failure scenarios read storage back themselves.
  for (const name of [
    "failed-transfer",
    "caught-constraint",
    "premature-commit",
    "failed-upgrade",
  ])
    await runScenario(a, name);
  await id(a, "run-blocked-upgrade").click();
  await a.waitForFunction(
    () =>
      !document.querySelector('[data-testid="release-blocked-upgrade"]')
        .disabled,
    undefined,
    { timeout: WAIT },
  );
  await untilIncludes(a, "outcome-blocked-upgrade", "Blocked");
  await id(a, "release-blocked-upgrade").click();
  await a.waitForFunction(
    () =>
      document.querySelector('[data-testid="outcome-blocked-upgrade"]').dataset
        .outcome === "passed",
    undefined,
    { timeout: WAIT },
  );
  await id(a, "run-blocked-upgrade").click();
  await a.waitForFunction(
    () =>
      !document.querySelector('[data-testid="cancel-blocked-upgrade"]')
        .disabled,
    undefined,
    { timeout: WAIT },
  );
  await id(a, "cancel-blocked-upgrade").click();
  await untilIncludes(a, "outcome-blocked-upgrade", "cancelled");
  step("failure and upgrade scenarios");

  // A failing read retains the last good rows, on refresh and on a parameter change.
  await untilIncludes(a, "inventory-status", "Up to date");
  const shown = await rowKeys(a);
  await id(a, "fail-reads").check();
  await untilIncludes(a, "inventory-status", "Refresh failed");
  assert.deepEqual(await rowKeys(a), shown);
  await id(a, "bin-bin-c").click();
  await untilIncludes(a, "inventory-status", "Could not read");
  assert.deepEqual(await rowKeys(a), shown);
  assert.equal(
    await a
      .locator(".table-frame")
      .evaluate((node) => node.classList.contains("stale") && node.inert),
    true,
  );
  await id(a, "fail-reads").uncheck();
  await untilIncludes(a, "inventory-status", "Up to date");
  assert.notDeepEqual(await rowKeys(a), shown);
  await id(a, "bin-bin-a").click();
  await a.waitForFunction(
    (first) =>
      document.querySelector('[data-testid="item-row"]')?.dataset.key === first,
    firstPage[0],
  );
  await untilIncludes(a, "inventory-status", "Up to date");
  step("failed reads keep valid rows");

  // Scope pause, resume, and disposal.
  const liveReads = () =>
    text(a, "low-status").then((status) => status.match(/\d+/)?.[0]);
  await a.waitForFunction(
    () => document.querySelectorAll('[data-testid="low-row"]').length === 5,
  );
  await id(a, "low-pause").click();
  await until(a, "low-mode", "paused");
  const paused = await lowSnapshot(a);
  const journalBefore = (await journalLines(a))[0];
  await a.locator('[data-testid="low-add"]').first().click();
  await a.waitForFunction(
    (line) =>
      document.querySelector('[data-testid="journal-row"]')?.textContent !==
      line,
    journalBefore,
  );
  await a.waitForTimeout(100);
  assert.deepEqual(
    await lowSnapshot(a),
    paused,
    "A paused scope must not reread",
  );
  await id(a, "low-pause").click();
  await until(a, "low-mode", "live");
  await a.waitForFunction(
    (paused) =>
      JSON.stringify(
        [...document.querySelectorAll('[data-testid="low-row"]')].map(
          (row) => row.textContent,
        ),
      ) !== paused,
    JSON.stringify(paused),
  );
  await id(a, "low-dispose").click();
  await until(a, "low-mode", "disposed");
  const disposed = await lowSnapshot(a);
  await a.locator('[data-testid="low-add"]').first().click();
  await a.waitForTimeout(150);
  assert.deepEqual(
    await lowSnapshot(a),
    disposed,
    "A disposed query must stop",
  );
  await id(a, "low-dispose").click();
  await until(a, "low-mode", "live");
  await a.waitForFunction(
    (disposed) =>
      JSON.stringify(
        [...document.querySelectorAll('[data-testid="low-row"]')].map(
          (row) => row.textContent,
        ),
      ) !== disposed,
    JSON.stringify(disposed),
  );
  assert.ok(await liveReads());
  step("scope pause, resume, and disposal");

  // Manual mode: no delivery in either direction until an explicit refresh.
  const manual = await open(context, `${url}?transport=manual`, errors);
  assert.equal(await text(manual, "cross-tab"), "manual");
  await untilIncludes(a, "inventory-status", "Up to date");
  const units = Number(await rowUnits(a, neighbor));
  await untilRowUnits(manual, neighbor, units);
  await row(a, neighbor).getByTestId("add-one").click();
  await untilRowUnits(b, neighbor, units + 1);
  await manual.waitForTimeout(250);
  assert.equal(Number(await rowUnits(manual, neighbor)), units);
  await id(manual, "refresh-all").click();
  await untilRowUnits(manual, neighbor, units + 1);
  await row(manual, neighbor).getByTestId("add-one").click();
  await untilRowUnits(manual, neighbor, units + 2);
  await b.waitForTimeout(250);
  assert.equal(Number(await rowUnits(b, neighbor)), units + 1);
  await id(b, "refresh-all").click();
  await untilRowUnits(b, neighbor, units + 2);
  await id(a, "refresh-query").click();
  await untilRowUnits(a, neighbor, units + 2);
  await manual.close();
  step("manual mode and explicit refresh");

  // Close keeps records and rows; admitted writes still reach other tabs.
  await id(a, "close-or-reopen").click();
  await until(a, "connection", "closed");
  assert.equal((await rowKeys(a)).length, 10);
  assert.equal(await row(a, key).getByTestId("add-one").isDisabled(), true);
  await untilIncludes(a, "inventory-status", "Not connected");
  await id(a, "close-or-reopen").click();
  await ready(a);
  await runScenario(a, "close-during-write");
  await until(a, "connection", "closed");
  await untilIncludes(b, "journal-rows", "saved after close()");
  await id(a, "close-or-reopen").click();
  await ready(a);
  step("close and reopen");

  // Data-only reset reaches the other tab, which stays connected.
  await id(a, "restore-data").click();
  await untilIncludes(a, "notice", "Restored the sample data");
  await b.waitForFunction(
    () => document.querySelectorAll('[data-testid="journal-row"]').length === 1,
    undefined,
    { timeout: WAIT },
  );
  assert.equal(await text(b, "connection"), "open");
  step("data-only reset across tabs");

  // Deleting the database closes the other tab's connection; reopening is explicit.
  await id(a, "delete-database").click();
  await until(b, "connection", "versionchange");
  await ready(a);
  assert.equal((await rowKeys(b)).length, 10, "The closed tab keeps its rows");
  await id(b, "close-or-reopen").click();
  await ready(b);
  await row(a, firstPage[1]).getByTestId("add-one").click();
  await untilIncludes(b, "journal-rows", "+1");
  step("database deletion and explicit reopen");

  // Performance on a bigger store: bounded reads, and two-tab round trips.
  await id(a, "add-thousand").click();
  await untilIncludes(a, "notice", "Committed 1,000 rows");
  const bulkMs = Number((await text(a, "notice")).match(/in (\d+) ms/)?.[1]);
  for (let i = 0; i < 9; i++) {
    const newest = (await journalLines(a))[0];
    await id(a, "add-thousand").click();
    await a.waitForFunction(
      (line) =>
        document.querySelector('[data-testid="journal-row"]')?.textContent !==
        line,
      newest,
      { timeout: WAIT },
    );
  }
  const readSamples = [];
  for (let i = 0; i < 20; i++) {
    const count = await number(a, "reads-inventory");
    await id(a, "refresh-query").click();
    await a.waitForFunction(
      (count) =>
        Number(
          document.querySelector('[data-testid="reads-inventory"]').textContent,
        ) > count,
      count,
    );
    await untilIncludes(a, "inventory-status", "Up to date");
    readSamples.push(
      Number((await text(a, "inventory-status")).match(/in ([\d.]+) ms/)?.[1]),
    );
  }
  const roundTrips = [];
  for (let i = 0; i < 20; i++) {
    const current = Number(await rowUnits(b, firstPage[1]));
    const start = performance.now();
    await row(a, firstPage[1]).getByTestId("add-one").click();
    await untilRowUnits(b, firstPage[1], current + 1);
    roundTrips.push(performance.now() - start);
  }
  step("performance on 10,120 rows");
  await b.close();

  // Narrow screens must not scroll sideways.
  await a.setViewportSize({ width: 360, height: 780 });
  assert.equal(
    await a.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
    true,
    "The page scrolls sideways at 360 pixels",
  );
  step("no sideways scrolling at 360 pixels");
  await a.close();

  assert.deepEqual(errors, [], `${engineName}: unhandled page errors`);
  assert.deepEqual(external, [], `${engineName}: external requests`);
  return {
    steps,
    bulkFirst1000Ms: bulkMs,
    read11RowsP95Ms: percentile95(readSamples),
    twoTabRoundTripP95Ms: Number(percentile95(roundTrips).toFixed(1)),
  };
}

async function concurrentScenarios(context, url) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  try {
    await page.goto(url);
    const result = await page.evaluate(async () => {
      const { openStockroom } = await import("/demo/db/database.ts");
      const { prematureCommit, closeDuringWrite } = await import(
        "/demo/db/scenarios.ts"
      );
      const reader = await openStockroom("race-reader");
      const handles = await Promise.all(
        Array.from({ length: 12 }, (_, i) => openStockroom(`race-${i}`)),
      );
      const snapshot = () =>
        reader.read(["journal"], (tx) =>
          tx.store("journal").entries({ limit: 10000 }),
        );
      try {
        const before = await snapshot();
        await Promise.all(
          handles.map((db, i) =>
            i % 2 === 0
              ? prematureCommit(db, `race-${i}`)
              : closeDuringWrite(db, `race-${i}`),
          ),
        );
        // The deliberately late callback must not create another journal line.
        await new Promise((resolve) => setTimeout(resolve, 100));
        const after = await snapshot();
        return {
          preserved: before.every((entry) =>
            after.some(
              (next) => next.key === entry.key && next.value === entry.value,
            ),
          ),
          appended: after.length - before.length,
          markers: handles.map(
            (_, i) =>
              after.filter((entry) => entry.value.startsWith(`race-${i}:`))
                .length,
          ),
        };
      } finally {
        for (const db of handles) db.close();
        reader.close();
      }
    });
    assert.deepEqual(
      result,
      { preserved: true, appended: 12, markers: Array(12).fill(1) },
      "Concurrent scenarios must append distinct journal entries without overwriting prior data",
    );
    assert.deepEqual(
      errors,
      [],
      "Concurrent scenarios leaked a late rejection",
    );
  } finally {
    await page.close();
  }
}

async function runEngine(label, engineName, engine, url) {
  const browser = await engine.launch({ headless: true });
  const context = await browser.newContext();
  try {
    if (label === "source") {
      const regressionContext = await browser.newContext();
      try {
        await concurrentScenarios(regressionContext, url);
      } finally {
        await regressionContext.close();
      }
      console.log(
        `${engineName}: concurrent scenario journal regression passed`,
      );
    }
    const result = await exercise(engineName, context, url);
    console.log(
      `${label} ${engineName} ${browser.version()}: ${result.steps.length} demo workflows passed`,
    );
    for (const name of result.steps) console.log(`  ${name}`);
    const { steps: _steps, ...measurements } = result;
    console.log(`  ${JSON.stringify(measurements)}`);
    assert(
      result.read11RowsP95Ms <= 50,
      `${engineName} read exceeds the proposed 50 ms budget`,
    );
    assert(
      result.twoTabRoundTripP95Ms <= 250,
      `${engineName} round trip exceeds the proposed 250 ms budget`,
    );
  } finally {
    await context.close();
    await browser.close();
  }
}

const outDir = await mkdtemp(join(tmpdir(), "loom-db-demo-"));
let built;
try {
  await server.listen();
  const url = new URL("db/", server.resolvedUrls.local[0]).href;
  for (const [engineName, engine] of Object.entries({
    chromium,
    firefox,
    webkit,
  }))
    await runEngine("source", engineName, engine, url);

  const base = "/loom/";
  await build({
    root,
    configFile,
    base,
    logLevel: "error",
    build: { outDir, emptyOutDir: true },
  });
  built = await preview({
    root,
    configFile,
    base,
    logLevel: "error",
    build: { outDir },
    preview: { host: "127.0.0.1", port: 0 },
  });
  await runEngine(
    "build",
    "chromium",
    chromium,
    new URL("db/", built.resolvedUrls.local[0]).href,
  );
  console.log(
    "Database demo passed in 3 engines and in a production build. Synthetic data only; native Safari and physical iOS remain manual checks.",
  );
} finally {
  await built?.close();
  await server.close();
  await rm(outDir, { recursive: true, force: true });
}

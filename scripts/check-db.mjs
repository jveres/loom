import assert from "node:assert/strict";
import { resolve } from "node:path";
import { chromium, firefox, webkit } from "playwright";
import { createServer } from "vite";

const root = resolve(import.meta.dirname, "..");
const server = await createServer({
  root,
  configFile: resolve(root, "vite.config.ts"),
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});
const results = [];
try {
  await server.listen();
  const url = new URL("bench/", server.resolvedUrls.local[0]).href;
  for (const [engineName, engine] of Object.entries({
    chromium,
    firefox,
    webkit,
  })) {
    const browser = await engine.launch({
      headless: true,
      ...(engineName === "chromium"
        ? { args: ["--js-flags=--expose-gc"] }
        : {}),
    });
    const context = await browser.newContext();
    const errors = [];
    try {
      const [writer, reader] = await Promise.all([
        context.newPage(),
        context.newPage(),
      ]);
      for (const page of [writer, reader]) {
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(url);
      }
      const checks = await writer.evaluate(async () =>
        (await import("/bench/db-browser-checks.ts")).runDatabaseChecks(),
      );
      console.log(
        `${engineName} ${browser.version()}: ${checks.length} IndexedDB checks passed`,
      );
      if (engineName === "chromium") {
        assert.equal(
          await writer.evaluate(async () =>
            (
              await import("/bench/db-browser-checks.ts")
            ).checkDatabaseRetention(),
          ),
          0,
          "Stopped queries must release captured application objects in a live scope",
        );
        console.log(
          "chromium: 100 stopped query captures collected with scope and database alive",
        );
      }
      const name = `loom-db-tabs-${engineName}-${Date.now()}`;
      for (const page of [writer, reader])
        await page.evaluate(
          async (name) =>
            (await import("/bench/db-browser-checks.ts")).openTab(name),
          name,
        );
      const samples = [];
      for (let i = 0; i < 20; i++) {
        const value = `committed-${i}`;
        const start = performance.now();
        await writer.evaluate(
          async (value) =>
            (await import("/bench/db-browser-checks.ts")).writeTab(value),
          value,
        );
        await reader.waitForFunction(
          async (value) =>
            (await import("/bench/db-browser-checks.ts")).tabState().value ===
            value,
          value,
        );
        samples.push(performance.now() - start);
      }
      await writer.evaluate(async () =>
        (await import("/bench/db-browser-checks.ts")).writeTab(
          "close-commit",
          true,
        ),
      );
      await reader.waitForFunction(
        async () =>
          (await import("/bench/db-browser-checks.ts")).tabState().value ===
          "close-commit",
      );
      assert.equal(
        await writer.evaluate(
          async () =>
            (await import("/bench/db-browser-checks.ts")).tabState().connection,
        ),
        "closed",
      );
      for (const page of [writer, reader])
        await page.evaluate(async () =>
          (await import("/bench/db-browser-checks.ts")).closeTab(),
        );
      await reader.evaluate(
        (name) =>
          new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(name);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
            request.onblocked = () =>
              reject(new Error("Tab connection leaked"));
          }),
        name,
      );
      samples.sort((a, b) => a - b);
      console.log(
        `${engineName}: two active tabs, 100-row batches, and close-before-commit passed; full round-trip p95 ${samples[18].toFixed(1)} ms`,
      );
      const measurements = await writer.evaluate(async () =>
        (await import("/bench/db-browser-checks.ts")).measureDatabase(),
      );
      assert.deepEqual(errors, [], `${engineName} unhandled browser errors`);
      const result = {
        engine: engineName,
        version: browser.version(),
        checks: checks.length,
        crossTabRoundTripP95: samples[18],
        ...measurements,
      };
      results.push(result);
      console.log(JSON.stringify(result));
      assert(
        measurements.earlierP95 <= 50,
        `${engineName} earlier read exceeds proposed 50ms budget`,
      );
      assert(
        measurements.warmP95 <= 50,
        `${engineName} warm read exceeds proposed 50ms budget`,
      );
      assert(
        samples[18] <= 250,
        `${engineName} two-tab round-trip exceeds proposed 250ms budget`,
      );
    } finally {
      await context.close();
      await browser.close();
    }
  }
  console.log(
    `Database qualification passed in ${results.length} engines. Synthetic data only; physical iOS remains a manual check.`,
  );
} finally {
  await server.close();
}

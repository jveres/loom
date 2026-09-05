// Cross-engine lifecycle qualification against the source entrypoints.
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createServer } from "vite";

const { chromium, firefox, webkit } = await import(
  process.env.LOOM_PLAYWRIGHT_MODULE ?? "playwright"
);
const root = resolve(import.meta.dirname, "..");
const server = await createServer({
  root,
  configFile: resolve(root, "vite.config.ts"),
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});
try {
  await server.listen();
  const url = server.resolvedUrls.local[0];
  for (const [name, engine] of Object.entries({ chromium, firefox, webkit })) {
    const browser = await engine.launch({
      headless: true,
      ...(name === "chromium" ? { args: ["--js-flags=--expose-gc"] } : {}),
    });
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(new URL("bench/", url).href);
      const atomicMoves = await page.evaluate(
        () => typeof Element.prototype.moveBefore === "function",
      );
      const checks = await page.evaluate(async () => {
        const { runBrowserChecks } = await import(
          "/bench/dom-browser-checks.ts"
        );
        return Promise.race([
          runBrowserChecks(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error("Browser checks timed out")),
              20000,
            ),
          ),
        ]);
      });
      await page.evaluate(() => {
        const button = document.createElement("button");
        button.id = "loom-release-popup";
        button.textContent = "Open test popup";
        button.onclick = () => {
          window.__loomReleasePopup = window.open("about:blank");
        };
        document.body.append(button);
      });
      const [popup] = await Promise.all([
        page.waitForEvent("popup"),
        page.click("#loom-release-popup"),
      ]);
      const popupChecks = await page.evaluate(async () => {
        const view = window.__loomReleasePopup;
        if (!view) throw new Error("Popup is missing");
        const [{ observeSize }, { afterFrames }, { listen }, { remove }] =
          await Promise.all([
            import("/src/browser.ts"),
            import("/src/schedule.ts"),
            import("/src/events.ts"),
            import("/src/dom/index.ts"),
          ]);
        const node = view.document.createElement("div");
        node.style.cssText = "height:20px;width:20px";
        view.document.body.append(node);
        let sizes = 0;
        let events = 0;
        observeSize(node, () => {
          sizes++;
        });
        listen(
          view,
          "resize",
          () => {
            events++;
          },
          { owner: node },
        );
        await new Promise((resolve) =>
          afterFrames(3, resolve, { window: view }),
        );
        if (sizes === 0) throw new Error("Popup observer did not deliver");
        view.dispatchEvent(new view.Event("resize"));
        const delivered = events;
        if (delivered === 0) throw new Error("Popup listener did not deliver");
        remove(node);
        view.dispatchEvent(new view.Event("resize"));
        if (events !== delivered)
          throw new Error("Popup listener survived disposal");
        return [
          "popup: observer and frame context",
          "popup: foreign-target listener ownership",
        ];
      });
      await popup.close();
      if (name === "chromium") {
        const retained = await page.evaluate(async () => {
          const { measureRetention } = await import(
            "/bench/dom-performance.ts"
          );
          return [await measureRetention(false), await measureRetention(true)];
        });
        assert(
          retained.every((result) => result.retainedWhileGroupLive === 0),
          "Removed nodes remain retained",
        );
      }
      assert.deepEqual(errors, [], `${name} browser errors`);
      console.log(
        `${name} ${browser.version()} (atomic moves: ${atomicMoves}): ${checks.length + popupChecks.length} browser checks passed${name === "chromium" ? ", both GC retention scenarios passed" : ""}.`,
      );
    } finally {
      await browser.close();
    }
  }
} finally {
  await server.close();
}

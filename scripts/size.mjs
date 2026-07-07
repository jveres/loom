// Bundle-size gates: build three reference apps with esbuild
// and fail if their gzipped size exceeds the budget. Run with `pnpm size`; budgets move only with
// a documented reason in the commit message.
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";

// Resolve the esbuild instance vite ships with — no separate install (pnpm's build-script
// approval would otherwise block a direct esbuild dependency for a dev-only script).
const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve("vite/package.json"));
const { buildSync } = viteRequire("esbuild");

const root = new URL("..", import.meta.url).pathname;

// App source → gzip budget in bytes. The minimal app is the headline number: the cost of
// state/computed/effect alone (engine + signals + channel gates + deferred lane; no meter ring
// writer, no inspect machinery — those load with loom/observe).
const APPS = [
  {
    name: "minimal (state+computed+effect)",
    budget: 3300,
    source: `
      import { computed, effect, state } from "loom";
      const a = state(1);
      const b = computed(() => a() * 2);
      effect(() => console.log(b()));
      a(2);
    `,
  },
  {
    name: "full core (export * from loom)",
    budget: 5500,
    source: `export * from "loom";`,
  },
  {
    // Gates the README claim that loom/async adds ~0.3 kB gzip over the minimal core.
    name: "minimal + async (resource)",
    budget: 3500,
    source: `
      import { effect } from "loom";
      import { resource } from "loom/async";
      const r = resource(async (_prev, signal) => (await fetch("/x", { signal })).json());
      effect(() => console.log(r(), r.loading(), r.error()));
    `,
  },
  {
    name: "minimal dom (h+text)",
    budget: 5100,
    source: `
      import { state } from "loom";
      import { h, text } from "loom/dom";
      const n = state("x");
      document.body.append(h("div", null, text(n)));
    `,
  },
];

const dir = mkdtempSync(join(tmpdir(), "loom-size-"));
let failed = false;
try {
  for (const app of APPS) {
    const entry = join(dir, "app.ts");
    writeFileSync(entry, app.source);
    const out = buildSync({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      format: "esm",
      write: false,
      // Mirrors loom.aliases.ts (TypeScript — not importable from this Node script without a
      // loader); keep in sync when an entrypoint file moves.
      alias: {
        "loom/async": join(root, "src/async/index.ts"),
        "loom/defer": join(root, "src/core/defer.ts"),
        "loom/dom": join(root, "src/dom/index.ts"),
        loom: join(root, "src/index.ts"),
      },
    });
    const gz = gzipSync(out.outputFiles[0].contents, { level: 9 }).length;
    const ok = gz <= app.budget;
    failed ||= !ok;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${app.name}: ${gz} B gzip (budget ${app.budget})`,
    );
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);

// Bundle-size gates: build reference apps with esbuild
// and fail if their gzipped size exceeds the budget. Run with `pnpm size`; budgets move only with
// a documented reason in the commit message.
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

// Resolve the esbuild instance vite ships with — no separate install (pnpm's build-script
// approval would otherwise block a direct esbuild dependency for a dev-only script).
const require = createRequire(import.meta.url);
const viteRequire = createRequire(require.resolve("vite/package.json"));
const { buildSync } = viteRequire("esbuild");

const root = fileURLToPath(new URL("..", import.meta.url));

// App source → gzip budget in bytes. The minimal app is the headline number: the cost of
// state/computed/effect alone (engine + signals + channel gates + deferred lane; no meter ring
// writer, no inspect machinery — those load with loom/observe).
const APPS = [
  {
    name: "minimal (state+computed+effect)",
    budget: 3500,
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
    // Includes cached scope-pause state and terminal self-stop/error invariants on the effect path.
    budget: 6000,
    source: `export * from "loom";`,
  },
  {
    // Gates the loom/defer lane: its bare import must survive bundling (sideEffects lists it) and
    // stay small. A result at ~the minimal number means the import was stripped — the lane never
    // installs and { defer: true } throws in production; the same-app delta catches that regression.
    name: "minimal + defer lane",
    // Includes deadline-heap continuations, parent-before-child ordering, and inline-scheduler
    // propagation guards. These are correctness paths in the opt-in lane, not baseline core cost.
    budget: 4350,
    minDelta: 150,
    baselineSource: `
      import { effect, state } from "loom";
      const a = state(1);
      effect(() => console.log(a()), { defer: true });
      a(2);
    `,
    source: `
      import "loom/defer";
      import { effect, state } from "loom";
      const a = state(1);
      effect(() => console.log(a()), { defer: true });
      a(2);
    `,
  },
  {
    // Like the deferred lane, observation installs its core hooks at module evaluation. A bare
    // import must therefore survive production tree-shaking even when none of its exports are read.
    name: "minimal + observe hooks",
    budget: 3600,
    minDelta: 300,
    baselineSource: `
      import { configure, state } from "loom";
      configure({ inspect: true });
      state(1);
    `,
    source: `
      import "loom/observe";
      import { configure, state } from "loom";
      configure({ inspect: true });
      state(1);
    `,
  },
  {
    // Gates the README claim that loom/async adds ~0.3 kB gzip over the minimal core.
    name: "minimal + async (resource)",
    budget: 3700,
    source: `
      import { effect } from "loom";
      import { resource } from "loom/async";
      const r = resource(async (_prev, signal) => (await fetch("/x", { signal })).json());
      effect(() => console.log(r(), r.loading(), r.error()));
    `,
  },
  {
    // Quiet-period observation is opt-in: apps that do not import loom/settle keep timer and
    // settlement-control code out of the default reactive bundle.
    name: "minimal + settle",
    budget: 4000,
    source: `
      import { state } from "loom";
      import { settle } from "loom/settle";
      const query = state("");
      settle(query, (value) => console.log(value), 200);
      query("loom");
    `,
  },
  {
    name: "minimal dom (h+text)",
    // Includes allocation-free default binding metadata and node-local ownership for large mounts.
    budget: 6000,
    source: `
      import { state } from "loom";
      import { h, text } from "loom/dom";
      const n = state("x");
      document.body.append(h("div", null, text(n)));
    `,
  },
  {
    // This subpath is intentionally standalone. A regression that imports the reactive core via
    // DOM ownership would add several kilobytes and fail this transitive bundle gate.
    name: "standalone virtual list",
    budget: 2100,
    source: `
      import { virtualList } from "loom/dom/virtual-list";
      const view = virtualList({
        rowHeight: 20,
        key: (item) => item,
        render: (item, reuse) => {
          const row = reuse ?? document.createElement("div");
          row.textContent = String(item);
          return row;
        },
      });
      document.body.append(view.el);
      view.setItems([1, 2, 3]);
    `,
  },
];

const dir = mkdtempSync(join(tmpdir(), "loom-size-"));
let failed = false;
try {
  // Resolve through the package's real exports/sideEffects metadata, not source aliases. This is
  // what downstream bundlers see and makes the bare observe/defer import checks meaningful.
  const modules = join(dir, "node_modules");
  mkdirSync(modules);
  symlinkSync(root, join(modules, "loom"), "dir");
  const bundleSize = (source) => {
    const entry = join(dir, "app.ts");
    writeFileSync(entry, source);
    const out = buildSync({
      entryPoints: [entry],
      bundle: true,
      minify: true,
      format: "esm",
      write: false,
    });
    return gzipSync(out.outputFiles[0].contents, { level: 9 }).length;
  };
  for (const app of APPS) {
    const gz = bundleSize(app.source);
    const baseline = app.baselineSource
      ? bundleSize(app.baselineSource)
      : undefined;
    const delta = baseline === undefined ? undefined : gz - baseline;
    const ok =
      gz <= app.budget && (!app.minDelta || (delta ?? 0) >= app.minDelta);
    failed ||= !ok;
    const deltaText =
      delta === undefined ? "" : `, +${delta} B side-effect delta`;
    console.log(
      `${ok ? "ok  " : "FAIL"} ${app.name}: ${gz} B gzip (budget ${app.budget}${deltaText})`,
    );
  }
} finally {
  rmSync(dir, { recursive: true, force: true });
}
process.exit(failed ? 1 : 0);

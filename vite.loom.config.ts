import { resolve } from "node:path";
import { defineConfig } from "vite";
import { loomAliases } from "./loom.aliases.js";

const root = import.meta.dirname;

export default defineConfig({
  resolve: { alias: loomAliases },
  build: {
    copyPublicDir: false,
    emptyOutDir: true,
    lib: {
      entry: {
        loom: resolve(root, "src/index.ts"),
        observe: resolve(root, "src/observe.ts"),
        dom: resolve(root, "src/dom/index.ts"),
        "dom/virtual-list": resolve(root, "src/dom/virtual-list.ts"),
        devtools: resolve(root, "src/devtools/index.ts"),
        "jsx-runtime": resolve(root, "src/dom/jsx-runtime.ts"),
        html: resolve(root, "src/html/index.ts"),
        "html/jsx-runtime": resolve(root, "src/html/jsx-runtime.ts"),
      },
      // ./jsx-dev-runtime and ./html/jsx-dev-runtime intentionally reuse the prod
      // runtime bundles (see package.json exports) — Loom has no dev-only JSX behaviour.
      formats: ["es"],
    },
    outDir: "dist/loom",
    rolldownOptions: {
      external: ["alien-signals/system"],
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});

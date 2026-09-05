import { resolve } from "node:path";
import { defineConfig } from "vite";
import { loomAliases } from "./loom.aliases.js";
import { loomEntries } from "./loom.entries.js";

const root = import.meta.dirname;

export default defineConfig({
  resolve: { alias: loomAliases },
  build: {
    copyPublicDir: false,
    emptyOutDir: true,
    lib: {
      entry: Object.fromEntries(
        Object.entries(loomEntries).map(([name, path]) => [
          name,
          resolve(root, path),
        ]),
      ),
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

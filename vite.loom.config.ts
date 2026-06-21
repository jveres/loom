import { resolve } from "node:path";
import { defineConfig } from "vite";

const root = import.meta.dirname;

export default defineConfig({
  build: {
    copyPublicDir: false,
    emptyOutDir: true,
    lib: {
      entry: {
        loom: resolve(root, "src/loom.ts"),
        dom: resolve(root, "src/dom/index.ts"),
        "dom/vlist": resolve(root, "src/dom/vlist.ts"),
        "jsx-runtime": resolve(root, "src/jsx-runtime.ts"),
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

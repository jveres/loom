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
        dom: resolve(root, "src/dom.ts"),
        "jsx-runtime": resolve(root, "src/jsx-runtime.ts"),
        "jsx-dev-runtime": resolve(root, "src/jsx-dev-runtime.ts"),
        html: resolve(root, "src/html.ts"),
        "html-jsx-runtime": resolve(root, "src/html-jsx-runtime.ts"),
        "html-jsx-dev-runtime": resolve(root, "src/html-jsx-dev-runtime.ts"),
      },
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

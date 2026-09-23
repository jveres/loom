import { resolve } from "node:path";
import { defineConfig } from "vite";
import { loomAliases } from "./loom.aliases.js";

const root = import.meta.dirname;

export default defineConfig({
  resolve: { alias: loomAliases },
  // build:demo ships both pages: the realtime demo at / and the live Wikipedia demo at /live/.
  build: {
    rolldownOptions: {
      input: {
        main: resolve(root, "index.html"),
        live: resolve(root, "live/index.html"),
      },
    },
  },
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "loom",
    },
  },
});

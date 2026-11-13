import { resolve } from "node:path";
import { defineConfig } from "vite";
import { loomAliases } from "./loom.aliases.js";

const root = import.meta.dirname;

export default defineConfig({
  resolve: { alias: loomAliases },
  // build:demo ships the Loom Observatory demo at /, the live Wikipedia demo at /live/, and the
  // database demo at /db/.
  build: {
    rolldownOptions: {
      input: {
        main: resolve(root, "index.html"),
        live: resolve(root, "live/index.html"),
        db: resolve(root, "db/index.html"),
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

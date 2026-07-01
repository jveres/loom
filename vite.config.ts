import { defineConfig } from "vite";
import { loomAliases } from "./loom.aliases.js";

export default defineConfig({
  resolve: { alias: loomAliases },
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "loom",
    },
  },
});

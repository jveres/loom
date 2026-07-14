import { resolve } from "node:path";
import { defineConfig } from "vite";
import { loomAliases } from "./loom.aliases.js";

// The playground is a second dev app beside the demo: an editor + live view
// over every sample in playground/samples. `pnpm run playground` serves it.
export default defineConfig({
  root: resolve(import.meta.dirname, "playground"),
  publicDir: resolve(import.meta.dirname, "assets"),
  resolve: { alias: loomAliases },
  server: { port: 5197 },
  oxc: {
    jsx: {
      runtime: "automatic",
      importSource: "loom",
    },
  },
});

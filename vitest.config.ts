import { defineConfig } from "vitest/config";
import { loomAliases } from "./loom.aliases.js";

export default defineConfig({
  resolve: { alias: loomAliases },
  test: {
    clearMocks: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    mockReset: true,
    restoreMocks: true,
  },
});

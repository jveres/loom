import { defineConfig } from "vitest/config";
import { loomAliases } from "./loom.aliases.js";

export default defineConfig({
  resolve: { alias: loomAliases },
  test: {
    // Existing cross-realm tests use only local about:blank iframe documents.
    environmentOptions: {
      happyDOM: { settings: { enableIframePageLoading: true } },
    },
    clearMocks: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    mockReset: true,
    restoreMocks: true,
  },
});

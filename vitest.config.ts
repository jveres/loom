import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    include: ["src/**/*.test.ts"],
    mockReset: true,
    restoreMocks: true,
  },
});

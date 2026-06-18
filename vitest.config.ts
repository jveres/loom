import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    clearMocks: true,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    mockReset: true,
    restoreMocks: true,
  },
});

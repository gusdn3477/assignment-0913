import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    // DOM-heavy 1,000-card navigation and real drag sensors share finite CPU.
    // Keep their deadlines meaningful by avoiding competing JSDOM workers.
    maxWorkers: 1,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      ".worktrees/**",
      ".next/**",
      ".pnpm-store/**",
    ],
  },
});

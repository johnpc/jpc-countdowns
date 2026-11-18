import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
      "../amplify_outputs.json": path.resolve(
        __dirname,
        "src/test-amplify-outputs.json",
      ),
    },
  },
  test: {
    environment: "jsdom",
    // Node 26 ships Web Storage on by default and defines globalThis.localStorage
    // as an OWN property whose value is undefined (no --localstorage-file).
    // Vitest's jsdom environment won't overwrite an existing global, so tests
    // would see localStorage === undefined. Turning Node's webstorage off in
    // the test workers removes the property and jsdom's storage comes through.
    // Lives here (not a CI env var) so local runs and CI behave the same.
    execArgv: ["--no-experimental-webstorage"],
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["e2e/**", "node_modules/**"],
    coverage: {
      provider: "istanbul",
      reporter: ["text", "json", "html"],
      // Source code only. With "src/**", CSS/SVG/JSON files were reported as
      // untested files; istanbul cannot instrument them, so the provider's
      // instrumenter.lastFileCoverage() handed back whichever module was
      // instrumented last (with an identity source map). That module then got a
      // second, unmapped copy of its functions at 0 hits: an intermittent CRAP
      // failure that depended on worker scheduling (useCountdownForm.ts, 43.2).
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/vite-env.d.ts", "**/*.d.ts"],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});

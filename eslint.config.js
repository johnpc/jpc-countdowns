import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Build output only. The iOS deploy's version-bump commit runs the
  // pre-commit lint in a tree that still holds the launch smoke's DerivedData
  // (ios-smoke-output/, Capacitor's bundled native-bridge.js) and the synced
  // ios/ web bundle; linting those failed the bump.
  {
    ignores: [
      "dist",
      "coverage",
      ".features-gen",
      "ios",
      "ios-smoke-output",
      "smoke-results",
      "DerivedData",
      "playwright-report",
      "test-results",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
    },
  },
);

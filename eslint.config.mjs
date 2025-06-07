import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  { files: ["**/*.{js,mjs,cjs}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.js"], languageOptions: { sourceType: "commonjs" } },
  {
    files: ["**/*.{js,mjs,cjs}"], languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      "no-unused-vars": "off",
    },
  },
]);
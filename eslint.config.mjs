import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const tsRecommended = tsPlugin.configs.recommended.rules;

export default [
  {
    ignores: ["node_modules/**", "dist/**", ".next/**", "build/**", "coverage/**"]
  },
  {
    files: ["packages/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      ...tsRecommended
    }
  }
];

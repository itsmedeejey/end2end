import tseslint from "typescript-eslint";
import eslint from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "eslint.config.mjs"],
  },

  // Base JS rules
  eslint.configs.recommended,

  // TypeScript rules (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
      parserOptions: {
        project: "./tsconfig.json", // ⚡ faster than projectService
      },
    },
  },

  // 🔥 disables all formatting conflicts with Prettier
  prettier,

  {
    rules: {
      /* NestJS-friendly relaxations */
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-parameter-properties": "off",

      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",

      /* Useful strictness */
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/require-await": "warn",

      /* Code quality */
      "no-console": "warn",
    },
  }
);

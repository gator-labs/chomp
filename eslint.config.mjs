import { fixupConfigRules } from "@eslint/compat";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import prettierConfigRecommended from "eslint-plugin-prettier/recommended";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const patchedConfig = fixupConfigRules([
  ...compat.extends(
    "next",
    "next/core-web-vitals",
    "plugin:storybook/recommended",
    "prettier",
  ),
]);

const config = [
  ...patchedConfig,
  prettierConfigRecommended,
  ...ts.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-asserted-optional-chain": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "prettier/prettier": "warn",
    },
  },
  {
    ignores: [
      "**/node_modules/",
      "coverage/",
      "out/",
      "build/",
      ".vercel/",
      ".next",
      ".storybook",
      "docs/",
      "prisma/migrations/",
      "public/",
      "scripts",
      ".*",
      "yarn.lock",
      "*.md",
    ],
  },
];

export default config;

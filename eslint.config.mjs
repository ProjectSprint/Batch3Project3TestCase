import tseslint from "@typescript-eslint/eslint-plugin";
// @ts-ignore
import tsParser from "@typescript-eslint/parser";

/** @type {import('eslint').Linter.Config[]} */
export default [
  // ============================
  // ./test (k6 environment)
  // ============================
  {
    files: ["test/**/*.js"],
    languageOptions: {
      ecmaVersion: 2019, // k6 supports ES2019 (no optional chaining, etc.)
      sourceType: "module",
      parserOptions: {
        project: "./test.tsconfig.json", // ✅ points to your existing tsconfig
      },
    },
    rules: {
      "object-shorthand": ["error", "never"],
      "no-unused-expressions": [
        "error",
        {
          allowShortCircuit: false,
          allowTernary: true,
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "LogicalExpression[operator='??']",
          message: "Nullish coalescing operator is not supported in k6",
        },
        {
          selector: "OptionalChaining",
          message: "Optional chaining (?.) is not supported in k6",
        },
        {
          selector: "PrivateIdentifier",
          message: "Private class fields are not supported in k6",
        },
      ],
      "no-async-promise-executor": "error",
      "no-await-in-loop": "error",
      "no-console": ["error", { allow: ["log", "warn", "error"] }],
      "no-import-assign": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["test/*"],
              message:
                "Please use relative imports instead of importing from 'test/'",
            },
          ],
        },
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "Array",
          property: "flatMap",
          message: "Array.flatMap() is not supported in k6",
        },
        {
          object: "Array",
          property: "flat",
          message: "Array.flat() is not supported in k6",
        },
        {
          object: "Object",
          property: "fromEntries",
          message: "Object.fromEntries() is not supported in k6",
        },
      ],
      "no-restricted-globals": [
        "error",
        {
          name: "globalThis",
          message: "globalThis is not supported in k6",
        },
      ],
    },
  },
  // ============================
  // ./src (Node.js 24 + TypeScript)
  // ============================
  {
    files: ["src/**/*.{js,ts,tsx}"],
    languageOptions: {
          parser: tsParser, 
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs["recommended-requiring-type-checking"].rules,

      // TypeScript specific rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/no-misused-promises": "error",

      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",

      // General rules
      "no-console": "warn",
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": "error",
    },
  },
];

module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", "/node_modules/**" // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint"
  ],
  rules: {
    "consistent-return": 0,
    "no-mixed-operators": 0,
    "no-useless-constructor": 0,
    "standard/computed-property-even-spacing": 0,
    "import/first": 1,
    "react/prop-types": 0,
    "no-unused-vars": 0,
    "no-console": 0,
    "indent": ["error", 1, {"SwitchCase": 1}],
    "semi": ["error", "always"],
    "brace-style": ["error", "1tbs", { "allowSingleLine": true }],
    "radix": ["off"],
    quotes: ["error", "double"]
  },
};

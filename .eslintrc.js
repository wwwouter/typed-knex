module.exports = {
    env: {
        es6: true,
        node: true,
    },
    extends: ["eslint:recommended", "plugin:@typescript-eslint/eslint-recommended", "plugin:prettier/recommended", "prettier"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["./tsconfig.json"],
        sourceType: "module",
        ecmaFeatures: {
            jsx: true, // Allows for the parsing of JSX
        },
    },
    plugins: ["eslint-plugin-import", "eslint-plugin-jsdoc", "eslint-plugin-no-null", "@typescript-eslint"],
    rules: {
        "prefer-rest-params": "warn",
        "no-unused-vars": "warn",
    },
};

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
    "^@t3-oss/env-nextjs$": require.resolve("@t3-oss/env-nextjs"),
    "^@t3-oss/env-core$": require.resolve("@t3-oss/env-core"),
  },
  modulePaths: ["<rootDir>"],
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 20000,
  transformIgnorePatterns: [
    "node_modules/(?!(@t3-oss/env-nextjs|@t3-oss/env-core|@t3-oss/env-base|@t3-oss/env-base|zod)/.*)",
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: true,
          },
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
    "^.+\\.m?js$": [
      "babel-jest",
      {
        presets: [["@babel/preset-env", { modules: "commonjs" }]],
        plugins: ["@babel/plugin-transform-modules-commonjs"],
      },
    ],
    "node_modules/@t3-oss/.+\\.(j|t)sx?$": [
      "babel-jest",
      {
        presets: [["@babel/preset-env", { modules: "commonjs" }]],
        plugins: ["@babel/plugin-transform-modules-commonjs"],
      },
    ],
  },
};

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
});

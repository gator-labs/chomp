const nextJest = require("next/jest");
const { defaults } = require("jest-config");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testPathIgnorePatterns: [...defaults.testPathIgnorePatterns, "/__utils__/"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  modulePaths: ["<rootDir>"],
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 20000,
  // Our tests are flaky, so for the moment, we run them in alphabetical order
  // TODO: Remove this when our tests are flaky no more
  testSequencer: "<rootDir>/lib/jest-custom-sequencer.js",
};

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
});

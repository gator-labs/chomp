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
  },
  modulePaths: ["<rootDir>"],
  verbose: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 20000,
  transformIgnorePatterns: [
    "node_modules/(?!(@t3-oss/env-nextjs|@t3-oss/env-core)/.*)",
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        useESM: true,
      },
    ],
  },
};

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
});

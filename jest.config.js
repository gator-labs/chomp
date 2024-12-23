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
    "^@t3-oss/env-nextjs$":
      "<rootDir>/node_modules/@t3-oss/env-nextjs/dist/index.js",
  },
  transformIgnorePatterns: ["/node_modules/(?!@t3-oss/env-nextjs)"],
  modulePaths: ["<rootDir>"],
  verbose: true,
  testEnvironment: "node",
  testTimeout: 20000,
  transform: {
    "^.+\\.[tj]sx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.json",
      },
    ],
  },
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)()),
});

const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  modulePaths: [
    "<rootDir>"
  ],
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: "node",
};

module.exports = async () => ({
  ...(await createJestConfig(customJestConfig)())
});

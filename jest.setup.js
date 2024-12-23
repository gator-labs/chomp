require("@testing-library/jest-dom");

// Mock environment variables for tests
process.env.OPENAI_API_KEY = "test-api-key";
process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/test";
process.env.BOT_TOKEN = "test-bot-token";
process.env.BOT_API_KEY = "test-bot-api-key";
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";

// Mock @t3-oss/env-nextjs
jest.mock("@t3-oss/env-nextjs", () => ({
  createEnv: () => ({
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    BOT_TOKEN: process.env.BOT_TOKEN,
    BOT_API_KEY: process.env.BOT_API_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }),
}));

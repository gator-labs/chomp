require("@testing-library/jest-dom");

// Mock environment variables for tests
process.env.OPENAI_API_KEY = "test-api-key";
process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/test";
process.env.BOT_TOKEN = "test-bot-token";
process.env.BOT_API_KEY = "test-bot-api-key";
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";

require("@testing-library/jest-dom");

// Mock environment variables for tests
process.env.OPENAI_API_KEY = "test-api-key";
process.env.SLACK_WEBHOOK_URL = "https://hooks.slack.com/test";

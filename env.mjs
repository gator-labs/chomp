import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    OPENAI_API_KEY: z.string().min(1),
    SLACK_WEBHOOK_URL: z.string().url(),
    // ... other existing env vars would go here
  },
  client: {
    // ... client-side env vars would go here
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    // ... other existing env vars would go here
  },
});

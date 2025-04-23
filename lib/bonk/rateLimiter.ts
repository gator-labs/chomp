// lib/rateLimiter.js
import { Ratelimit } from "@upstash/ratelimit";
import "server-only";

import { kv } from "../kv";

const HOURLY_LIMIT = Number(process.env.BONK_HOURLY_LIMIT) || 10000000;
// Create a rate limiter that allows 10M tokens per hour
export const bonkRateLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(HOURLY_LIMIT, "3600 s"),
  analytics: true,
});

// Function to check if distribution is allowed
export async function checkBonkRateLimit(amount: number) {
  const identifier = "global_bonk_distribution";

  try {
    // Check remaining quota first
    const remainingWindow = await bonkRateLimiter.getRemaining(identifier);

    if (remainingWindow.remaining - amount < 0) {
      return {
        isWithinBonkHourlyLimit: false,
        remainingLimit: remainingWindow.remaining,
      };
    }

    // Attempt to consume tokens
    const { success, remaining } = await bonkRateLimiter.limit(identifier, {
      rate: Math.round(amount),
    });

    return {
      isWithinBonkHourlyLimit: success,
      remainingLimit: remaining,
    };
  } catch (e) {
    console.error("Rate limiter error:", e);
    // Fail-safe: Block action if rate limiter unavailable
    return {
      isWithinBonkHourlyLimit: false,
      remainingLimit: 0,
    };
  }
}

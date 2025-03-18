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
  // Use a global identifier for tracking total Bonk distribution
  const identifier = "global_bonk_distribution";

  // Check if distribution is possible
  const { success, remaining } = await bonkRateLimiter.limit(identifier, {
    rate: Math.round(amount),
  });

  // Only allow if within limits and amount doesn't exceed remaining
  return {
    isWithinBonkHourlyLimit: success && amount <= remaining,
    remainingLimit: remaining,
  };
}

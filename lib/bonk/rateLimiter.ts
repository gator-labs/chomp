// lib/rateLimiter.js
import { Ratelimit } from "@upstash/ratelimit";
import "server-only";

import { kv } from "../kv";

// Create a rate limiter that allows 10M tokens per hour
export const bonkRateLimiter = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10000000, "3600 s"),
  analytics: true,
  prefix: "bonk_distribution",
});

// Function to check if distribution is allowed
export async function canDistributeBonk(amount: number) {
  // Use a global identifier for tracking total Bonk distribution
  const identifier = "global_bonk_distribution";

  // Check if distribution is possible
  const { success, limit, remaining } = await bonkRateLimiter.limit(identifier);
  console.log(success, limit, remaining);

  // Only allow if within limits and amount doesn't exceed remaining
  return success && amount <= remaining;
}

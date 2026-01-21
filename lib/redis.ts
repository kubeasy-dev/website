import { Redis } from "@upstash/redis";
import { env } from "@/env";

/**
 * Upstash Redis client for serverless environments
 * Used for session caching and real-time events via Redis Streams
 *
 * Configuration via validated environment variables:
 * - KV_REST_API_URL
 * - KV_REST_API_URL
 *
 * Returns null if Redis is not configured (optional dependency)
 * Includes a 5s timeout per request to prevent hanging connections
 * (recommended by Upstash for serverless environments)
 */
function createRedisClient(): Redis | null {
  const url = env.KV_REST_API_URL;
  const token = env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({
    url,
    token,
    signal: () => AbortSignal.timeout(5000),
  });
}

export const redis = createRedisClient();

/**
 * Check if Redis is available
 */
export const isRedisConfigured = redis !== null;

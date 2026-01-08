import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client for serverless environments
 * Used for session caching and real-time events via Redis Streams
 *
 * Configuration via environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 *
 * Returns null if Redis is not configured (optional dependency)
 */
function createRedisClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  return new Redis({ url, token });
}

export const redis = createRedisClient();

/**
 * Check if Redis is available
 */
export const isRedisConfigured = redis !== null;

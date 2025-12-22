import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client for serverless environments
 * Used by Upstash Realtime for real-time events via Redis Streams
 *
 * Configuration via environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
export const redis = Redis.fromEnv();

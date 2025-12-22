import { Redis } from "@upstash/redis";

/**
 * Upstash Redis client for serverless environments
 * Used for real-time events via Pub/Sub
 *
 * Configuration via environment variables:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */
export const redis = Redis.fromEnv();

/**
 * Publish a validation event to Redis using RPUSH
 * Channel format: events:validation:{userId}:{challengeSlug}
 *
 * Note: Upstash Redis HTTP API doesn't support traditional PUBLISH/SUBSCRIBE
 * We use RPUSH to a list, which SSE route polls with BLPOP
 */
export async function publishValidationEvent(
  userId: string,
  challengeSlug: string,
  payload: {
    objectiveKey: string;
    passed: boolean;
    timestamp: Date;
  },
) {
  const channel = `validation:${userId}:${challengeSlug}`;
  const listKey = `events:${channel}`;

  // Push event to Redis list
  await redis.rpush(listKey, JSON.stringify(payload));

  // Set expiration to 60 seconds (cleanup old events)
  await redis.expire(listKey, 60);
}

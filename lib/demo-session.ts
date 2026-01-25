import { nanoid } from "nanoid";
import { isRedisConfigured, redis } from "./redis";

const DEMO_TTL = 24 * 60 * 60; // 24 hours in seconds
// Use "demo:session:" prefix to avoid conflicts with Upstash Realtime channels
// (Realtime uses "demo:{token}" as a stream key, sessions use "demo:session:{token}" as a string)
const DEMO_KEY_PREFIX = "demo:session:";

/**
 * Demo session stored in Redis
 */
export interface DemoSession {
  token: string;
  createdAt: number;
  completedAt?: number;
}

/**
 * Creates a new demo session in Redis
 * @returns The created demo session or null if Redis is not configured
 */
export async function createDemoSession(): Promise<DemoSession | null> {
  if (!isRedisConfigured || !redis) {
    console.warn("[Demo] Redis not configured, cannot create demo session");
    return null;
  }

  const token = nanoid(16);
  const session: DemoSession = {
    token,
    createdAt: Date.now(),
  };

  try {
    await redis.set(`${DEMO_KEY_PREFIX}${token}`, JSON.stringify(session), {
      ex: DEMO_TTL,
    });
    return session;
  } catch (error) {
    console.error("[Demo] Failed to create demo session:", error);
    return null;
  }
}

/**
 * Retrieves a demo session from Redis
 * @param token - The demo session token
 * @returns The demo session or null if not found
 */
export async function getDemoSession(
  token: string,
): Promise<DemoSession | null> {
  if (!isRedisConfigured || !redis) {
    return null;
  }

  try {
    const data = await redis.get(`${DEMO_KEY_PREFIX}${token}`);
    if (!data) {
      return null;
    }

    return typeof data === "string" ? JSON.parse(data) : (data as DemoSession);
  } catch (error) {
    console.error("[Demo] Failed to get demo session:", error);
    return null;
  }
}

/**
 * Marks a demo session as completed
 * @param token - The demo session token
 */
export async function markDemoCompleted(token: string): Promise<void> {
  if (!isRedisConfigured || !redis) {
    return;
  }

  try {
    const session = await getDemoSession(token);
    if (session) {
      session.completedAt = Date.now();
      // Update with remaining TTL (get TTL first)
      const ttl = await redis.ttl(`${DEMO_KEY_PREFIX}${token}`);
      if (ttl > 0) {
        await redis.set(`${DEMO_KEY_PREFIX}${token}`, JSON.stringify(session), {
          ex: ttl,
        });
      }
    }
  } catch (error) {
    console.error("[Demo] Failed to mark demo as completed:", error);
  }
}

/**
 * Deletes a demo session from Redis
 * @param token - The demo session token
 */
export async function deleteDemoSession(token: string): Promise<void> {
  if (!isRedisConfigured || !redis) {
    return;
  }

  try {
    await redis.del(`${DEMO_KEY_PREFIX}${token}`);
  } catch (error) {
    console.error("[Demo] Failed to delete demo session:", error);
  }
}

/**
 * Validates a demo token format (basic check)
 * @param token - The token to validate
 * @returns true if the token format is valid
 */
export function isValidDemoToken(token: string): boolean {
  // nanoid(16) generates 16 character alphanumeric strings
  return /^[A-Za-z0-9_-]{16}$/.test(token);
}

/**
 * Result of a demo conversion link operation
 */
export interface DemoConversionResult {
  success: boolean;
  wasCompleted: boolean;
  message: string;
}

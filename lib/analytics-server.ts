/**
 * PostHog server-side analytics tracking utilities
 *
 * This file provides server-side tracking for events triggered from API routes
 * and tRPC procedures (especially for CLI interactions).
 */

import { PostHog } from "posthog-node";

// Initialize PostHog client for server-side tracking
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const isDevelopment = process.env.NODE_ENV === "development";

// Only initialize PostHog if credentials are available
let posthogClient: PostHog | null = null;

if (posthogKey && posthogHost) {
  try {
    posthogClient = new PostHog(posthogKey, {
      host: posthogHost,
      flushAt: 1, // Send events immediately (useful for CLI interactions)
      flushInterval: 0, // Disable automatic flushing
      // Disable in development
      disabled: isDevelopment,
    });

    if (isDevelopment) {
      console.info("[PostHog Server] Disabled in development mode");
    }
  } catch (error) {
    console.error("[PostHog Server] Failed to initialize:", error);
  }
} else if (isDevelopment) {
  console.info(
    "[PostHog Server] Not initialized: Missing environment variables",
  );
}

/**
 * Safe wrapper for PostHog server-side operations
 * In development, logs the event details to the console instead of sending to PostHog
 */
async function safePostHogOperation<T>(
  operation: string,
  fn: () => Promise<T>,
  devLog?: { event: string; properties?: Record<string, unknown> },
): Promise<void> {
  if (!posthogClient) {
    if (isDevelopment && devLog) {
      console.debug(
        `[PostHog Server] ${devLog.event}`,
        devLog.properties ?? "",
      );
    }
    return;
  }

  if (isDevelopment && devLog) {
    console.debug(
      `[PostHog Server] ${devLog.event}`,
      devLog.properties ?? "",
    );
    return;
  }

  try {
    await fn();
  } catch (error) {
    // Log but don't throw - analytics failures shouldn't break the application
    console.error(`[PostHog Server] ${operation} failed:`, error);
  }
}

/**
 * Track user signup event (server-side)
 * @param userId - The user ID
 * @param provider - The authentication provider used (github, google, microsoft)
 * @param email - User email (optional)
 */
export async function trackUserSignupServer(
  userId: string,
  provider: "github" | "google" | "microsoft",
  email?: string,
) {
  const properties = { provider, ...(email && { email }) };
  await safePostHogOperation(
    "trackUserSignupServer",
    async () => {
      posthogClient?.capture({
        distinctId: userId,
        event: "user_signup",
        properties,
      });
      await posthogClient?.flush();
    },
    { event: "user_signup", properties },
  );
}

/**
 * Track API token creation event (server-side)
 * @param userId - The user ID who created the token
 */
export async function trackApiTokenCreatedServer(userId: string) {
  await safePostHogOperation(
    "trackApiTokenCreatedServer",
    async () => {
      posthogClient?.capture({
        distinctId: userId,
        event: "api_token_created",
        properties: { source: "server" },
      });
      await posthogClient?.flush();
    },
    { event: "api_token_created", properties: { source: "server" } },
  );
}

/**
 * Track challenge start event (server-side)
 * @param userId - The user ID
 * @param challengeId - The ID of the challenge being started
 * @param challengeSlug - The slug of the challenge
 * @param challengeTitle - The title of the challenge
 */
export async function trackChallengeStartedServer(
  userId: string,
  challengeId: number,
  challengeSlug: string,
  challengeTitle: string,
) {
  const properties = { challengeId, challengeSlug, challengeTitle, source: "cli" };
  await safePostHogOperation(
    "trackChallengeStartedServer",
    async () => {
      posthogClient?.capture({
        distinctId: userId,
        event: "challenge_started",
        properties,
      });
      await posthogClient?.flush();
    },
    { event: "challenge_started", properties },
  );
}

/**
 * Track challenge completion event (server-side)
 * @param userId - The user ID
 * @param challengeId - The ID of the challenge that was completed
 * @param challengeSlug - The slug of the challenge
 * @param difficulty - The difficulty level of the challenge
 * @param xpAwarded - XP awarded for completion
 * @param isFirstChallenge - Whether this was the user's first challenge
 */
export async function trackChallengeCompletedServer(
  userId: string,
  challengeId: number,
  challengeSlug: string,
  difficulty: string,
  xpAwarded: number,
  isFirstChallenge: boolean,
) {
  const properties = { challengeId, challengeSlug, difficulty, xpAwarded, isFirstChallenge, source: "cli" };
  await safePostHogOperation(
    "trackChallengeCompletedServer",
    async () => {
      posthogClient?.capture({
        distinctId: userId,
        event: "challenge_completed",
        properties,
      });
      await posthogClient?.flush();
    },
    { event: "challenge_completed", properties },
  );
}

/**
 * Identify a user in PostHog (server-side)
 * @param userId - The unique user ID
 * @param properties - User properties
 */
export async function identifyUserServer(
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    provider?: string;
  },
) {
  await safePostHogOperation(
    "identifyUserServer",
    async () => {
      posthogClient?.identify({
        distinctId: userId,
        properties,
      });
      await posthogClient?.flush();
    },
    { event: "identify", properties: { userId, ...properties } },
  );
}

/**
 * Track challenge validation failure (server-side)
 * @param userId - The user ID
 * @param challengeId - The ID of the challenge
 * @param challengeSlug - The slug of the challenge
 * @param failedObjectiveCount - Number of failed objectives
 * @param failedObjectiveIds - List of failed objective IDs
 */
export async function trackChallengeValidationFailedServer(
  userId: string,
  challengeId: number,
  challengeSlug: string,
  failedObjectiveCount: number,
  failedObjectiveIds: string[],
) {
  const properties = { challengeId, challengeSlug, failedObjectiveCount, failedObjectiveIds, source: "cli" };
  await safePostHogOperation(
    "trackChallengeValidationFailedServer",
    async () => {
      posthogClient?.capture({
        distinctId: userId,
        event: "challenge_validation_failed",
        properties,
      });
      await posthogClient?.flush();
    },
    { event: "challenge_validation_failed", properties },
  );
}

/**
 * Capture an exception in PostHog Error Tracking (server-side)
 * @param error - The error to capture
 * @param distinctId - Optional user ID for attribution
 * @param additionalProperties - Optional extra properties for context
 */
export async function captureServerException(
  error: unknown,
  distinctId?: string,
  additionalProperties?: Record<string, unknown>,
): Promise<void> {
  if (isDevelopment) {
    console.debug(
      "[PostHog Server] $exception",
      error instanceof Error ? error.message : error,
      additionalProperties ?? "",
    );
    return;
  }

  if (!posthogClient) {
    return;
  }

  try {
    posthogClient.captureException(error, distinctId, additionalProperties);
    await posthogClient.flush();
  } catch (captureError) {
    console.error(
      "[PostHog Server] captureServerException failed:",
      captureError,
    );
  }
}

/**
 * Get the PostHog server client instance (for instrumentation.ts)
 */
export function getPostHogClient(): PostHog | null {
  return posthogClient;
}

/**
 * Shutdown PostHog client (call on server shutdown)
 */
export async function shutdownPostHog() {
  if (!posthogClient) {
    return;
  }

  try {
    await posthogClient.shutdown();
  } catch (error) {
    console.error("[PostHog Server] Failed to shutdown:", error);
  }
}

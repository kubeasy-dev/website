/**
 * PostHog server-side analytics tracking utilities
 *
 * This file provides server-side tracking for events triggered from API routes
 * and tRPC procedures (especially for CLI interactions).
 */

import { PostHog } from "posthog-node";

// Initialize PostHog client for server-side tracking
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
const posthogClient = new PostHog(posthogKey, {
  host: "https://eu.posthog.com",
  flushAt: 1, // Send events immediately (useful for CLI interactions)
  flushInterval: 0, // Disable automatic flushing
});

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
  posthogClient.capture({
    distinctId: userId,
    event: "user_signup",
    properties: {
      provider,
      ...(email && { email }),
    },
  });
  await posthogClient.flush();
}

/**
 * Track API token creation event (server-side)
 * @param userId - The user ID who created the token
 */
export async function trackApiTokenCreatedServer(userId: string) {
  posthogClient.capture({
    distinctId: userId,
    event: "api_token_created",
    properties: {
      source: "server",
    },
  });
  await posthogClient.flush();
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
  posthogClient.capture({
    distinctId: userId,
    event: "challenge_started",
    properties: {
      challengeId,
      challengeSlug,
      challengeTitle,
      source: "cli",
    },
  });
  await posthogClient.flush();
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
  posthogClient.capture({
    distinctId: userId,
    event: "challenge_completed",
    properties: {
      challengeId,
      challengeSlug,
      difficulty,
      xpAwarded,
      isFirstChallenge,
      source: "cli",
    },
  });
  await posthogClient.flush();
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
  posthogClient.identify({
    distinctId: userId,
    properties,
  });
  await posthogClient.flush();
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
  posthogClient.capture({
    distinctId: userId,
    event: "challenge_validation_failed",
    properties: {
      challengeId,
      challengeSlug,
      failedObjectiveCount,
      failedObjectiveIds,
      source: "cli",
    },
  });
  await posthogClient.flush();
}

/**
 * Shutdown PostHog client (call on server shutdown)
 */
export async function shutdownPostHog() {
  await posthogClient.shutdown();
}

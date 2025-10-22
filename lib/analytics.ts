/**
 * PostHog analytics tracking utilities
 *
 * This file provides type-safe wrappers around PostHog event tracking
 * to ensure consistent event naming and properties across the application.
 */

import posthog from "posthog-js";

/**
 * Track user signup event
 * @param provider - The authentication provider used (github, google, microsoft)
 */
export function trackUserSignup(provider: "github" | "google" | "microsoft") {
  posthog.capture("user_signup", {
    provider,
  });
}

/**
 * Track API token creation event
 * @param userId - The user ID who created the token
 */
export function trackApiTokenCreated(userId: string) {
  posthog.capture("api_token_created", {
    userId,
  });
}

/**
 * Track challenge start event
 * @param challengeId - The ID of the challenge being started
 * @param challengeSlug - The slug of the challenge
 * @param difficulty - The difficulty level of the challenge
 */
export function trackChallengeStarted(
  challengeId: string,
  challengeSlug: string,
  difficulty: string,
) {
  posthog.capture("challenge_started", {
    challengeId,
    challengeSlug,
    difficulty,
  });
}

/**
 * Track challenge completion event
 * @param challengeId - The ID of the challenge that was completed
 * @param challengeSlug - The slug of the challenge
 * @param difficulty - The difficulty level of the challenge
 * @param timeSpent - Time spent on the challenge in seconds (optional)
 */
export function trackChallengeCompleted(
  challengeId: string,
  challengeSlug: string,
  difficulty: string,
  timeSpent?: number,
) {
  posthog.capture("challenge_completed", {
    challengeId,
    challengeSlug,
    difficulty,
    ...(timeSpent && { timeSpent }),
  });
}

/**
 * Identify a user in PostHog
 * This should be called after successful authentication
 * @param userId - The unique user ID
 * @param properties - Additional user properties
 */
export function identifyUser(
  userId: string,
  properties?: {
    email?: string;
    name?: string;
    provider?: string;
  },
) {
  posthog.identify(userId, properties);
}

/**
 * Reset PostHog state (call on logout)
 */
export function resetAnalytics() {
  posthog.reset();
}

/**
 * Track challenge card click event
 * @param challengeSlug - The slug of the challenge clicked
 * @param difficulty - The difficulty level of the challenge
 * @param fromPage - The page where the click occurred (e.g., "homepage", "challenges_list")
 */
export function trackChallengeCardClicked(
  challengeSlug: string,
  difficulty: string,
  fromPage: string,
) {
  posthog.capture("challenge_card_clicked", {
    challengeSlug,
    difficulty,
    fromPage,
  });
}

/**
 * Track CTA button click event
 * @param ctaText - The text of the CTA button
 * @param ctaLocation - Where the CTA is located (e.g., "hero", "footer", "navbar")
 * @param targetUrl - The URL the CTA points to
 */
export function trackCtaClicked(
  ctaText: string,
  ctaLocation: string,
  targetUrl: string,
) {
  posthog.capture("cta_clicked", {
    ctaText,
    ctaLocation,
    targetUrl,
  });
}

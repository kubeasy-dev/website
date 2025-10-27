// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a user loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
// Also initializes PostHog analytics.

import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

const isDevelopment = process.env.NODE_ENV === "development";

// Initialize PostHog
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: "/ingest",
  ui_host: "https://eu.posthog.com",
  defaults: "2025-05-24",
  capture_exceptions: true, // This enables capturing exceptions using Error Tracking
  debug: isDevelopment,
});

// Initialize Sentry
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  environment: process.env.NEXT_PUBLIC_VERCEL_ENV,

  // Define how likely traces are sampled.
  // DEV: 100% of traces to capture all development activity
  // PROD: 10% to reduce volume while maintaining visibility
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Define how likely Replay events are sampled during normal sessions.
  // DEV: 10% to capture some user flows without overwhelming storage
  // PROD: 1% to minimize costs while maintaining sample data
  replaysSessionSampleRate: isDevelopment ? 0.1 : 0.01,

  // Define how likely Replay events are sampled when an error occurs.
  // Always 100% to capture full context of all errors
  replaysOnErrorSampleRate: 1.0,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: isDevelopment,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

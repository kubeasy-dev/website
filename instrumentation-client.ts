// This file configures the initialization of PostHog analytics on the client.
// The added config here will be used whenever a user loads a page in their browser.

import posthog from "posthog-js";

// Initialize PostHog with error handling and development mode disabling
const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (posthogKey && posthogHost) {
  try {
    posthog.init(posthogKey, {
      api_host: "/ingest",
      ui_host: posthogHost,
      defaults: "2025-05-24",
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking
      debug: false,
    });
  } catch (error) {
    // Log initialization errors but don't break the app
    console.error("[PostHog] Failed to initialize:", error);
  }
}

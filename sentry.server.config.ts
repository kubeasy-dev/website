// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

Sentry.init({
  dsn: "https://6e6e807799115b099c0c68c05c26ee8a@o4510220564955136.ingest.de.sentry.io/4510220589138000",

  // Define how likely traces are sampled.
  // DEV: 100% of traces to capture all development activity
  // PROD: 10% to reduce volume while maintaining visibility
  tracesSampleRate: isDevelopment ? 1.0 : 0.1,

  environment: isDevelopment ? "development" : "production",

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  sendDefaultPii: isDevelopment,
});

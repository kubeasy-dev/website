import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Cache Components (Next.js 16 use cache directive)
  cacheComponents: true,

  // Cache lifetime profiles for use cache directive
  cacheLife: {
    // Default profile (5 min client, 15 min server)
    default: {
      stale: 300,      // 5 minutes client-side
      revalidate: 900, // 15 minutes server-side
      expire: Infinity, // No expiration
    },
    // Public data profile (challenges, themes)
    public: {
      stale: 600,       // 10 minutes client-side
      revalidate: 3600, // 1 hour server-side (matches old ISR)
      expire: Infinity, // No expiration
    },
    // User data profile (stats, progress)
    user: {
      stale: 30,       // 30 seconds client-side
      revalidate: 300, // 5 minutes server-side
      expire: 900,     // 15 minutes max
    },
    // Frequently changing data (like real-time validation)
    minutes: {
      stale: 30,       // 30 seconds client-side
      revalidate: 60,  // 1 minute server-side
      expire: 300,     // 5 minutes max
    },
    // Slow-changing data (XP, ranks)
    hours: {
      stale: 300,      // 5 minutes client-side
      revalidate: 900, // 15 minutes server-side
      expire: 3600,    // 1 hour max
    },
  },

  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "kubeasy",

  project: "website",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});

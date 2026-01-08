"use client";

import { PostHogIdentify } from "@/components/posthog-identify";

/**
 * Global providers for the application
 *
 * Note: RealtimeProvider was removed from here because it caused hydration errors
 * ("The new child element contains the parent"). It's only needed on challenge
 * pages for real-time validation updates, so it should be added there directly.
 */
export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <PostHogIdentify />
      {children}
    </>
  );
};

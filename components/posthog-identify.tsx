"use client";

import { useEffect, useRef } from "react";
import { identifyUser, resetAnalytics } from "@/lib/analytics";
import { authClient } from "@/lib/auth-client";

/**
 * Component that syncs Better Auth session state with PostHog user identification.
 *
 * This ensures that:
 * 1. When a user logs in, PostHog identifies them with their real user ID
 * 2. When a user logs out, PostHog resets to anonymous state
 * 3. All client-side events are attributed to the correct user
 *
 * Without this, client events use anonymous IDs while server events use real user IDs,
 * causing split user profiles and broken funnels in PostHog.
 */
export function PostHogIdentify() {
  const { data: session, isPending } = authClient.useSession();
  const previousUserIdRef = useRef<string | null>(null);
  const hasIdentifiedRef = useRef(false);

  useEffect(() => {
    // Don't do anything while session is loading
    if (isPending) return;

    const currentUserId = session?.user?.id ?? null;
    const previousUserId = previousUserIdRef.current;

    // User logged in (session appeared or user changed)
    if (currentUserId && currentUserId !== previousUserId) {
      identifyUser(currentUserId, {
        email: session?.user?.email ?? undefined,
        name: session?.user?.name ?? undefined,
      });
      hasIdentifiedRef.current = true;
    }

    // User logged out (session disappeared)
    if (!currentUserId && previousUserId && hasIdentifiedRef.current) {
      resetAnalytics();
      hasIdentifiedRef.current = false;
    }

    previousUserIdRef.current = currentUserId;
  }, [session, isPending]);

  // This component doesn't render anything
  return null;
}

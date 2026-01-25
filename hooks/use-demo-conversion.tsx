"use client";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";

/**
 * Hook to automatically link demo conversions after user login.
 *
 * This hook:
 * 1. Checks if user is authenticated
 * 2. Looks for the demo token cookie
 * 3. Calls the linkDemoConversion mutation if both conditions are met
 * 4. Clears the cookie after successful linking
 *
 * Usage: Add this hook to your root layout or a component that runs after login
 */
export function useDemoConversion() {
  const trpc = useTRPC();
  const linkMutation = useMutation({
    ...trpc.demo.linkDemoConversion.mutationOptions(),
    onSuccess: () => {
      // Clear the cookie after successful linking
      document.cookie = "kubeasy_demo_token=; path=/; max-age=0; SameSite=Lax";
    },
    onError: (error) => {
      console.error("[Demo Conversion] Failed to link:", error.message);
      // Still clear the cookie to prevent repeated attempts
      document.cookie = "kubeasy_demo_token=; path=/; max-age=0; SameSite=Lax";
    },
  });
  const { data: session } = authClient.useSession();
  const hasAttemptedRef = useRef(false);

  useEffect(() => {
    // Only run once per session
    if (hasAttemptedRef.current) return;

    // Only run if user is authenticated
    if (!session?.user?.id) return;

    // Check for demo token cookie
    const cookies = document.cookie.split(";");
    const demoTokenCookie = cookies.find((c) =>
      c.trim().startsWith("kubeasy_demo_token="),
    );

    if (!demoTokenCookie) return;

    const token = demoTokenCookie.split("=")[1]?.trim();
    if (!token) return;

    // Mark as attempted to prevent multiple calls
    hasAttemptedRef.current = true;

    // Call the mutation to link the conversion
    linkMutation.mutate({ token });
  }, [session?.user?.id, linkMutation]);
}

/**
 * Provider component that runs the demo conversion hook
 * Add this to your app layout to automatically track demo conversions
 */
export function DemoConversionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useDemoConversion();
  return <>{children}</>;
}

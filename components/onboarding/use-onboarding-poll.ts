"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTRPC } from "@/trpc/client";

type OnboardingStepKey =
  | "cliAuthenticated"
  | "clusterInitialized"
  | "hasStartedChallenge"
  | "hasCompletedChallenge";

interface UseOnboardingPollOptions {
  /** The step key to poll for */
  stepKey: OnboardingStepKey;
  /** Initial completed state */
  initialCompleted: boolean;
  /** Polling interval in milliseconds */
  interval?: number;
  /** Maximum consecutive errors before stopping */
  maxErrors?: number;
  /** Callback when step is completed */
  onComplete?: () => void;
}

interface UseOnboardingPollResult {
  /** Whether the step is completed */
  isCompleted: boolean;
  /** Whether polling is active */
  isPolling: boolean;
  /** Error message if polling failed repeatedly */
  error: string | null;
}

/**
 * Custom hook for polling onboarding status with proper cleanup.
 * Avoids memory leaks by using refs and stable dependencies.
 *
 * @example
 * const { isCompleted, isPolling, error } = useOnboardingPoll({
 *   stepKey: "cliAuthenticated",
 *   initialCompleted: false,
 *   onComplete: () => console.log("CLI authenticated!"),
 * });
 */
export function useOnboardingPoll({
  stepKey,
  initialCompleted,
  interval = 3000,
  maxErrors = 10,
  onComplete,
}: UseOnboardingPollOptions): UseOnboardingPollResult {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [error, setError] = useState<string | null>(null);

  const trpc = useTRPC();
  const queryClient = useQueryClient();

  // Use refs to avoid stale closures and unnecessary effect re-runs
  const isCompletedRef = useRef(initialCompleted);
  const errorCountRef = useRef(0);
  const onCompleteRef = useRef(onComplete);

  // Keep refs in sync
  useEffect(() => {
    isCompletedRef.current = isCompleted;
  }, [isCompleted]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Stable poll function
  const poll = useCallback(async () => {
    if (isCompletedRef.current) return;

    try {
      const status = await queryClient.fetchQuery(
        trpc.onboarding.getStatus.queryOptions(),
      );

      // Reset error count on success
      errorCountRef.current = 0;

      if (status.steps[stepKey]) {
        isCompletedRef.current = true;
        setIsCompleted(true);
        onCompleteRef.current?.();
      }
    } catch (err) {
      errorCountRef.current += 1;

      if (errorCountRef.current >= maxErrors) {
        console.error("Polling failed repeatedly:", err);
        setError("Failed to check status. Please refresh the page.");
      }
    }
  }, [queryClient, trpc, stepKey, maxErrors]);

  // Setup polling interval with proper cleanup
  useEffect(() => {
    // Don't poll if already completed
    if (initialCompleted) return;

    const pollInterval = setInterval(poll, interval);

    return () => {
      clearInterval(pollInterval);
    };
  }, [initialCompleted, interval, poll]);

  return {
    isCompleted,
    isPolling: !isCompleted && !error,
    error,
  };
}

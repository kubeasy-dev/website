"use client";

import {
  ONBOARDING_EVENTS,
  type OnboardingStepKey,
  useWorkflowStep,
} from "@/lib/workflow";
import { useTRPC } from "@/trpc/client";

interface UseOnboardingRealtimeOptions {
  /** User ID for the realtime channel */
  userId: string;
  /** The step key to listen for */
  stepKey: OnboardingStepKey;
  /** Initial completed state */
  initialCompleted: boolean;
  /** Callback when step is completed */
  onComplete?: () => void;
}

interface UseOnboardingRealtimeResult {
  /** Whether the step is completed */
  isCompleted: boolean;
  /** Realtime connection status */
  status: "connecting" | "connected" | "disconnected";
}

/**
 * Custom hook for realtime onboarding status updates using Upstash Realtime.
 * Replaces polling with instant updates via Server-Sent Events.
 *
 * This is a thin wrapper around useWorkflowStep that provides onboarding-specific
 * defaults and query invalidation.
 *
 * @example
 * const { isCompleted, status } = useOnboardingRealtime({
 *   userId: "user_123",
 *   stepKey: "cliAuthenticated",
 *   initialCompleted: false,
 *   onComplete: () => console.log("CLI authenticated!"),
 * });
 */
export function useOnboardingRealtime({
  userId,
  stepKey,
  initialCompleted,
  onComplete,
}: UseOnboardingRealtimeOptions): UseOnboardingRealtimeResult {
  const trpc = useTRPC();

  return useWorkflowStep({
    channel: `onboarding:${userId}`,
    eventType: ONBOARDING_EVENTS.STEP_COMPLETED,
    eventFilter: (data) => {
      const eventData = data as { step: OnboardingStepKey };
      return eventData.step === stepKey;
    },
    initialCompleted,
    onComplete,
    invalidateQueryKeys: [trpc.onboarding.getStatus.queryKey()],
    enabled: !!userId,
  });
}

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useRealtime } from "@/lib/realtime-client";
import type { UseWorkflowStepOptions, UseWorkflowStepResult } from "./types";

/**
 * Generic hook for listening to realtime workflow step events.
 *
 * This hook provides a unified way to:
 * - Subscribe to realtime channels for step completion events
 * - Manage completed state with optional initial value
 * - Invalidate React Query caches on completion
 * - Call completion callbacks
 *
 * @example
 * // Listen for CLI authentication in onboarding
 * const { isCompleted, status } = useWorkflowStep({
 *   channel: `onboarding:${userId}`,
 *   eventType: "onboarding.stepCompleted",
 *   eventFilter: (data) => data.step === "cliAuthenticated",
 *   initialCompleted: false,
 *   onComplete: () => console.log("Step completed!"),
 *   invalidateQueryKeys: [["onboarding", "getStatus"]],
 * });
 *
 * @example
 * // Listen for demo start event
 * const { isCompleted, status } = useWorkflowStep({
 *   channel: `demo:${token}`,
 *   eventType: "demo.started",
 *   initialCompleted: false,
 *   onComplete: () => advanceToNextStep(),
 * });
 */
export function useWorkflowStep({
  channel,
  eventType,
  eventFilter,
  initialCompleted,
  onComplete,
  invalidateQueryKeys,
  enabled = true,
}: UseWorkflowStepOptions): UseWorkflowStepResult {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const queryClient = useQueryClient();

  // Listen for realtime events
  const { status } = useRealtime({
    enabled: enabled && !initialCompleted && !!channel,
    channels: [channel],
    events: [eventType],
    onData({ data }) {
      // Apply optional filter
      if (eventFilter && !eventFilter(data)) {
        return;
      }

      setIsCompleted(true);

      // Invalidate specified query keys
      if (invalidateQueryKeys) {
        for (const queryKey of invalidateQueryKeys) {
          queryClient.invalidateQueries({ queryKey });
        }
      }

      // Call the completion callback
      onComplete?.();
    },
  });

  // Sync with initial completed prop changes
  useEffect(() => {
    if (initialCompleted) {
      setIsCompleted(true);
    }
  }, [initialCompleted]);

  return {
    isCompleted,
    status: status as "connecting" | "connected" | "disconnected",
  };
}

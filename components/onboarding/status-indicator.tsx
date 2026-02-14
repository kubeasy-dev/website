"use client";

import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusIndicatorProps {
  isCompleted: boolean;
  completedTitle: string;
  completedMessage: string;
  pendingTitle: string;
  pendingMessage: string;
  className?: string;
}

/**
 * Reusable status indicator component for onboarding steps.
 * Shows a loading spinner when pending and a checkmark when completed.
 * Uses ARIA live regions for accessibility.
 *
 * @component
 * @example
 * <StatusIndicator
 *   isCompleted={isAuthenticated}
 *   completedTitle="Authenticated!"
 *   completedMessage="Your CLI is connected and ready"
 *   pendingTitle="Waiting for login..."
 *   pendingMessage="Run the command above and paste your token"
 * />
 */
export function StatusIndicator({
  isCompleted,
  completedTitle,
  completedMessage,
  pendingTitle,
  pendingMessage,
  className,
}: StatusIndicatorProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "w-full p-4 rounded-lg transition-all flex items-center gap-4",
        isCompleted
          ? "bg-green-100"
          : "bg-secondary/50 animate-pulse motion-reduce:animate-none",
        className,
      )}
    >
      {isCompleted ? (
        <>
          <div className="p-2.5 bg-green-500 rounded-full" aria-hidden="true">
            <Check className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-black text-green-800">{completedTitle}</p>
            <p className="text-sm text-green-700/70">{completedMessage}</p>
          </div>
        </>
      ) : (
        <>
          <div
            className="p-2.5 bg-foreground/10 rounded-full"
            aria-hidden="true"
          >
            <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none text-foreground/50" />
          </div>
          <div>
            <p className="font-black">{pendingTitle}</p>
            <p className="text-sm text-foreground/60">{pendingMessage}</p>
          </div>
        </>
      )}
    </div>
  );
}

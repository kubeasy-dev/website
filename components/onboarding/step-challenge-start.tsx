"use client";

import { Check, Flame, Play, Target, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCommandCopied } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { CLI_COMMANDS } from "./constants";
import { StatusIndicator } from "./status-indicator";
import { TerminalCommand } from "./terminal-command";
import { useOnboardingRealtime } from "./use-onboarding-realtime";

interface StepChallengeStartProps {
  userId: string;
  isCompleted: boolean;
  onContinue: () => void;
  onBack: () => void;
}

/**
 * Challenge start step for onboarding wizard.
 * Displays the recommended challenge and listens for start status via realtime.
 */
export function StepChallengeStart({
  userId,
  isCompleted: initialCompleted,
  onContinue,
  onBack,
}: StepChallengeStartProps) {
  const { isCompleted } = useOnboardingRealtime({
    userId,
    stepKey: "hasStartedChallenge",
    initialCompleted,
    onComplete: onContinue, // Auto-advance when detected
  });

  return (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div
            className={cn(
              "absolute inset-0 blur-xl rounded-full transition-colors",
              isCompleted ? "bg-green-500/20" : "bg-amber-500/20",
            )}
          />
          <div
            className={cn(
              "relative p-4 neo-border-thick rounded-2xl transition-colors",
              isCompleted
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-amber-400 to-amber-500",
            )}
          >
            {isCompleted ? (
              <Check className="w-10 h-10 text-white" aria-hidden="true" />
            ) : (
              <Play className="w-10 h-10 text-amber-900" aria-hidden="true" />
            )}
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-black">
          {isCompleted ? "Challenge Started!" : "Start a Challenge"}
        </h2>
        <p className="text-lg text-foreground/70">
          {isCompleted
            ? "Good luck solving the challenge"
            : "Time to put your Kubernetes skills to the test"}
        </p>
      </div>

      {/* Challenge Card */}
      <article className="w-full bg-secondary/30 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-3">
          <div className="flex items-center gap-3">
            <div
              className="p-2 bg-white/20 rounded-lg backdrop-blur-sm"
              aria-hidden="true"
            >
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div className="text-white">
              <p className="font-black">Pod Evicted</p>
              <p className="text-white/80 text-xs">Recommended for beginners</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <p className="text-foreground/80 text-sm mb-3">
            A data processing pod keeps crashing. Investigate and fix the issue
            to make it run stably.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
              <Target className="w-3 h-3" aria-hidden="true" />
              Easy
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-foreground/70 text-xs font-bold rounded-full">
              <Timer className="w-3 h-3" aria-hidden="true" />
              ~15 min
            </span>
          </div>
        </div>
      </article>

      {/* Terminal Command */}
      <TerminalCommand
        command={CLI_COMMANDS.challengeStart}
        onCopy={() =>
          trackCommandCopied(
            CLI_COMMANDS.challengeStart,
            "onboarding_challenge_start",
          )
        }
      />

      {/* Status Indicator */}
      <StatusIndicator
        isCompleted={isCompleted}
        completedTitle="Challenge Started!"
        completedMessage="Good luck solving the challenge"
        pendingTitle="Waiting for challenge to start..."
        pendingMessage="Run the command above to begin"
      />

      {/* Navigation */}
      <div className="flex gap-4 w-full">
        <Button
          onClick={onBack}
          variant="outline"
          size="lg"
          className="neo-border font-bold hover:bg-secondary"
        >
          Back
        </Button>
        <Button
          onClick={onContinue}
          size="lg"
          className={cn(
            "group neo-border font-black flex-1 transition-all",
            isCompleted
              ? "neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
              : "opacity-50 cursor-not-allowed",
          )}
          disabled={!isCompleted}
        >
          {isCompleted ? "Continue" : "Waiting for Start..."}
        </Button>
      </div>
    </div>
  );
}

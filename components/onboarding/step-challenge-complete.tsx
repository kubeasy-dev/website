"use client";

import {
  ArrowRight,
  Loader2,
  PartyPopper,
  Rocket,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { trackCommandCopied } from "@/lib/analytics";
import { CLI_COMMANDS } from "./constants";
import { TerminalCommand } from "./terminal-command";
import { useOnboardingRealtime } from "./use-onboarding-realtime";

interface StepChallengeCompleteProps {
  userId: string;
  isCompleted: boolean;
  onComplete: () => void;
  onBack: () => void;
}

const HINTS = [
  {
    step: 1,
    text: "Use kubectl get pods to see pod status",
    code: "kubectl get pods",
  },
  {
    step: 2,
    text: "Check events with kubectl describe pod",
    code: "kubectl describe pod <pod-name>",
  },
  {
    step: 3,
    text: "Look for resource limit issues in events",
    code: null,
  },
];

const CONFETTI_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-amber-400",
  "bg-green-500",
  "bg-pink-500",
];

function generateConfettiPieces() {
  return Array.from({ length: 24 }, (_, i) => ({
    id: `confetti-${i}`,
    left: `${(i * 4.2 + 1) % 100}%`,
    delay: `${(i * 0.08) % 1.5}s`,
    duration: `${2.5 + (i % 4) * 0.3}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotation: `${i * 15}deg`,
  }));
}

const NEXT_STEPS = [
  { icon: Zap, text: "Tackle harder challenges" },
  { icon: Trophy, text: "Earn XP and level up" },
  { icon: Rocket, text: "Explore all themes" },
];

/**
 * Challenge completion step for onboarding wizard.
 * Shows hints while waiting, then celebrates when complete.
 */
export function StepChallengeComplete({
  userId,
  isCompleted: initialCompleted,
  onComplete,
  onBack,
}: StepChallengeCompleteProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const confettiPieces = useMemo(() => generateConfettiPieces(), []);

  const { isCompleted } = useOnboardingRealtime({
    userId,
    stepKey: "hasCompletedChallenge",
    initialCompleted,
    onComplete: () => {
      setShowConfetti(true);
      confettiTimeoutRef.current = setTimeout(
        () => setShowConfetti(false),
        4000,
      );
    },
  });

  // Show confetti on initial load if already completed
  useEffect(() => {
    if (initialCompleted) {
      setShowConfetti(true);
      confettiTimeoutRef.current = setTimeout(
        () => setShowConfetti(false),
        4000,
      );
    }

    // Cleanup timeout on unmount
    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, [initialCompleted]);

  // Success view
  if (isCompleted) {
    return (
      <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto text-center relative">
        {/* Confetti - respects reduced motion */}
        {showConfetti && (
          <div
            className="fixed inset-0 pointer-events-none overflow-hidden z-50"
            aria-hidden="true"
          >
            {confettiPieces.map((piece) => (
              <div
                key={piece.id}
                className="absolute motion-safe:animate-confetti motion-reduce:hidden"
                style={{
                  left: piece.left,
                  animationDelay: piece.delay,
                  animationDuration: piece.duration,
                }}
              >
                <div
                  className={`w-3 h-3 ${piece.color}`}
                  style={{ transform: `rotate(${piece.rotation})` }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Trophy with animation */}
        <div className="relative">
          <div
            className="absolute inset-0 bg-amber-400/30 blur-3xl rounded-full motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <div className="relative">
            <div className="w-28 h-28 neo-border-thick bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 rounded-full flex items-center justify-center motion-safe:animate-bounce-slow">
              <Trophy className="w-14 h-14 text-amber-900" aria-hidden="true" />
            </div>
            {/* Orbiting sparkles */}
            <div
              className="absolute inset-0 motion-safe:animate-spin-slow"
              aria-hidden="true"
            >
              <Sparkles className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 text-primary" />
              <Sparkles className="absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 text-accent" />
              <Sparkles className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 text-amber-500" />
              <Sparkles className="absolute top-1/2 -left-3 -translate-y-1/2 w-5 h-5 text-green-500" />
            </div>
          </div>
        </div>

        {/* Success message */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 text-primary">
            <PartyPopper className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-black uppercase tracking-widest">
              Mission Complete
            </span>
            <PartyPopper className="w-5 h-5 scale-x-[-1]" aria-hidden="true" />
          </div>
          <h2 className="text-4xl md:text-5xl font-black">Congratulations!</h2>
          <p className="text-xl text-foreground/70 max-w-md">
            You've completed your first Kubernetes challenge!
          </p>
        </div>

        {/* What's next */}
        <div className="w-full">
          <h3 className="font-bold text-sm text-foreground/60 mb-3">
            You're now ready to:
          </h3>
          <div className="grid gap-2">
            {NEXT_STEPS.map((step) => (
              <div
                key={step.text}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                <div
                  className="p-2 bg-primary/10 rounded-lg"
                  aria-hidden="true"
                >
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold">{step.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Button
          onClick={onComplete}
          size="lg"
          className="group neo-border neo-shadow font-black w-full py-6 text-lg hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <Rocket
            className="w-5 h-5 mr-2 group-hover:motion-safe:animate-bounce"
            aria-hidden="true"
          />
          Go to Dashboard
          <ArrowRight
            className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
            aria-hidden="true"
          />
        </Button>
      </div>
    );
  }

  // Waiting for completion view
  return (
    <div className="flex flex-col items-center space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
          <div className="relative p-4 bg-gradient-to-br from-primary to-primary-dark neo-border-thick rounded-2xl">
            <Trophy className="w-10 h-10 text-white" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-black">
          Complete the Challenge
        </h2>
        <p className="text-lg text-foreground/70">
          Fix the issue and submit your solution
        </p>
      </div>

      {/* Hints */}
      <div className="w-full">
        <h3 className="font-bold text-sm text-foreground/60 mb-3">Hints:</h3>
        <div className="grid gap-2">
          {HINTS.map((hint) => (
            <div
              key={hint.step}
              className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg"
            >
              <span
                className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-black text-xs shrink-0"
                aria-hidden="true"
              >
                {hint.step}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-foreground/80">{hint.text}</p>
                {hint.code && (
                  <code className="text-xs font-mono text-primary mt-1 block">
                    {hint.code}
                  </code>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit command */}
      <div className="w-full">
        <p className="text-sm font-bold mb-3 text-foreground/70">
          When you've fixed the issue, submit your solution:
        </p>
        <TerminalCommand
          command={CLI_COMMANDS.challengeSubmit}
          onCopy={() =>
            trackCommandCopied(
              CLI_COMMANDS.challengeSubmit,
              "onboarding_challenge_submit",
            )
          }
        />
      </div>

      {/* Status indicator */}
      <div
        role="status"
        aria-live="polite"
        className="w-full p-4 rounded-lg bg-secondary/50 motion-safe:animate-pulse flex items-center gap-4"
      >
        <div className="p-2.5 bg-foreground/10 rounded-full" aria-hidden="true">
          <Loader2 className="w-5 h-5 motion-safe:animate-spin text-foreground/50" />
        </div>
        <div>
          <p className="font-black">Waiting for successful submission...</p>
          <p className="text-sm text-foreground/60">
            All validation checks must pass
          </p>
        </div>
      </div>

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
          size="lg"
          className="neo-border font-black flex-1 opacity-50 cursor-not-allowed"
          disabled
        >
          Waiting for Completion...
        </Button>
      </div>
    </div>
  );
}

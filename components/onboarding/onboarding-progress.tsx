"use client";

import {
  Check,
  Key,
  LogIn,
  Play,
  Rocket,
  Server,
  Terminal,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: "welcome", label: "Welcome", icon: Rocket },
  { key: "cli_install", label: "Install CLI", icon: Terminal },
  { key: "api_token", label: "Create Token", icon: Key },
  { key: "cli_login", label: "CLI Login", icon: LogIn },
  { key: "cli_setup", label: "Setup Cluster", icon: Server },
  { key: "challenge_start", label: "Start Challenge", icon: Play },
  { key: "challenge_complete", label: "Complete!", icon: Trophy },
] as const;

interface OnboardingProgressProps {
  currentStep: number;
  className?: string;
}

export function OnboardingProgress({
  currentStep,
  className,
}: OnboardingProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile: Compact progress */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-black">
            Step {currentStep} of {STEPS.length}
          </span>
          <span className="text-sm font-bold text-primary">
            {STEPS[currentStep - 1]?.label}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-2 bg-foreground/10 rounded-full overflow-hidden neo-border">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{
              width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>
        {/* Step dots */}
        <div className="flex justify-between mt-2">
          {STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const StepIcon = step.icon;

            return (
              <div
                key={step.key}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                  isCompleted && "bg-primary text-primary-foreground",
                  isCurrent && "bg-primary/20 text-primary ring-2 ring-primary",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-foreground/10 text-foreground/30",
                )}
              >
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <StepIcon className="w-3 h-3" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Full stepper */}
      <div className="hidden lg:flex items-center justify-between">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLast = index === STEPS.length - 1;
          const StepIcon = step.icon;

          return (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-none"
            >
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl neo-border-thick flex items-center justify-center font-bold transition-all",
                    isCompleted &&
                      "bg-primary text-primary-foreground neo-shadow",
                    isCurrent &&
                      "bg-primary/20 text-primary ring-2 ring-primary ring-offset-2",
                    !isCompleted && !isCurrent && "bg-card text-foreground/40",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-bold text-center max-w-[80px] transition-colors",
                    isCurrent && "text-primary",
                    isCompleted && "text-foreground",
                    !isCurrent && !isCompleted && "text-foreground/50",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-3 mb-6">
                  <div className="relative h-1 bg-foreground/10 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-500",
                        isCompleted ? "w-full" : "w-0",
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

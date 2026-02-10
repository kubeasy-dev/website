"use client";

import { Check, LogIn, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCommandCopied } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { CLI_COMMANDS } from "./constants";
import { StatusIndicator } from "./status-indicator";
import { TerminalCommand } from "./terminal-command";
import { useOnboardingRealtime } from "./use-onboarding-realtime";

interface StepCliLoginProps {
  userId: string;
  isCompleted: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const INSTRUCTIONS = [
  { step: 1, text: "Run the command in your terminal" },
  { step: 2, text: "Paste your API token when prompted" },
  { step: 3, text: "This page updates automatically" },
];

/**
 * CLI login step for onboarding wizard.
 * Displays the login command and polls for authentication status.
 * Auto-advances to the next step when user successfully logs in.
 */
export function StepCliLogin({
  userId,
  isCompleted: initialCompleted,
  onContinue,
  onBack,
}: StepCliLoginProps) {
  const { isCompleted } = useOnboardingRealtime({
    userId,
    stepKey: "cliAuthenticated",
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
              isCompleted ? "bg-green-500/20" : "bg-primary/20",
            )}
          />
          <div
            className={cn(
              "relative p-4 neo-border-thick rounded-2xl transition-colors",
              isCompleted
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-zinc-800 to-zinc-900",
            )}
          >
            {isCompleted ? (
              <Check className="w-10 h-10 text-white" aria-hidden="true" />
            ) : (
              <LogIn className="w-10 h-10 text-green-400" aria-hidden="true" />
            )}
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-black">
          {isCompleted ? "CLI Connected!" : "Login to CLI"}
        </h2>
        <p className="text-lg text-foreground/70">
          {isCompleted
            ? "Your CLI is now connected to your account"
            : "Connect your CLI to your Kubeasy account"}
        </p>
      </div>

      {/* Terminal Command */}
      <TerminalCommand
        command={CLI_COMMANDS.login}
        onCopy={() =>
          trackCommandCopied(CLI_COMMANDS.login, "onboarding_cli_login")
        }
      />

      {/* Status Indicator */}
      <StatusIndicator
        isCompleted={isCompleted}
        completedTitle="Authenticated!"
        completedMessage="Your CLI is connected and ready"
        pendingTitle="Waiting for login..."
        pendingMessage="Run the command above and paste your token"
      />

      {/* Instructions */}
      {!isCompleted && (
        <div className="w-full">
          <h3 className="font-bold text-sm text-foreground/60 mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4" aria-hidden="true" />
            What happens
          </h3>
          <div className="grid gap-2">
            {INSTRUCTIONS.map((item) => (
              <div
                key={item.step}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                <span
                  className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center font-black text-xs"
                  aria-hidden="true"
                >
                  {item.step}
                </span>
                <span className="text-sm text-foreground/70">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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
          {isCompleted ? "Continue" : "Waiting for Login..."}
        </Button>
      </div>
    </div>
  );
}

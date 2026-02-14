"use client";

import { Check, HardDrive, Monitor, Server, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackCommandCopied } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { CLI_COMMANDS } from "./constants";
import { StatusIndicator } from "./status-indicator";
import { TerminalCommand } from "./terminal-command";
import { useOnboardingRealtime } from "./use-onboarding-realtime";

interface StepCliSetupProps {
  userId: string;
  isCompleted: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const PREREQUISITES = [
  { icon: Monitor, text: "Docker installed and running" },
  { icon: HardDrive, text: "At least 4GB of RAM available" },
  { icon: Wifi, text: "Internet connection for images" },
];

/**
 * CLI setup step for onboarding wizard.
 * Displays the init command and polls for cluster initialization status.
 */
export function StepCliSetup({
  userId,
  isCompleted: initialCompleted,
  onContinue,
  onBack,
}: StepCliSetupProps) {
  const { isCompleted } = useOnboardingRealtime({
    userId,
    stepKey: "clusterInitialized",
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
              isCompleted ? "bg-green-500/20" : "bg-accent/20",
            )}
          />
          <div
            className={cn(
              "relative p-4 neo-border-thick rounded-2xl transition-colors",
              isCompleted
                ? "bg-gradient-to-br from-green-500 to-green-600"
                : "bg-gradient-to-br from-accent/80 to-accent",
            )}
          >
            {isCompleted ? (
              <Check className="w-10 h-10 text-white" aria-hidden="true" />
            ) : (
              <Server
                className="w-10 h-10 text-accent-foreground"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-black">
          {isCompleted ? "Cluster Ready!" : "Setup Cluster"}
        </h2>
        <p className="text-lg text-foreground/70">
          {isCompleted
            ? "Your local Kubernetes cluster is running"
            : "Create a local Kubernetes cluster for challenges"}
        </p>
      </div>

      {/* Terminal Command */}
      <TerminalCommand
        command={CLI_COMMANDS.setup}
        onCopy={() =>
          trackCommandCopied(CLI_COMMANDS.setup, "onboarding_cli_setup")
        }
      />

      {/* Status Indicator */}
      <StatusIndicator
        isCompleted={isCompleted}
        completedTitle="Cluster Ready!"
        completedMessage="Your local Kubernetes cluster is up and running"
        pendingTitle="Setting up cluster..."
        pendingMessage="This may take a few minutes on first run"
      />

      {/* Prerequisites */}
      {!isCompleted && (
        <div className="w-full">
          <h3 className="font-bold text-sm text-foreground/60 mb-3">
            Prerequisites
          </h3>
          <div className="grid gap-2">
            {PREREQUISITES.map((item) => (
              <div
                key={item.text}
                className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg"
              >
                <div className="p-2 bg-accent/10 rounded-lg" aria-hidden="true">
                  <item.icon className="w-4 h-4 text-accent" />
                </div>
                <span className="text-sm font-medium text-foreground/80">
                  {item.text}
                </span>
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
          {isCompleted ? "Continue" : "Waiting for Setup..."}
        </Button>
      </div>
    </div>
  );
}

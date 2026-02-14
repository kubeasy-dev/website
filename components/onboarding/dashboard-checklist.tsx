"use client";

import {
  Check,
  ChevronRight,
  Circle,
  Key,
  Play,
  Server,
  Terminal,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardChecklistProps {
  steps: {
    hasApiToken: boolean;
    cliAuthenticated: boolean;
    clusterInitialized: boolean;
    hasStartedChallenge: boolean;
    hasCompletedChallenge: boolean;
  };
  currentStep: number;
}

const CHECKLIST_ITEMS = [
  {
    key: "cli_install",
    label: "Install CLI",
    description: "Get the Kubeasy CLI on your machine",
    icon: Terminal,
  },
  {
    key: "api_token",
    label: "Create Token",
    description: "Generate an API token for authentication",
    icon: Key,
  },
  {
    key: "cli_login",
    label: "Login CLI",
    description: "Connect CLI to your account",
    icon: Terminal,
  },
  {
    key: "cluster_init",
    label: "Setup Cluster",
    description: "Create your local Kubernetes cluster",
    icon: Server,
  },
  {
    key: "challenge_start",
    label: "Start Challenge",
    description: "Begin your first challenge",
    icon: Play,
  },
  {
    key: "challenge_complete",
    label: "Complete Challenge",
    description: "Solve and submit a challenge",
    icon: Trophy,
  },
];

export function DashboardChecklist({
  steps,
  currentStep,
}: DashboardChecklistProps) {
  // Map steps to checklist items
  const getStepCompleted = (key: string): boolean => {
    switch (key) {
      case "cli_install":
        return currentStep > 2;
      case "api_token":
        return steps.hasApiToken;
      case "cli_login":
        return steps.cliAuthenticated;
      case "cluster_init":
        return steps.clusterInitialized;
      case "challenge_start":
        return steps.hasStartedChallenge;
      case "challenge_complete":
        return steps.hasCompletedChallenge;
      default:
        return false;
    }
  };

  const completedCount = CHECKLIST_ITEMS.filter((item) =>
    getStepCompleted(item.key),
  ).length;
  const progressPercentage = Math.round(
    (completedCount / CHECKLIST_ITEMS.length) * 100,
  );

  return (
    <div className="bg-secondary neo-border-thick neo-shadow p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black">Getting Started</h2>
          <p className="text-sm text-foreground/60">
            Complete these steps to get the most out of Kubeasy
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-primary">
            {completedCount}/{CHECKLIST_ITEMS.length}
          </span>
          <p className="text-xs text-foreground/60">steps completed</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-foreground/10 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-3">
        {CHECKLIST_ITEMS.map((item) => {
          const isCompleted = getStepCompleted(item.key);
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg transition-colors",
                isCompleted ? "bg-primary/5" : "hover:bg-foreground/5",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground/10",
                )}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4 text-foreground/40" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-bold",
                    isCompleted && "text-foreground/60 line-through",
                  )}
                >
                  {item.label}
                </p>
                <p className="text-sm text-foreground/60 truncate">
                  {item.description}
                </p>
              </div>

              <Icon
                className={cn(
                  "w-5 h-5 shrink-0",
                  isCompleted ? "text-primary" : "text-foreground/30",
                )}
              />
            </div>
          );
        })}
      </div>

      {/* CTA */}
      {completedCount < CHECKLIST_ITEMS.length && (
        <Button
          asChild
          className="w-full mt-6 neo-border neo-shadow font-black"
        >
          <Link href="/onboarding">
            Continue Setup
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      )}
    </div>
  );
}

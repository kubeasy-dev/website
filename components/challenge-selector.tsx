"use client";

import { Check, ChevronDown, Clock } from "lucide-react";
import { useState } from "react";
import { DifficultyBadge } from "@/components/dificulty-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface StarterChallenge {
  slug: string;
  title: string;
  description: string;
  theme: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number;
}

interface ChallengeSelectorProps {
  challenges: StarterChallenge[];
  selectedSlug: string;
  onSelect: (slug: string) => void;
}

export function ChallengeSelector({
  challenges,
  selectedSlug,
  onSelect,
}: Readonly<ChallengeSelectorProps>) {
  const selectedChallenge = challenges.find((c) => c.slug === selectedSlug);

  if (challenges.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between neo-border font-bold h-auto py-3"
        >
          <div className="flex flex-col items-start gap-1">
            <span className="text-xs text-muted-foreground">
              Selected challenge
            </span>
            <span className="font-black">
              {selectedChallenge?.title ?? "Choose a challenge"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] neo-border">
        {challenges.map((challenge) => (
          <DropdownMenuItem
            key={challenge.slug}
            onClick={() => onSelect(challenge.slug)}
            className="flex flex-col items-start gap-2 p-3 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-bold">{challenge.title}</span>
              {challenge.slug === selectedSlug && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
              <Badge variant="secondary" className="text-xs">
                {challenge.theme}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {challenge.estimatedTime} min
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface GetStartedStepsProps {
  challenges: StarterChallenge[];
}

export function GetStartedSteps({
  challenges,
}: Readonly<GetStartedStepsProps>) {
  const [selectedSlug, setSelectedSlug] = useState(
    challenges[0]?.slug ?? "pod-crashloop",
  );

  const steps = [
    {
      number: 1,
      title: "Install the CLI",
      description: "Install the Kubeasy CLI globally using npm.",
      command: "npm install -g @kubeasy-dev/kubeasy-cli",
    },
    {
      number: 2,
      title: "Login to Kubeasy",
      description:
        "Authenticate with your API token to access challenges and track your progress. Generate a token from your profile page.",
      command: "kubeasy login",
    },
    {
      number: 3,
      title: "Set up your cluster",
      description:
        "Create a local Kind cluster with all necessary tools (ArgoCD, Kyverno).",
      command: "kubeasy setup",
    },
    {
      number: 4,
      title: "Start your first challenge",
      description: "Deploy a challenge and start debugging.",
      command: `kubeasy challenge start ${selectedSlug}`,
      hasSelector: true,
    },
    {
      number: 5,
      title: "Debug with kubectl",
      description: "Investigate the issue using standard Kubernetes tools.",
      command:
        "kubectl get pods\nkubectl describe pod <pod-name>\nkubectl logs <pod-name>",
      isMultiline: true,
    },
    {
      number: 6,
      title: "Submit your solution",
      description: "Once fixed, submit to validate and earn XP.",
      command: `kubeasy challenge submit ${selectedSlug}`,
    },
  ];

  return (
    <div className="space-y-6">
      {steps.map((step) => (
        <div
          key={step.number}
          className="bg-white border-4 border-black neo-shadow p-6"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-black text-lg border-2 border-black">
              {step.number}
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-xl font-black">{step.title}</h3>
              <p className="text-muted-foreground font-medium">
                {step.description}
              </p>
              {step.hasSelector && challenges.length > 0 && (
                <ChallengeSelector
                  challenges={challenges}
                  selectedSlug={selectedSlug}
                  onSelect={setSelectedSlug}
                />
              )}
              <div className="bg-foreground text-background p-4 rounded-lg neo-border font-mono text-sm overflow-x-auto">
                {step.isMultiline ? (
                  <pre className="whitespace-pre">{step.command}</pre>
                ) : (
                  <>
                    <span className="text-green-400">$</span> {step.command}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

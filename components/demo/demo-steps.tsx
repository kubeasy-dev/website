"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Key,
  Rocket,
  Terminal,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { trackCommandCopied } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface DemoStepsProps {
  token: string;
}

export function DemoSteps({ token }: Readonly<DemoStepsProps>) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopyCommand = (command: string, stepNumber: number) => {
    navigator.clipboard.writeText(command);
    setCopiedStep(stepNumber);
    trackCommandCopied(command, "demo_try_page", stepNumber);
    toast.success("Command copied to clipboard");
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    toast.success("Token copied to clipboard");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const steps = [
    {
      number: 1,
      title: "Install the CLI",
      description: "Install the Kubeasy CLI globally using npm.",
      command: "npm install -g @kubeasy-dev/kubeasy-cli",
      icon: Terminal,
      color: "primary",
      links: [
        {
          text: "Install npm",
          url: "https://docs.npmjs.com/downloading-and-installing-node-js-and-npm",
        },
      ],
    },
    {
      number: 2,
      title: "Start the Demo",
      description: "Sets up a local Kind cluster and creates a demo namespace.",
      command: `kubeasy demo start --token=${token}`,
      icon: Rocket,
      color: "accent",
    },
    {
      number: 3,
      title: "Create the nginx Pod",
      description: "Run a simple nginx pod in the demo namespace.",
      command: "kubectl run nginx --image=nginx -n demo",
      icon: Zap,
      color: "green",
    },
    {
      number: 4,
      title: "Submit Your Solution",
      description:
        "Validate that the pod is running and see your results update live.",
      command: "kubeasy demo submit",
      icon: ArrowRight,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center neo-border">
          <Terminal className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">
            Quick Start Guide
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Follow these steps to complete the demo
          </p>
        </div>
      </div>

      {/* Token Display */}
      <div className="relative overflow-hidden neo-border-thick neo-shadow bg-gradient-to-r from-amber-50 to-amber-100/50">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-amber-300/20 rounded-full blur-xl" />

        <div className="relative p-5">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center neo-border">
              <Key className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-amber-900 mb-1">
                Your Demo Token
              </h3>
              <p className="text-sm text-amber-700 font-medium">
                You'll need this token to start the demo challenge
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyToken}
            className={cn(
              "mt-4 w-full flex items-center justify-between gap-3 px-4 py-3 neo-border-thick font-mono text-sm transition-all",
              copiedToken
                ? "bg-green-500 text-white"
                : "bg-white hover:bg-amber-50 text-amber-900",
            )}
          >
            <span className="truncate font-bold">{token}</span>
            <span
              className={cn(
                "flex-shrink-0 flex items-center gap-2 font-sans font-black text-xs uppercase tracking-wide",
                copiedToken ? "text-white" : "text-amber-600",
              )}
            >
              {copiedToken ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </span>
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {!isLast && (
                <div className="absolute left-6 top-full w-0.5 h-4 bg-gray-200 z-0" />
              )}

              <div className="relative neo-border-thick neo-shadow bg-white overflow-hidden">
                {/* Step header */}
                <div
                  className={cn(
                    "flex items-center gap-4 p-5 border-b-2 border-foreground",
                    step.color === "primary" && "bg-primary/5",
                    step.color === "accent" && "bg-accent/10",
                    step.color === "green" && "bg-green-50",
                    step.color === "amber" && "bg-amber-50",
                  )}
                >
                  <div
                    className={cn(
                      "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center neo-border",
                      step.color === "primary" &&
                        "bg-primary text-primary-foreground",
                      step.color === "accent" && "bg-accent text-foreground",
                      step.color === "green" && "bg-green-500 text-white",
                      step.color === "amber" && "bg-amber-500 text-white",
                    )}
                  >
                    <span className="font-black text-lg">{step.number}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black">{step.title}</h3>
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          step.color === "primary" && "text-primary",
                          step.color === "accent" && "text-accent",
                          step.color === "green" && "text-green-500",
                          step.color === "amber" && "text-amber-500",
                        )}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Command block */}
                <div className="p-4 bg-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0 font-mono text-sm text-background overflow-x-auto">
                      <span className="text-green-400 mr-2">$</span>
                      <span className="whitespace-nowrap">{step.command}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyCommand(step.command, step.number)
                      }
                      className={cn(
                        "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-wide transition-all",
                        copiedStep === step.number
                          ? "bg-green-500 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white",
                      )}
                    >
                      {copiedStep === step.number ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Links */}
                {step.links && step.links.length > 0 && (
                  <div className="px-4 py-3 bg-secondary/30 border-t-2 border-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Resources:
                      </span>
                      {step.links.map((link) => (
                        <TrackedOutboundLink
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          linkType="docs"
                          location="demo_try_page"
                          className="inline-flex items-center gap-1.5 text-sm text-primary font-bold hover:underline"
                        >
                          {link.text}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </TrackedOutboundLink>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Prerequisites Note */}
      <div className="relative neo-border-thick bg-secondary p-5">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-foreground text-background rounded-lg flex items-center justify-center neo-border">
            <ChevronRight className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black mb-1">Prerequisites</h4>
            <p className="text-sm text-muted-foreground font-medium">
              <strong className="text-foreground">
                Docker must be running.
              </strong>{" "}
              The CLI will set up everything else automatically including a
              local Kubernetes cluster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

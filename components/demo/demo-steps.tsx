"use client";

import { Check, Copy, ExternalLink, Terminal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { trackCommandCopied } from "@/lib/analytics";

interface DemoStepsProps {
  token: string;
}

export function DemoSteps({ token }: Readonly<DemoStepsProps>) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const handleCopyCommand = (command: string, stepNumber: number) => {
    navigator.clipboard.writeText(command);
    setCopiedStep(stepNumber);
    trackCommandCopied(command, "demo_try_page", stepNumber);
    toast.success("Command copied to clipboard");
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard");
  };

  const steps = [
    {
      number: 1,
      title: "Install the CLI",
      description: "Install the Kubeasy CLI globally using npm.",
      command: "npm install -g @kubeasy-dev/kubeasy-cli",
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
      description:
        "This sets up a local Kind cluster and creates a demo namespace.",
      command: `kubeasy demo start --token=${token}`,
    },
    {
      number: 3,
      title: "Create the nginx Pod",
      description: "Run a simple nginx pod in the demo namespace.",
      command: "kubectl run nginx --image=nginx -n demo",
    },
    {
      number: 4,
      title: "Submit Your Solution",
      description:
        "Validate that the pod is running and see your results update above.",
      command: "kubeasy demo submit",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-black">Quick Start Guide</h2>
      </div>

      {/* Token Display */}
      <div className="bg-amber-50 neo-border-thick neo-shadow p-4 mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-800 mb-1">
              Your Demo Token
            </p>
            <p className="text-xs text-amber-700">
              Keep this token handy - you&apos;ll need it to start the demo
            </p>
          </div>
          <button
            type="button"
            onClick={handleCopyToken}
            className="flex items-center gap-2 px-3 py-2 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors font-mono text-sm font-bold text-amber-900"
          >
            <span className="truncate max-w-[120px] sm:max-w-none">
              {token}
            </span>
            <Copy className="h-4 w-4 flex-shrink-0" />
          </button>
        </div>
      </div>

      {steps.map((step) => (
        <div
          key={step.number}
          className="bg-white neo-border-thick neo-shadow p-5"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-black text-sm neo-border">
              {step.number}
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-black">{step.title}</h3>
              <p className="text-muted-foreground font-medium text-sm">
                {step.description}
              </p>
              {step.links && (
                <div className="flex flex-wrap gap-2">
                  {step.links.map((link) => (
                    <TrackedOutboundLink
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      linkType="docs"
                      location="demo_try_page"
                      className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
                    >
                      {link.text}
                      <ExternalLink className="h-3 w-3" />
                    </TrackedOutboundLink>
                  ))}
                </div>
              )}
              <div className="bg-foreground text-background p-3 rounded-lg neo-border font-mono text-sm overflow-x-auto flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="text-green-400">$</span> {step.command}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCommand(step.command, step.number)}
                  className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded transition-colors"
                  title="Copy command"
                >
                  {copiedStep === step.number ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Prerequisites Note */}
      <div className="bg-secondary/50 neo-border p-4 rounded-lg">
        <p className="text-sm font-bold text-muted-foreground">
          Prerequisites: Docker must be running. The CLI will set up everything
          else automatically.
        </p>
      </div>
    </div>
  );
}

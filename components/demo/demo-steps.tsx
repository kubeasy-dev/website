"use client";

import {
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Loader2,
  Rocket,
  Terminal,
  Zap,
} from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { TrackedOutboundLink } from "@/components/tracked-outbound-link";
import { trackCommandCopied } from "@/lib/analytics";
import { useRealtime } from "@/lib/realtime-client";
import { cn } from "@/lib/utils";

interface DemoStepsProps {
  token: string;
  onComplete: () => void;
}

const STEP_COLORS = {
  primary: {
    bg: "bg-primary",
    bgLight: "bg-primary/5",
    text: "text-primary",
    textOnBg: "text-primary-foreground",
  },
  accent: {
    bg: "bg-accent",
    bgLight: "bg-accent/10",
    text: "text-accent",
    textOnBg: "text-foreground",
  },
  green: {
    bg: "bg-green-500",
    bgLight: "bg-green-50",
    text: "text-green-500",
    textOnBg: "text-white",
  },
  amber: {
    bg: "bg-amber-500",
    bgLight: "bg-amber-50",
    text: "text-amber-500",
    textOnBg: "text-white",
  },
} as const;

type StepColor = keyof typeof STEP_COLORS;

export function DemoSteps({ token, onComplete }: Readonly<DemoStepsProps>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [copiedStep, setCopiedStep] = useState<number | null>(null);
  const [_copiedToken, setCopiedToken] = useState(false);
  const [waitingForEvent, setWaitingForEvent] = useState<number | null>(null);
  const [validationResult, setValidationResult] = useState<{
    passed: boolean;
    objectiveKey: string;
  } | null>(null);

  const steps = [
    {
      number: 1,
      title: "Install the CLI",
      description: "Install the Kubeasy CLI globally using npm.",
      command: "npm install -g @kubeasy-dev/kubeasy-cli",
      icon: Terminal,
      color: "primary" as StepColor,
      autoAdvance: true, // Auto-advance on copy
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
      color: "accent" as StepColor,
      eventType: "demo.started", // Wait for CLI event
    },
    {
      number: 3,
      title: "Create the nginx Pod",
      description: "Run a simple nginx pod in the demo namespace.",
      command: "kubectl run nginx --image=nginx -n demo",
      icon: Zap,
      color: "green" as StepColor,
      eventType: "demo.pod_created", // Wait for CLI event (or submit)
    },
    {
      number: 4,
      title: "Submit Your Solution",
      description:
        "Validate that the pod is running and see your results update live.",
      command: "kubeasy demo submit",
      icon: ArrowRight,
      color: "amber" as StepColor,
      eventType: "validation.update", // Wait for validation
    },
  ];

  // Listen for realtime events from the CLI
  useRealtime({
    enabled: !!token,
    channels: [`demo:${token}`],
    events: ["demo.started", "demo.pod_created", "validation.update"],
    onData(event) {
      const eventType = event.event;

      if (eventType === "demo.started") {
        // CLI started the demo - complete step 2, move to step 3
        setCompletedSteps((prev) => new Set([...prev, 0, 1]));
        setCurrentStep(2);
        setWaitingForEvent(null);
        toast.success("Demo started! Now create the nginx pod.");
      } else if (eventType === "demo.pod_created") {
        // Pod was created - complete step 3, move to step 4
        setCompletedSteps((prev) => new Set([...prev, 0, 1, 2]));
        setCurrentStep(3);
        setWaitingForEvent(null);
        toast.success("Pod created! Now submit your solution.");
      } else if (eventType === "validation.update") {
        // Validation received - complete step 4
        const data = event.data as { objectiveKey: string; passed: boolean };
        setValidationResult(data);
        setCompletedSteps((prev) => new Set([...prev, 0, 1, 2, 3]));
        setWaitingForEvent(null);

        if (data.passed) {
          // Success! Call onComplete after a short delay for animation
          setTimeout(() => onComplete(), 1500);
        }
      }
    },
  });

  const advanceToNextStep = useCallback(() => {
    setCompletedSteps((prev) => new Set([...prev, currentStep]));
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length]);

  const handleCopyCommand = (command: string, stepIndex: number) => {
    navigator.clipboard.writeText(command);
    setCopiedStep(stepIndex);
    trackCommandCopied(command, "demo_try_page", stepIndex + 1);

    const step = steps[stepIndex];

    if (step.autoAdvance) {
      // Step 1: auto-advance on copy
      toast.success("Command copied! Run it in your terminal.");
      setTimeout(() => {
        setCopiedStep(null);
        advanceToNextStep();
      }, 800);
    } else {
      // Other steps: show waiting state
      toast.success("Command copied! Waiting for completion...");
      setWaitingForEvent(stepIndex);
      setTimeout(() => setCopiedStep(null), 1500);
    }
  };

  const _handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    toast.success("Token copied to clipboard");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const goToStep = (index: number) => {
    // Allow going back to any step or forward to next uncompleted
    if (index <= currentStep || completedSteps.has(index - 1)) {
      setCurrentStep(index);
    }
  };

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="neo-border-thick neo-shadow bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center neo-border">
              <Terminal className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">
                Quick Start Guide
              </h2>
              <p className="text-sm text-muted-foreground font-medium">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-primary">
              {Math.round(progress)}%
            </div>
            <div className="text-xs font-bold text-muted-foreground uppercase">
              Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-secondary neo-border overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
          {/* Step markers */}
          <div className="absolute inset-0 flex">
            {steps.map((_, index) => (
              <div
                key={`marker-${steps[index].number}`}
                className="flex-1 flex items-center justify-end"
              >
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-full bg-foreground/20" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex mt-3 -mx-1">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.has(index);
            const isCurrent = index === currentStep;
            const colors = STEP_COLORS[step.color];

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => goToStep(index)}
                className={cn(
                  "flex-1 mx-1 py-2 px-1 text-center transition-all rounded-lg",
                  isCurrent && "neo-border bg-secondary",
                  !isCurrent && "hover:bg-secondary/50",
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent &&
                      !isCompleted &&
                      `${colors.bg} ${colors.textOnBg}`,
                    !isCurrent && !isCompleted && "bg-gray-200 text-gray-500",
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div
                  className={cn(
                    "text-xs font-bold mt-1 truncate",
                    isCurrent ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.title.split(" ")[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Step - Expanded */}
      {steps.map((step, index) => {
        const Icon = step.icon;
        const colors = STEP_COLORS[step.color];
        const isCompleted = completedSteps.has(index);
        const isCurrent = index === currentStep;

        if (!isCurrent && !isCompleted) return null;

        return (
          <div
            key={step.number}
            className={cn(
              "transition-all duration-300",
              isCurrent ? "opacity-100" : "opacity-70",
            )}
          >
            <div
              className={cn(
                "neo-border-thick overflow-hidden transition-all",
                isCurrent ? "neo-shadow bg-white" : "bg-secondary/50",
              )}
            >
              {/* Step header - clickable when collapsed */}
              <button
                type="button"
                onClick={() => goToStep(index)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 text-left transition-colors",
                  isCurrent
                    ? `${colors.bgLight} border-b-2 border-foreground`
                    : "hover:bg-secondary",
                )}
              >
                <div
                  className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center neo-border transition-colors",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent &&
                      !isCompleted &&
                      `${colors.bg} ${colors.textOnBg}`,
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="font-black">{step.number}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={cn(
                        "font-black",
                        isCurrent ? "text-lg" : "text-base",
                      )}
                    >
                      {step.title}
                    </h3>
                    <Icon className={cn("w-4 h-4", colors.text)} />
                    {isCompleted && (
                      <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Done
                      </span>
                    )}
                  </div>
                  {!isCurrent && (
                    <p className="text-sm text-muted-foreground font-medium truncate">
                      {step.description}
                    </p>
                  )}
                </div>
                {!isCurrent && (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Expanded content - only for current step */}
              {isCurrent && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <div className="px-4 pb-2 pt-2">
                    <p className="text-sm text-muted-foreground font-medium">
                      {step.description}
                    </p>
                  </div>

                  {/* Command block */}
                  <div className="p-4 bg-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0 font-mono text-sm text-background overflow-x-auto">
                        <span className="text-green-400 mr-2">$</span>
                        <span className="whitespace-nowrap">
                          {step.command}
                        </span>
                      </div>
                      {waitingForEvent === index ? (
                        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm bg-amber-500 text-white">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Waiting...
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCopyCommand(step.command, index)}
                          className={cn(
                            "flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide transition-all",
                            copiedStep === index
                              ? "bg-green-500 text-white"
                              : "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                        >
                          {copiedStep === index ? (
                            <>
                              <Check className="w-4 h-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              {step.autoAdvance ? "Copy & Continue" : "Copy"}
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    {/* Waiting hint */}
                    {waitingForEvent === index && (
                      <div className="mt-3 flex items-center justify-between text-xs text-white/70">
                        <span>Run the command in your terminal...</span>
                        <button
                          type="button"
                          onClick={advanceToNextStep}
                          className="underline hover:text-white"
                        >
                          Skip
                        </button>
                      </div>
                    )}
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
              )}
            </div>
          </div>
        );
      })}

      {/* Validation Result - shown when we receive validation */}
      {validationResult && (
        <div
          className={cn(
            "neo-border-thick neo-shadow p-6 text-center animate-in fade-in slide-in-from-bottom-4",
            validationResult.passed ? "bg-green-50" : "bg-amber-50",
          )}
        >
          <div
            className={cn(
              "w-16 h-16 mx-auto rounded-full flex items-center justify-center neo-border mb-4",
              validationResult.passed ? "bg-green-500" : "bg-amber-500",
            )}
          >
            {validationResult.passed ? (
              <Check className="w-8 h-8 text-white" />
            ) : (
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            )}
          </div>
          <h3
            className={cn(
              "text-xl font-black mb-2",
              validationResult.passed ? "text-green-800" : "text-amber-800",
            )}
          >
            {validationResult.passed
              ? "Validation Passed!"
              : "Pod Not Ready Yet"}
          </h3>
          <p
            className={cn(
              "text-sm font-medium",
              validationResult.passed ? "text-green-700" : "text-amber-700",
            )}
          >
            {validationResult.passed
              ? "Awesome! Your nginx pod is running. Redirecting..."
              : "Make sure the nginx pod is running, then submit again."}
          </p>
        </div>
      )}

      {/* Prerequisites Note */}
      <div className="neo-border bg-secondary/50 p-4 text-sm">
        <span className="font-bold">Prerequisites:</span>{" "}
        <span className="text-muted-foreground">
          Docker must be running. The CLI sets up everything else automatically.
        </span>
      </div>
    </div>
  );
}

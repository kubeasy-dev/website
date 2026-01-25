"use client";

import {
  CheckCircle2,
  Crosshair,
  PartyPopper,
  Radio,
  Shield,
  Target,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRealtime } from "@/lib/realtime-client";
import { cn } from "@/lib/utils";

interface DemoMissionProps {
  token: string;
  onComplete: () => void;
}

interface DemoObjective {
  id: string;
  title: string;
  description: string;
  category: string;
  passed: boolean | null;
}

// Hardcoded demo objectives (matches backend)
const INITIAL_OBJECTIVES: DemoObjective[] = [
  {
    id: "nginx-running",
    title: "Pod nginx is Running",
    description: "The nginx pod must be running in the demo namespace",
    category: "status",
    passed: null,
  },
];

export function DemoMission({ token, onComplete }: Readonly<DemoMissionProps>) {
  const [objectives, setObjectives] =
    useState<DemoObjective[]>(INITIAL_OBJECTIVES);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Subscribe to realtime updates for this demo token
  useRealtime({
    enabled: !!token,
    channels: [`demo:${token}`],
    events: ["validation.update"],
    onData(event) {
      // Type assertion for the validation update event
      const data = event.data as {
        objectiveKey: string;
        passed: boolean;
        timestamp: Date;
      };
      // Update the objective status
      setObjectives((prev) =>
        prev.map((obj) =>
          obj.id === data.objectiveKey ? { ...obj, passed: data.passed } : obj,
        ),
      );
      setLastUpdated(new Date());
    },
  });

  const isCompleted = objectives.every((obj) => obj.passed === true);
  const hasAnyResult = objectives.some((obj) => obj.passed !== null);
  const passedCount = objectives.filter((obj) => obj.passed === true).length;
  const totalCount = objectives.length;

  // Call onComplete when all objectives are completed
  useEffect(() => {
    if (isCompleted) {
      onComplete();
    }
  }, [isCompleted, onComplete]);

  return (
    <div className="relative">
      {/* Main Card */}
      <div className="relative neo-border-thick neo-shadow-xl bg-white overflow-hidden">
        {/* Header with game-style treatment */}
        <div className="relative bg-foreground text-background p-5">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-accent/20 rounded-full blur-xl" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center neo-border">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-black text-lg tracking-tight">
                  Mission Objectives
                </h3>
                <p className="text-xs font-medium opacity-70">
                  Complete all to succeed
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-2xl font-black">
                  {passedCount}/{totalCount}
                </div>
                <div className="text-xs font-medium opacity-70">Completed</div>
              </div>
              <div
                className="w-12 h-12 relative"
                role="img"
                aria-label={`Progress: ${passedCount} of ${totalCount} completed`}
              >
                <svg className="w-full h-full -rotate-90" aria-hidden="true">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-20"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${(passedCount / totalCount) * 125.6} 125.6`}
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                {isCompleted && (
                  <CheckCircle2 className="absolute inset-0 m-auto w-6 h-6 text-green-400" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Success Message */}
          {isCompleted && (
            <div className="relative overflow-hidden neo-border-thick bg-green-500 text-white p-4 animate-in fade-in slide-in-from-top-2">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <PartyPopper className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-black text-lg">Mission Accomplished!</p>
                  <p className="text-sm font-medium opacity-90">
                    You've completed the demo challenge.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Objectives List */}
          <div className="space-y-3">
            {objectives.map((obj, index) => (
              <div
                key={obj.id}
                className={cn(
                  "relative neo-border-thick p-4 transition-all duration-300",
                  obj.passed === true
                    ? "bg-green-50 border-green-500"
                    : obj.passed === false
                      ? "bg-red-50 border-red-500"
                      : "bg-secondary",
                )}
              >
                {/* Objective number badge */}
                <div
                  className={cn(
                    "absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black neo-border",
                    obj.passed === true
                      ? "bg-green-500 text-white"
                      : obj.passed === false
                        ? "bg-red-500 text-white"
                        : "bg-foreground text-background",
                  )}
                >
                  {obj.passed === true ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : obj.passed === false ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>

                <div className="ml-4">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-black">{obj.title}</h4>
                    <span
                      className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide",
                        obj.category === "status" &&
                          "bg-blue-100 text-blue-700",
                        obj.category === "log" && "bg-amber-100 text-amber-700",
                        obj.category === "event" &&
                          "bg-purple-100 text-purple-700",
                      )}
                    >
                      {obj.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {obj.description}
                  </p>

                  {/* Status indicator */}
                  {obj.passed !== null && (
                    <div
                      className={cn(
                        "mt-2 flex items-center gap-2 text-sm font-bold",
                        obj.passed ? "text-green-600" : "text-red-600",
                      )}
                    >
                      {obj.passed ? (
                        <>
                          <Shield className="w-4 h-4" />
                          Validation passed
                        </>
                      ) : (
                        <>
                          <Crosshair className="w-4 h-4" />
                          Not yet completed
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Last Updated */}
          {lastUpdated && hasAnyResult && (
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground font-medium">
              <Radio className="w-3 h-3" />
              Last update: {lastUpdated.toLocaleTimeString()}
            </div>
          )}

          {/* Waiting State */}
          {!hasAnyResult && (
            <div className="neo-border bg-secondary/50 p-4">
              <div className="flex items-center justify-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary rounded-full animate-ping absolute" />
                  <div className="w-3 h-3 bg-primary rounded-full relative" />
                </div>
                <span className="font-bold text-muted-foreground">
                  Waiting for your submission...
                </span>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Run{" "}
                <code className="px-2 py-0.5 bg-foreground text-background rounded font-mono text-xs">
                  kubeasy demo submit
                </code>{" "}
                to validate
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Shadow offset element */}
      <div className="absolute inset-0 neo-border-thick bg-primary/10 -z-10 translate-x-2 translate-y-2" />
    </div>
  );
}

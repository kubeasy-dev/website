"use client";

import { CheckCircle2, Circle, PartyPopper, Target } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRealtime } from "@/lib/realtime-client";
import { cn } from "@/lib/utils";

interface DemoMissionProps {
  token: string;
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

export function DemoMission({ token }: Readonly<DemoMissionProps>) {
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

  return (
    <Card className="neo-border-thick neo-shadow-xl bg-secondary">
      <CardHeader>
        <CardTitle className="text-xl font-black flex items-center gap-3">
          <Target className="h-5 w-5" />
          Your Mission
          <span className="ml-auto text-sm font-bold">
            {passedCount}/{totalCount}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Message */}
        {isCompleted && (
          <div className="bg-green-50 neo-border-thick rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <PartyPopper className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-green-900">
                  Congratulations! Demo completed!
                </p>
                <p className="text-sm text-green-700">
                  Sign up to unlock 30+ more challenges.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Objectives List */}
        <div className="space-y-2">
          {objectives.map((obj) => (
            <div
              key={obj.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg neo-border transition-colors",
                obj.passed === true
                  ? "bg-green-50"
                  : obj.passed === false
                    ? "bg-red-50"
                    : "bg-white",
              )}
            >
              {obj.passed === true ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : obj.passed === false ? (
                <Circle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-sm">{obj.title}</p>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                    {obj.category}
                  </span>
                </div>
                <p className="text-xs text-foreground/70 mt-1">
                  {obj.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Last Updated */}
        {lastUpdated && hasAnyResult && (
          <p className="text-xs text-muted-foreground text-right font-medium">
            Updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {/* Waiting State */}
        {!hasAnyResult && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </div>
              <span className="text-sm font-medium">
                Waiting for your submission...
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

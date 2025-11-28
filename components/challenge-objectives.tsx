"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Loader2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { Objective, ObjectiveCategory } from "@/types/cli-api";

interface ChallengeObjectivesProps {
  slug: string;
}

const CATEGORY_LABELS: Record<ObjectiveCategory, string> = {
  status: "Status Validation",
  log: "Log Validation",
  event: "Event Validation",
  metrics: "Metrics Validation",
  rbac: "RBAC Validation",
  connectivity: "Connectivity Validation",
};

// Group objectives by category
function groupByCategory(
  objectives: Objective[],
): Record<ObjectiveCategory, Objective[]> {
  return objectives.reduce(
    (acc, obj) => {
      if (!acc[obj.category]) {
        acc[obj.category] = [];
      }
      acc[obj.category].push(obj);
      return acc;
    },
    {} as Record<ObjectiveCategory, Objective[]>,
  );
}

export function ChallengeObjectives({ slug }: ChallengeObjectivesProps) {
  const trpc = useTRPC();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Poll every 5 seconds for real-time updates
  const { data: validationStatus, isLoading } = useQuery({
    ...trpc.userProgress.getLatestValidationStatus.queryOptions({ slug }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const toggleExpanded = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-secondary">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading Objectives...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!validationStatus?.hasSubmission || !validationStatus.objectives) {
    return (
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-secondary">
        <CardHeader>
          <CardTitle className="text-2xl font-black">Objectives</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base font-medium text-muted-foreground">
            Submit your solution to see validation objectives.
          </p>
          <div className="mt-4 bg-black text-green-400 p-4 rounded-lg border-4 border-black font-mono text-sm">
            <div>
              <span className="text-gray-500">$</span> kubeasy challenge submit{" "}
              {slug}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const objectives = validationStatus.objectives as Objective[];
  const groupedObjectives = groupByCategory(objectives);
  const categories = Object.keys(groupedObjectives) as ObjectiveCategory[];

  // Calculate overall progress
  const totalObjectives = objectives.length;
  const passedObjectives = objectives.filter((obj) => obj.passed).length;
  const allPassed = totalObjectives > 0 && passedObjectives === totalObjectives;

  return (
    <Card
      className={cn(
        "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        allPassed ? "bg-green-100" : "bg-secondary",
      )}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-black flex items-center gap-3">
          {allPassed ? (
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          ) : (
            <Circle className="h-6 w-6" />
          )}
          Objectives
          <span className="ml-auto text-base font-bold">
            {passedObjectives}/{totalObjectives} passed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.length === 0 && (
          <p className="text-base font-medium text-muted-foreground">
            No validations configured for this challenge.
          </p>
        )}

        {categories.map((category) => {
          const categoryObjectives = groupedObjectives[category] || [];
          const categoryLabel = CATEGORY_LABELS[category] || category;
          const isExpanded = expandedCategories.has(category);
          const allCategoryPassed = categoryObjectives.every(
            (obj) => obj.passed,
          );

          return (
            <div
              key={category}
              className="border-4 border-black rounded-lg overflow-hidden bg-card"
            >
              {/* Category Header */}
              <button
                type="button"
                onClick={() => toggleExpanded(category)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                {allCategoryPassed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="font-bold text-lg">{categoryLabel}</span>
                <span className="ml-auto text-sm font-medium">
                  {categoryObjectives.filter((obj) => obj.passed).length}/
                  {categoryObjectives.length}
                </span>
              </button>

              {/* Objective Items */}
              {isExpanded && (
                <div className="border-t-4 border-black bg-muted/50">
                  {categoryObjectives.map((objective) => (
                    <div
                      key={objective.id}
                      className="px-4 py-3 border-b-2 border-border last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        {objective.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold">{objective.name}</p>
                          {objective.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {objective.description}
                            </p>
                          )}
                          {objective.message && (
                            <p
                              className={cn(
                                "text-sm mt-2 font-medium",
                                objective.passed
                                  ? "text-green-700"
                                  : "text-destructive",
                              )}
                            >
                              {objective.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Last Updated */}
        {validationStatus.timestamp && (
          <p className="text-xs text-muted-foreground text-right font-medium">
            Last updated:{" "}
            {new Date(validationStatus.timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

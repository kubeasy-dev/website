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

interface ChallengeObjectivesProps {
  slug: string;
}

interface ValidationItem {
  name: string;
  passed: boolean;
  details?: string[];
  rawStatus?: Record<string, unknown>;
}

interface ValidationData {
  [key: string]: ValidationItem[];
}

const VALIDATION_TYPE_LABELS: Record<string, string> = {
  logvalidations: "Log Validation",
  statusvalidations: "Status Validation",
  eventvalidations: "Event Validation",
  metricsvalidations: "Metrics Validation",
  rbacvalidations: "RBAC Validation",
  connectivityvalidations: "Connectivity Validation",
};

export function ChallengeObjectives({ slug }: ChallengeObjectivesProps) {
  const trpc = useTRPC();
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());

  // Poll every 5 seconds for real-time updates
  const { data: validationStatus, isLoading } = useQuery({
    ...trpc.userProgress.getLatestValidationStatus.queryOptions({ slug }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const toggleExpanded = (type: string) => {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
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

  if (!validationStatus?.hasSubmission || !validationStatus.validations) {
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

  const validations = validationStatus.validations as ValidationData;
  const validationTypes = Object.keys(validations);

  // Calculate overall progress
  const totalValidations = validationTypes.reduce(
    (sum, type) => sum + (validations[type]?.length || 0),
    0,
  );
  const passedValidations = validationTypes.reduce(
    (sum, type) =>
      sum +
      (validations[type]?.filter((v: ValidationItem) => v.passed).length || 0),
    0,
  );
  const allPassed =
    totalValidations > 0 && passedValidations === totalValidations;

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
            {passedValidations}/{totalValidations} passed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationTypes.length === 0 && (
          <p className="text-base font-medium text-muted-foreground">
            No validations configured for this challenge.
          </p>
        )}

        {validationTypes.map((type) => {
          const typeValidations = validations[type] || [];
          const typeLabel = VALIDATION_TYPE_LABELS[type] || type;
          const isExpanded = expandedTypes.has(type);
          const allTypePassed = typeValidations.every((v) => v.passed);

          return (
            <div
              key={type}
              className="border-4 border-black rounded-lg overflow-hidden bg-card"
            >
              {/* Type Header */}
              <button
                type="button"
                onClick={() => toggleExpanded(type)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
                {allTypePassed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="font-bold text-lg">{typeLabel}</span>
                <span className="ml-auto text-sm font-medium">
                  {typeValidations.filter((v) => v.passed).length}/
                  {typeValidations.length}
                </span>
              </button>

              {/* Validation Items */}
              {isExpanded && (
                <div className="border-t-4 border-black bg-muted/50">
                  {typeValidations.map((validation, idx) => (
                    <div
                      key={`${type}-${validation.name}-${idx}`}
                      className="px-4 py-3 border-b-2 border-border last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        {validation.passed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="font-bold">{validation.name}</p>
                          {validation.details &&
                            validation.details.length > 0 && (
                              <ul className="mt-2 space-y-1 text-sm text-muted-foreground font-medium">
                                {validation.details.map((detail, detailIdx) => (
                                  <li
                                    key={detailIdx}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-xs mt-1">•</span>
                                    <span>{detail}</span>
                                  </li>
                                ))}
                              </ul>
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

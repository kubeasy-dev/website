"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  Target,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { SubmissionItem } from "./challenge-status/submission-item";

interface ChallengeMissionProps {
  slug: string;
  objective: string;
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

const VALIDATION_TYPE_COLORS: Record<string, string> = {
  logvalidations: "bg-blue-50 border-blue-500",
  statusvalidations: "bg-purple-50 border-purple-500",
  eventvalidations: "bg-orange-50 border-orange-500",
  metricsvalidations: "bg-green-50 border-green-500",
  rbacvalidations: "bg-red-50 border-red-500",
  connectivityvalidations: "bg-cyan-50 border-cyan-500",
};

export function ChallengeMission({ slug, objective }: ChallengeMissionProps) {
  const trpc = useTRPC();
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const [showHistory, setShowHistory] = useState(false);

  // Poll every 5 seconds for real-time updates
  const { data: validationStatus, isLoading } = useQuery({
    ...trpc.userProgress.getLatestValidationStatus.queryOptions({ slug }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  // Fetch submissions for history modal
  const { data: submissionsData } = useQuery({
    ...trpc.userProgress.getSubmissions.queryOptions({ slug }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  // Fetch challenge status to determine if it's started or not
  const { data: statusData } = useQuery({
    ...trpc.userProgress.getStatus.queryOptions({ slug }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const status = statusData?.status ?? "not_started";

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

  const hasSubmission =
    validationStatus?.hasSubmission && validationStatus.validations;
  const validations = hasSubmission
    ? (validationStatus.validations as ValidationData)
    : null;
  const validationTypes = validations
    ? Object.keys(validations).filter(
        (type) =>
          VALIDATION_TYPE_LABELS[type] && Array.isArray(validations[type]),
      )
    : [];

  // Calculate overall progress
  const totalValidations = validationTypes.reduce(
    (sum, type) => sum + (validations?.[type]?.length || 0),
    0,
  );
  const passedValidations = validationTypes.reduce(
    (sum, type) =>
      sum +
      (validations?.[type]?.filter((v: ValidationItem) => v.passed).length ||
        0),
    0,
  );
  const allPassed =
    totalValidations > 0 && passedValidations === totalValidations;

  // Determine if challenge is completed
  const isCompleted = status === "completed";

  return (
    <Card
      className={cn(
        "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
        allPassed ? "bg-green-100" : "bg-secondary",
      )}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-black flex items-center gap-3">
          <Target className="h-6 w-6" />
          Your Mission
          {totalValidations > 0 && (
            <span className="ml-auto text-base font-bold">
              {passedValidations}/{totalValidations} passed
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mission Description */}
        <p className="font-medium whitespace-pre-line">{objective}</p>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm font-medium">
              Loading validation status...
            </span>
          </div>
        )}

        {/* Success Message - only when completed */}
        {(() => {
          if (!isCompleted) return null;
          return (
            <div className="bg-green-50 border-4 border-green-600 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <p className="font-bold text-green-900">
                  Congratulations! You've successfully completed this challenge.
                </p>
              </div>
            </div>
          );
        })()}

        {/* CLI Commands - Always visible */}
        <div className="space-y-3">
          {isCompleted ? (
            <>
              <p className="text-sm font-bold">Clean up the resources with:</p>
              <div className="bg-black text-green-400 p-3 rounded-lg border-4 border-black font-mono text-sm">
                <span className="text-gray-500">$</span> kubeasy challenge clean{" "}
                {slug}
              </div>
            </>
          ) : status === "not_started" ? (
            <>
              <p className="text-sm font-bold">
                Start this challenge in your local Kubernetes cluster:
              </p>
              <div className="bg-black text-green-400 p-3 rounded-lg border-4 border-black font-mono text-sm">
                <span className="text-gray-500">$</span> kubeasy challenge start{" "}
                {slug}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm font-bold">
                Work on this challenge in your local Kubernetes cluster:
              </p>
              <div className="bg-black text-green-400 p-3 rounded-lg border-4 border-black font-mono text-sm">
                <span className="text-gray-500">$</span> kubeasy challenge
                submit {slug}
              </div>
            </>
          )}

          {/* History button - only show if there are submissions */}
          {submissionsData && submissionsData.submissions.length > 0 && (
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-black font-bold"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  View History ({submissionsData.submissions.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto border-4 border-black">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black">
                    Submission History
                  </DialogTitle>
                  <DialogDescription>
                    Previous attempts for this challenge
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 mt-4">
                  {submissionsData.submissions.map((submission) => (
                    <SubmissionItem
                      key={submission.id}
                      submission={submission}
                    />
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* No submission yet message */}
        {!isLoading && !hasSubmission && (
          <p className="text-sm font-medium text-muted-foreground">
            Submit your solution to see validation progress.
          </p>
        )}

        {/* Validation Objectives */}
        {!isLoading && hasSubmission && validationTypes.length > 0 && (
          <div className="space-y-3">
            {validationTypes.map((type) => {
              const typeValidations = validations?.[type] || [];
              const typeLabel = VALIDATION_TYPE_LABELS[type] || type;
              const typeColor =
                VALIDATION_TYPE_COLORS[type] || "bg-gray-50 border-gray-500";
              const isExpanded = expandedTypes.has(type);
              const allTypePassed = typeValidations.every((v) => v.passed);
              const passedCount = typeValidations.filter(
                (v) => v.passed,
              ).length;

              return (
                <div
                  key={type}
                  className={cn(
                    "rounded-lg border-4 border-black overflow-hidden",
                    typeColor,
                  )}
                >
                  {/* Type Header */}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(type)}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                    {allTypePassed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-bold text-lg">{typeLabel}</span>
                    <span className="ml-auto text-sm font-medium">
                      {passedCount}/{typeValidations.length}
                    </span>
                  </button>

                  {/* Validation Items */}
                  {isExpanded && (
                    <div className="border-t-4 border-black bg-white/50">
                      {typeValidations.map((validation, idx) => (
                        <div
                          key={`${type}-${validation.name}-${idx}`}
                          className="px-4 py-3 border-b-2 border-border last:border-b-0"
                        >
                          <div className="flex items-start gap-3">
                            {validation.passed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="font-bold">{validation.name}</p>
                              {validation.details &&
                                validation.details.length > 0 && (
                                  <ul className="mt-2 space-y-1 text-sm text-foreground/70 font-medium">
                                    {validation.details.map(
                                      (detail, detailIdx) => (
                                        <li
                                          key={detailIdx}
                                          className="flex items-start gap-2"
                                        >
                                          <span className="text-xs mt-1">
                                            •
                                          </span>
                                          <span>{detail}</span>
                                        </li>
                                      ),
                                    )}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

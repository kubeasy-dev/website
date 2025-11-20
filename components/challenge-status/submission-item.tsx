"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionItemProps {
  submission: {
    id: string;
    timestamp: Date;
    validated: boolean;
    validations: unknown;
    // Legacy fields
    staticValidation: boolean | null;
    dynamicValidation: boolean | null;
    payload: unknown;
  };
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

export function SubmissionItem({ submission }: SubmissionItemProps) {
  // Use new validations structure if available, fallback to legacy
  const validations = (submission.validations ||
    submission.payload) as ValidationData;
  // Filter to only include valid validation type keys (those that are arrays)
  const validationTypes = Object.keys(validations || {}).filter(
    (type) => VALIDATION_TYPE_LABELS[type] && Array.isArray(validations[type]),
  );

  // Calculate overall stats
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
  const score =
    totalValidations > 0
      ? Math.round((passedValidations / totalValidations) * 100)
      : 0;

  const allPassed = submission.validated;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border-4 border-black bg-white",
        "flex items-center justify-between gap-4",
      )}
    >
      {/* Left: Status and Time */}
      <div className="flex items-center gap-3">
        {allPassed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
        )}
        <div>
          <p className="font-bold text-sm">{allPassed ? "Passed" : "Failed"}</p>
          <p className="text-xs text-foreground/60 font-medium">
            {new Date(submission.timestamp).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Right: Score */}
      {totalValidations > 0 && (
        <div className="text-right">
          <div className="text-2xl font-black">{score}%</div>
          <div className="text-xs text-foreground/60 font-medium">
            {passedValidations}/{totalValidations}
          </div>
        </div>
      )}
    </div>
  );
}

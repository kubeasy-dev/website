"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Objective {
  id: string;
  name: string;
  description?: string;
  passed: boolean;
  category: string;
  message: string;
}

interface SubmissionItemProps {
  submission: {
    id: string;
    timestamp: Date;
    validated: boolean;
    objectives: unknown; // Array of Objective
  };
}

export function SubmissionItem({ submission }: SubmissionItemProps) {
  const objectives = (submission.objectives || []) as Objective[];

  // Calculate stats
  const totalObjectives = objectives.length;
  const passedObjectives = objectives.filter((obj) => obj.passed).length;
  const score =
    totalObjectives > 0
      ? Math.round((passedObjectives / totalObjectives) * 100)
      : 0;

  const allPassed = submission.validated;

  return (
    <div
      className={cn(
        "p-4 rounded-lg neo-border-thick bg-white",
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
      {totalObjectives > 0 && (
        <div className="text-right">
          <div className="text-2xl font-black">{score}%</div>
          <div className="text-xs text-foreground/60 font-medium">
            {passedObjectives}/{totalObjectives}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Check, CheckCircle2, Copy, XCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmissionItemProps {
  submission: {
    id: string;
    timestamp: Date;
    staticValidation: boolean;
    dynamicValidation: boolean;
    payload: unknown;
  };
}

interface ValidationCheck {
  name: string;
  resourceType: string;
  resourceName: string;
  passed: boolean;
  message: string;
}

export function SubmissionItem({ submission }: SubmissionItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(
      JSON.stringify(submission.payload, null, 2),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse payload for detailed checks
  const payload = submission.payload as {
    staticValidations?: Record<
      string,
      Array<{
        allPassed: boolean;
        resources: Array<{
          target: {
            apiVersion: string;
            kind: string;
            name: string;
          };
          ruleResults: Array<{
            rule: string;
            status: string;
            message: string;
          }>;
        }>;
      }>
    >;
    dynamicValidations?: Record<
      string,
      Array<{
        allPassed: boolean;
        resources: Array<{
          target: {
            apiVersion: string;
            kind: string;
            name: string;
          };
          checkResults: Array<{
            kind: string;
            status: string;
            message: string;
          }>;
        }>;
      }>
    >;
  };

  // Extract all checks from payload
  const staticChecks: ValidationCheck[] = [];
  const dynamicChecks: ValidationCheck[] = [];

  if (payload.staticValidations) {
    Object.entries(payload.staticValidations).forEach(
      ([validationName, valArray]) => {
        valArray.forEach((val) => {
          if (val.resources) {
            val.resources.forEach((resource) => {
              if (resource.ruleResults) {
                resource.ruleResults.forEach((ruleResult) => {
                  staticChecks.push({
                    name:
                      ruleResult.rule.replace(".rego", "") || validationName,
                    resourceType: resource.target.kind,
                    resourceName: resource.target.name,
                    passed: ruleResult.status === "Pass",
                    message: ruleResult.message,
                  });
                });
              }
            });
          }
        });
      },
    );
  }

  if (payload.dynamicValidations) {
    Object.entries(payload.dynamicValidations).forEach(
      ([validationName, valArray]) => {
        valArray.forEach((val) => {
          if (val.resources) {
            val.resources.forEach((resource) => {
              if (resource.checkResults) {
                resource.checkResults.forEach((checkResult) => {
                  dynamicChecks.push({
                    name: checkResult.kind || validationName || "Dynamic Check",
                    resourceType: resource.target.kind,
                    resourceName: resource.target.name,
                    passed: checkResult.status === "Pass",
                    message: checkResult.message,
                  });
                });
              }
            });
          }
        });
      },
    );
  }

  // Calculate score
  const totalChecks = staticChecks.length + dynamicChecks.length;
  const passedChecks =
    staticChecks.filter((c) => c.passed).length +
    dynamicChecks.filter((c) => c.passed).length;
  const score =
    totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  const allPassed = submission.staticValidation && submission.dynamicValidation;

  return (
    <div className="p-6 rounded-lg border-4 border-black space-y-4 bg-white text-black">
      {/* Submission Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {allPassed ? (
              <CheckCircle2 className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
            )}
            <h4 className="text-xl font-black">
              {allPassed ? "Validation Passed" : "Validation Failed"}
            </h4>
          </div>
          <p className="text-sm text-foreground/60 font-medium">
            {new Date(submission.timestamp).toLocaleString()}
          </p>
        </div>
        {totalChecks > 0 && (
          <div className="text-right">
            <div className="text-3xl font-black">{score}%</div>
            <div className="text-sm text-foreground/60 font-bold">
              {passedChecks}/{totalChecks} checks passed
            </div>
          </div>
        )}
      </div>

      {/* Validation Details */}
      {totalChecks > 0 && (
        <div className="space-y-3">
          {/* Static Validation Details */}
          {staticChecks.map((check) => (
            <div
              key={`static-${check.name}-${check.resourceName}`}
              className={cn(
                "p-4 rounded-lg border-4 border-black",
                check.passed ? "bg-green-500/10" : "bg-red-500/10",
              )}
            >
              <div className="flex items-start gap-3">
                {check.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold">{check.name}</p>
                    <Badge
                      variant="outline"
                      className="border-2 border-black text-xs font-bold uppercase"
                    >
                      STATIC
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/60 mb-1">
                    {check.resourceType} '{check.resourceName}'
                  </p>
                  <p className="text-sm font-medium text-foreground/80">
                    {check.message}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Dynamic Validation Details */}
          {dynamicChecks.map((check) => (
            <div
              key={`dynamic-${check.name}-${check.resourceName}`}
              className={cn(
                "p-4 rounded-lg border-4 border-black",
                check.passed ? "bg-green-500/10" : "bg-red-500/10",
              )}
            >
              <div className="flex items-start gap-3">
                {check.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p className="font-bold">{check.name}</p>
                    <Badge
                      variant="outline"
                      className="border-2 border-black text-xs font-bold uppercase"
                    >
                      DYNAMIC
                    </Badge>
                  </div>
                  <p className="text-xs text-foreground/60 mb-1">
                    {check.resourceType} '{check.resourceName}'
                  </p>
                  <p className="text-sm font-medium text-foreground/80">
                    {check.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw Payload */}
      <details className="mt-4">
        <summary className="cursor-pointer font-bold text-sm hover:text-primary">
          View Raw JSON
        </summary>
        <div className="mt-2 relative">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyJson}
            className="absolute top-2 right-2 border-2 border-black z-10"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </>
            )}
          </Button>
          <pre className="p-4 bg-black text-green-400 rounded-lg border-4 border-black font-mono text-xs overflow-x-auto">
            {JSON.stringify(submission.payload, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}

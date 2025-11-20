"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { SubmissionItem } from "./submission-item";

interface InProgressProps {
  slug: string;
  objective: string;
}

export function InProgress({ slug, objective }: InProgressProps) {
  const trpc = useTRPC();

  // Fetch submissions
  const { data: submissionsData } = useQuery({
    ...trpc.userProgress.getSubmissions.queryOptions({ slug }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const submissions = submissionsData?.submissions ?? [];
  const hasSubmissions = submissions.length > 0;

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-primary text-primary-foreground">
      <CardHeader>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6" />
          <CardTitle className="text-2xl font-black">
            Challenge In Progress
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-base font-medium">
            Work on solving this challenge in your local Kubernetes cluster.
          </p>
          <div className="bg-black text-green-400 p-4 rounded-lg border-4 border-black font-mono text-sm space-y-2">
            <div>
              <span className="text-gray-500">$</span> kubeasy challenge submit{" "}
              {slug}
            </div>
          </div>
        </div>

        {/* Submissions Section */}
        {hasSubmissions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">Recent Submissions</h3>
              <span className="text-sm font-bold">
                {submissions.length} total
              </span>
            </div>

            <div className="space-y-2">
              {submissions.map((submission) => (
                <SubmissionItem key={submission.id} submission={submission} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

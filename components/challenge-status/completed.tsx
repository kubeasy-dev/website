"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";
import { SubmissionItem } from "./submission-item";

interface CompletedProps {
  slug: string;
}

export function Completed({ slug }: CompletedProps) {
  const trpc = useTRPC();

  // Fetch submissions
  const { data: submissionsData } = useQuery({
    ...trpc.userProgress.getSubmissions.queryOptions({ slug }),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });

  const submissions = submissionsData?.submissions ?? [];

  return (
    <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-primary text-primary-foreground">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6" />
          <CardTitle className="text-2xl font-black">
            Challenge Completed!
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-base font-medium">
          Congratulations! You've successfully completed this challenge. You can
          clean up the resources with:
        </p>
        <div className="bg-black text-green-400 p-4 rounded-lg border-4 border-black font-mono text-sm">
          <span className="text-gray-500">$</span> kubeasy challenge clean{" "}
          {slug}
        </div>

        {/* Submissions Section */}
        {submissions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black">Submission History</h3>
              <span className="text-sm font-bold">
                {submissions.length} total
              </span>
            </div>

            <div className="space-y-4">
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

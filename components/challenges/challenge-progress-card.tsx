"use client";

import React, { useState, useEffect } from "react";
import { Challenge, UserProgress } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useSupabase from "@/hooks/use-supabase";
import { useQuery, useRevalidateTables, useSubscription } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { ChallengeProgressDetailsCard } from "./challenge-progress-details-card";
import { useUser } from "@/hooks/use-user";
import Loading from "../loading";
import { ChallengeCompletionDialog } from "./challenge-completion-dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Terminal } from "../terminal";

export default function ChallengeProgressCard({ challenge }: Readonly<{ challenge: Challenge }>) {
  const supabase = useSupabase();
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);
  const { data: user, isLoading: userLoading } = useUser();
  const { data: initialProgress, isLoading: progressLoading } = useQuery(queries.userProgress.get(supabase, { challengeId: challenge.id }), {
    enabled: !!user,
  });

  const [currentProgress, setCurrentProgress] = useState<UserProgress | null | undefined>(initialProgress);

  useEffect(() => {
    setCurrentProgress(initialProgress);
  }, [initialProgress]);

  const channelName = currentProgress?.composite_key ? `user_progress_${currentProgress.composite_key}` : "user_progress_disabled";
  const subscriptionFilter = currentProgress?.composite_key ? `composite_key=eq.${currentProgress.composite_key}` : undefined;

  const revalidateView = useRevalidateTables([{ schema: "public", table: "challenge_progress" }]);

  const { status: subscriptionStatus } = useSubscription(
    supabase,
    channelName,
    {
      event: "*",
      table: "user_progress",
      schema: "public",
      filter: subscriptionFilter,
    },
    ["user_id", "challenge_id", "status"],
    {
      callback: (payload) => {
        if (payload.eventType === "DELETE") {
          setCurrentProgress(null);
          return;
        }
        const updatedProgress = payload.new as UserProgress;
        if (updatedProgress.status === "completed") {
          setShowCompletionDialog(true);
        }
        revalidateView();
        setCurrentProgress(updatedProgress);
      },
    }
  );

  let cardTitle: string;
  let cardComponent: React.ReactElement;
  if (userLoading || progressLoading) {
    cardTitle = "Loading...";
    cardComponent = <Loading />;
  } else if (!user || !currentProgress || currentProgress.status === "not_started") {
    cardTitle = "Play this challenge !";
    cardComponent = (
      <div className='text-left space-y-4'>
        <div>
          <p>
            👉 If it&apos;s your first time here, please follow this{" "}
            <Link href='/docs/user/getting-started'>
              <span className='text-primary hover:underline'>documentation</span>
            </Link>{" "}
            to set up your local environment.
          </p>
        </div>
        <div>
          <p>Once you&apos;re ready, you can start the challenge by running the command below:</p>
          <Terminal content={`kubeasy challenge start ${challenge.slug}`} thingToCopy='Command' />
        </div>
      </div>
    );
  } else {
    cardTitle = currentProgress.status === "completed" ? "Challenge Completed" : "Challenge In Progress";
    cardComponent = (
      <React.Fragment>
        <ChallengeProgressDetailsCard userProgress={currentProgress} />
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      {currentProgress && currentProgress.status === "completed" && (
        <ChallengeCompletionDialog open={showCompletionDialog} onOpenChange={setShowCompletionDialog} challenge={challenge} userProgress={currentProgress} />
      )}
      <Card className='w-full'>
        <CardHeader>
          <CardTitle>
            <h2 className='text-2xl font-bold'>{cardTitle}</h2>
          </CardTitle>
        </CardHeader>
        <CardContent>{cardComponent}</CardContent>
        <CardFooter>
          <div className='flex flex-row items-center gap-1'>
            <span className={cn(subscriptionStatus === "SUBSCRIBED" ? "bg-primary" : "bg-destructive", "h-1.5 w-1.5 rounded-full bg-primary animate-pulse")} />
            <p className='text-xs text-muted-foreground'>Real-time updates</p>
          </div>
        </CardFooter>
      </Card>
    </React.Fragment>
  );
}

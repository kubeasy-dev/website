"use client";

import React, { useState, useEffect } from "react";
import { Challenge, UserProgress } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import useSupabase from "@/hooks/use-supabase";
import { useQuery as useCacheQuery, useSubscription } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { ChallengeProgressDetailsCard } from "./challenge-progress-details-card";
import Loading from "../loading";
import { User } from "@supabase/supabase-js";
import ReactConfetti from "react-confetti";
import useWindowSize from "@/hooks/use-window-size";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Terminal } from "../terminal";

export interface ChallengeProgressContextType {
  challenge: Challenge;
  userProgress: UserProgress | null | undefined;
  user: User | null | undefined;
}

export default function ChallengeProgressCard({
  challenge,
}: Readonly<{
  challenge: Challenge;
}>) {
  const supabase = useSupabase();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user"],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
    refetchOnWindowFocus: true,
  });
  const { data: initialProgress, isLoading: progressLoading } = useCacheQuery(queries.userProgress.get(supabase, { challengeId: challenge.id }), {
    enabled: !!user,
  });

  const [currentProgress, setCurrentProgress] = useState<UserProgress | null | undefined>(initialProgress);

  useEffect(() => {
    setCurrentProgress(initialProgress);
  }, [initialProgress]);

  const channelName = currentProgress?.composite_key ? `user_progress_${currentProgress.composite_key}` : "user_progress_disabled";
  const subscriptionFilter = currentProgress?.composite_key ? `composite_key=eq.${currentProgress.composite_key}` : undefined;

  const { status: subscriptionStatus } = useSubscription(
    supabase,
    channelName,
    {
      event: "*",
      table: "user_progress",
      schema: "public",
      filter: subscriptionFilter,
    },
    ["user_id", "challenge_id"],
    {
      callback: (payload) => {
        const updatedProgress = payload.new as UserProgress;
        if (currentProgress?.status === "in_progress" && updatedProgress.status === "completed") {
          setShowConfetti(true);
        }
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
            <Link href='/docs/setup-local-environment'>
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
    cardTitle = `Your Progress`;
    cardComponent = <ChallengeProgressDetailsCard userProgress={currentProgress} />;
  }

  return (
    <React.Fragment>
      {showConfetti && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9999 }}>
          <ReactConfetti width={width} height={height} numberOfPieces={1000} recycle={false} onConfettiComplete={() => setShowConfetti(false)} />
        </div>
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

"use client";

import React, { createContext, useContext } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { Challenge, UserProgress } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import useSupabase from "@/hooks/use-supabase";
import { useQuery as useCacheQuery, useUpsertMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { useQuery } from "@tanstack/react-query";
import { UserProgressStatus } from "@/lib/types";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

type ChallengeProgressContextType = {
  challenge: Challenge;
  userProgress?: UserProgress | null;
  user?: User | null;
};

const ChallengeProgressContext = createContext<ChallengeProgressContextType | undefined>(undefined);

function useChallengeProgress() {
  const context = useContext(ChallengeProgressContext);
  if (context === undefined) {
    throw new Error("useChallengeProgress must be used within a ChallengeProgressProvider");
  }
  return context;
}

/**
 * Main Challenge Progress Card Component - Server Component
 * Fetches data server-side and renders the appropriate sub-component
 */
export default function ChallengeProgressCard({
  challenge,
}: Readonly<{
  challenge: Challenge;
}>) {
  const supabase = useSupabase();
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
    refetchOnWindowFocus: true,
  });
  const { data: progress } = useCacheQuery(queries.userProgress.get(supabase, { challengeId: challenge.id }), {
    enabled: !!user,
  });

  // Contexte partagé avec tous les sous-composants
  const contextValue = {
    challenge,
    userProgress: progress,
    user,
  };

  // Render appropriate component based on auth state and user progress
  return (
    <ChallengeProgressContext.Provider value={contextValue}>
      {!user ? (
        <NotLoggedInCard />
      ) : !progress || progress.status === "not_started" ? (
        <NotStartedCard />
      ) : progress.status === "in_progress" ? (
        <InProgressCard />
      ) : progress.status === "completed" ? (
        <CompletedCard />
      ) : (
        <ErrorCard />
      )}
    </ChallengeProgressContext.Provider>
  );
}

function ActionButton() {
  const supabase = useSupabase();
  const { toast } = useToast();
  const { challenge, user, userProgress } = useChallengeProgress();
  const { mutateAsync: update } = useUpsertMutation(supabase.from("user_progress"), ["user_id", "challenge_id"], "status", {
    onSuccess: () => {
      toast({
        title: "Challenge Started!",
        description: "You have successfully started the challenge.",
        variant: "default",
      });
    },
  });

  const handleStart = async () => {
    if (user && challenge) {
      try {
        const progressData = {
          user_id: user.id,
          challenge_id: challenge.id,
          status: "in_progress" as UserProgressStatus,
          started_at: new Date().toISOString(),
        };

        await update([progressData]);
      } catch (error) {
        console.error("Failed to start challenge:", error);
      }
    }
  };

  return (
    <Button className='w-full' onClick={handleStart}>
      {userProgress?.status === "in_progress" ? "Restart Challenge" : "Start Challenge"}
    </Button>
  );
}

/**
 * Card displayed when user is not logged in
 */
function NotLoggedInCard() {
  const { challenge } = useChallengeProgress();

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Track Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='mb-4 text-muted-foreground'>Sign in to track your progress on this challenge.</p>
      </CardContent>
      <CardFooter>
        <Link href={`/login?next=${encodeURIComponent("/challenge/" + challenge.slug)}`} className='w-full'>
          <Button className='w-full'>Sign in to continue</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

/**
 * Card displayed when the challenge has not been started yet
 */
function NotStartedCard() {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Ready to Start?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground'>Begin this challenge to track your progress and earn achievements.</p>
      </CardContent>
      <CardFooter>
        <ActionButton />
      </CardFooter>
    </Card>
  );
}

/**
 * Card displayed when the challenge is in progress
 */
function InProgressCard() {
  const { userProgress } = useChallengeProgress();

  const startedAt = userProgress?.started_at ? formatDistanceToNow(new Date(userProgress.started_at), { addSuffix: true, locale: enUS }) : "recently";

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle>In Progress</CardTitle>
          <Badge variant='secondary'>Active</Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          <span className='font-medium'>Started:</span> {startedAt}
        </p>
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>Progress</p>
          <Progress value={50} className='h-2' />
        </div>
        <p className='text-sm text-muted-foreground'>Keep working on this challenge. You&apos;re making great progress!</p>
      </CardContent>
    </Card>
  );
}

/**
 * Card displayed when the challenge is completed
 */
function CompletedCard() {
  const { userProgress } = useChallengeProgress();

  const completedAt = userProgress?.completed_at ? formatDistanceToNow(new Date(userProgress.completed_at), { addSuffix: true, locale: enUS }) : "recently";

  const duration =
    userProgress?.started_at && userProgress?.completed_at ? Math.round((new Date(userProgress.completed_at).getTime() - new Date(userProgress.started_at).getTime()) / (1000 * 60)) : null;

  return (
    <Card className='w-full'>
      <CardHeader>
        <div className='flex justify-between items-center'>
          <CardTitle>Completed!</CardTitle>
          <Badge variant='default'>Finished</Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <p className='text-sm text-muted-foreground'>
          <span className='font-medium'>Completed:</span> {completedAt}
        </p>
        {duration && (
          <p className='text-sm text-muted-foreground'>
            <span className='font-medium'>Duration:</span> {duration} minutes
          </p>
        )}
        <div className='space-y-2'>
          <p className='text-sm text-muted-foreground'>Progress</p>
          <Progress value={100} className='h-2' />
        </div>
        <p className='text-sm text-muted-foreground'>Congratulations! You&apos;ve successfully completed this challenge.</p>
      </CardContent>
    </Card>
  );
}

function ErrorCard() {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
      </CardHeader>
      <CardContent>
        <p className='text-muted-foreground'>There was an error loading your progress. Please try refreshing the page.</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => window.location.reload()} variant='outline' className='w-full'>
          Refresh Page
        </Button>
      </CardFooter>
    </Card>
  );
}

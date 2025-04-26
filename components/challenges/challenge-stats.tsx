"use client";

import React from "react";
import useSupabase from "@/hooks/use-supabase";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import Link from "next/link";
import { Button } from "../ui/button";
import { enUS } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { ChallengeProgress } from "@/lib/types";

function LastChallengeStartedCard({ lastStartedChallenge }: { lastStartedChallenge: ChallengeProgress | null }) {
  return (
    <Card className='bg-muted'>
      <CardHeader>
        <CardTitle>Last challenge started</CardTitle>
      </CardHeader>
      <CardContent>
        {lastStartedChallenge ? (
          <div className='flex flex-row'>
            <div className='flex flex-col'>
              <Link href={`/challenge/${lastStartedChallenge.slug}`} className='font-medium'>
                {lastStartedChallenge.title}
              </Link>
              <div className='text-sm text-muted-foreground'>
                Started {lastStartedChallenge?.started_at ? formatDistanceToNow(new Date(lastStartedChallenge.started_at), { addSuffix: true, locale: enUS }) : "recently"}
              </div>
            </div>
            <Button variant='secondary' className='ml-auto' asChild>
              <Link href={`/challenge/${lastStartedChallenge.slug}`}>Continue</Link>
            </Button>
          </div>
        ) : (
          <div className='text-muted-foreground'>No challenges started yet</div>
        )}
      </CardContent>
    </Card>
  );
}

function ChallengesCompletedCard({ completedChallenges, totalChallenges }: { completedChallenges: number; totalChallenges: number }) {
  const progress = React.useMemo(() => {
    return Math.round((completedChallenges / totalChallenges) * 100);
  }, [completedChallenges, totalChallenges]);

  return (
    <Card className='bg-muted'>
      <CardHeader>
        <CardTitle>Challenges completed</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className='w-full' />
        <div className='mt-2 text-sm text-muted-foreground'>
          {progress}% - {completedChallenges} out of {totalChallenges} challenges completed
        </div>
      </CardContent>
    </Card>
  );
}

function LastChallengeCompletedCard({ lastCompletedChallenge }: { lastCompletedChallenge: ChallengeProgress | null }) {
  return (
    <Card className='bg-muted'>
      <CardHeader>
        <CardTitle>Last challenge completed</CardTitle>
      </CardHeader>
      <CardContent>
        {lastCompletedChallenge ? (
          <div className='flex flex-row'>
            <div className='flex flex-col'>
              <Link href={`/challenge/${lastCompletedChallenge.slug}`} className='font-medium'>
                {lastCompletedChallenge.title}
              </Link>
              <div className='text-sm text-muted-foreground'>
                Completed {lastCompletedChallenge?.completed_at ? formatDistanceToNow(new Date(lastCompletedChallenge.completed_at), { addSuffix: true, locale: enUS }) : "recently"}
              </div>
            </div>
            <Button variant='secondary' className='ml-auto' asChild>
              <Link href={`/challenge/${lastCompletedChallenge.slug}`}>Review</Link>
            </Button>
          </div>
        ) : (
          <div className='text-muted-foreground'>No challenges completed yet</div>
        )}
      </CardContent>
    </Card>
  );
}

export function ChallengesStats() {
  const supabase = useSupabase();

  const { data: challenges } = useQuery(queries.challengeProgress.list(supabase, {}));

  const completedChallenges = React.useMemo(() => {
    if (!challenges) {
      return [];
    }
    return challenges.filter((challenge) => challenge.status === "completed") || [];
  }, [challenges]);

  const lastCompletedChallenge = React.useMemo(() => {
    if (!completedChallenges) {
      return null;
    }
    return completedChallenges[0] || null;
  }, [completedChallenges]);

  const lastStartedChallenge = React.useMemo(() => {
    if (!challenges) {
      return null;
    }
    return challenges.find((challenge) => challenge.status === "in_progress") || null;
  }, [challenges]);

  return (
    <div className='w-full flex flex-col gap-6'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <LastChallengeStartedCard lastStartedChallenge={lastStartedChallenge} />
        <ChallengesCompletedCard completedChallenges={completedChallenges.length} totalChallenges={challenges?.length || 0} />
        <LastChallengeCompletedCard lastCompletedChallenge={lastCompletedChallenge} />
      </div>
    </div>
  );
}

"use client";

import React from "react";
import useSupabase from "@/hooks/use-supabase";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import Loading from "@/components/loading";
import { Input } from "@/components/ui/input";
import { ChallengesTable } from "./challenges-table";
import { ChallengesBoard } from "./challenges-board";
import { useViewMode } from "@/hooks/use-view-mode";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import Link from "next/link";
import { Button } from "../ui/button";
import { enUS } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";

export function ChallengesList() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Debounce search to avoid too many server requests
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const supabase = useSupabase();

  const { data: challenges, isLoading: queryLoading } = useQuery(queries.challengeProgress.list(supabase, { searchQuery: debouncedSearchTerm }));

  const { viewMode, setViewMode, isLoading } = useViewMode();

  const completedChallenges = React.useMemo(() => {
    if (!challenges) {
      return [];
    }
    return challenges.filter((challenge) => challenge.status === "completed");
  }, [challenges]);

  const lastCompletedChallenge = React.useMemo(() => {
    if (!completedChallenges) {
      return null;
    }
    return completedChallenges[0];
  }, [completedChallenges]);

  const lastStartedChallenge = React.useMemo(() => {
    if (!challenges) {
      return null;
    }
    return challenges.find((challenge) => challenge.status === "in_progress");
  }, [challenges]);

  const progress = React.useMemo(() => {
    if (!challenges) {
      return 0;
    }
    return Math.round((completedChallenges.length / challenges.length) * 100);
  }, [challenges, completedChallenges]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='w-full flex flex-col gap-6'>
      <section className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <Card>
          <CardHeader>
            <CardTitle>Last challenge started</CardTitle>
          </CardHeader>
          <CardContent>
            {lastStartedChallenge ? (
              <div className='flex flex-row'>
                <div className='flex flex-col'>
                  <Link href={`/challenges/${lastStartedChallenge.slug}`} className='font-medium'>
                    {lastStartedChallenge.title}
                  </Link>
                  <div className='text-sm text-muted-foreground'>
                    Started {lastStartedChallenge?.started_at ? formatDistanceToNow(new Date(lastStartedChallenge.started_at), { addSuffix: true, locale: enUS }) : "recently"}
                  </div>
                </div>
                <Button variant='secondary' className='ml-auto'>
                  <Link href={`/challenges/${lastStartedChallenge.slug}`}>Continue</Link>
                </Button>
              </div>
            ) : (
              <div className='text-muted-foreground'>No challenges started yet</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Challenges completed</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className='w-full' />
            <div className='mt-2 text-sm text-muted-foreground'>
              {progress}% - {completedChallenges.length} out of {challenges?.length} challenges completed
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last challenge completed</CardTitle>
          </CardHeader>
          <CardContent>
            {lastCompletedChallenge ? (
              <div className='flex flex-row'>
                <div className='flex flex-col'>
                  <Link href={`/challenges/${lastCompletedChallenge.slug}`} className='font-medium'>
                    {lastCompletedChallenge.title}
                  </Link>
                  <div className='text-sm text-muted-foreground'>
                    Completed {lastCompletedChallenge?.completed_at ? formatDistanceToNow(new Date(lastCompletedChallenge.completed_at), { addSuffix: true, locale: enUS }) : "recently"}
                  </div>
                </div>
                <Button variant='secondary' className='ml-auto'>
                  <Link href={`/challenges/${lastCompletedChallenge.slug}`}>Review</Link>
                </Button>
              </div>
            ) : (
              <div className='text-muted-foreground'>No challenges completed yet</div>
            )}
          </CardContent>
        </Card>
      </section>
      <section>
        <h2 className='text-2xl font-bold mb-4'>Explore challenges</h2>
        <div className='flex flex-row items-center gap-4 mb-6'>
          <div className='w-11/12'>
            <Input type='text' placeholder='Search challenges...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='flex-grow bg-card' />
          </div>
          <div className='w-1/12 space-x-2'>
            <div className='flex items-center space-x-2'>
              <Button variant={viewMode === "board" ? "default" : "outline"} size='sm' onClick={() => setViewMode("board")} className='flex items-center gap-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-layout-grid'
                >
                  <rect width='7' height='7' x='3' y='3' rx='1' />
                  <rect width='7' height='7' x='14' y='3' rx='1' />
                  <rect width='7' height='7' x='14' y='14' rx='1' />
                  <rect width='7' height='7' x='3' y='14' rx='1' />
                </svg>
                Board
              </Button>
              <Button variant={viewMode === "table" ? "default" : "outline"} size='sm' onClick={() => setViewMode("table")} className='flex items-center gap-1'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-table'
                >
                  <rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
                  <line x1='3' y1='9' x2='21' y2='9' />
                  <line x1='3' y1='15' x2='21' y2='15' />
                  <line x1='9' y1='3' x2='9' y2='21' />
                  <line x1='15' y1='3' x2='15' y2='21' />
                </svg>
                Table
              </Button>
            </div>
          </div>
        </div>
        <div>{queryLoading ? <Loading /> : viewMode === "table" ? <ChallengesTable challenges={challenges} /> : <ChallengesBoard challenges={challenges} />}</div>
      </section>
    </div>
  );
}

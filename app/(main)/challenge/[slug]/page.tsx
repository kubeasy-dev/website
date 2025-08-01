import React, { Suspense } from "react";
import { createStaticClient } from "@/lib/supabase/server";
import { Params } from "next/dist/server/request/params";
import { Challenge } from "@/lib/types";
import { queries } from "@/lib/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import ChallengeProgressCard from "@/components/challenges/challenge-progress-card";
import Loading from "@/components/loading";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { DisplayDifficultyLevel } from "@/components/difficulty-level";
import { DiscussionButton } from "@/components/challenges/discussion-button";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({ params }: Readonly<{ params: Promise<Params> }>) {
  const awaitedParams = await params;
  const { slug } = awaitedParams as { slug: string };
  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - Kubeasy Challenge`,
  };
}

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data: challenges } = await supabase.from("challenges").select();
  const challengesData: Challenge[] = challenges || [];
  return challengesData.map((challenge) => ({
    slug: String(challenge.slug),
  }));
}

export default async function ChallengePage({ params }: Readonly<{ params: Promise<Params> }>) {
  const awaitedParams = await params;
  const { slug } = awaitedParams as { slug: string };

  const supabase = createStaticClient();
  const { data: challenge } = await queries.challenge.get(supabase, { slug });

  if (!challenge) {
    return notFound();
  }

  const { data: theme } = await queries.theme.get(supabase, { slug: challenge?.theme });

  return (
    <section>
      <div className='mx-auto flex max-w-232 flex-col items-center justify-center gap-6 text-center'>
        <div className='flex flex-col items-center space-y-4 w-full'>
          <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>{challenge.title}</h1>
          <div className='flex flex-row items-center gap-4 text-sm font-medium mt-2'>
            <Link href={`/challenges/${challenge.theme}`} className='text-muted-foreground hover:text-primary'>
              <Badge>{theme?.title}</Badge>
            </Link>
            <span className='flex items-center'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              {challenge.estimated_time} min
            </span>
            <Badge variant='secondary' className='flex items-center gap-1'>
              <DisplayDifficultyLevel level={challenge.difficulty} />
              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
            </Badge>
          </div>
        </div>

        <Card className='w-full'>
          <CardHeader>
            <CardTitle>
              <h2 className='text-2xl font-bold'>Instructions</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 sm:grid-cols-11 p-4 justify-between rounded-md space-y-4 md:space-y-0'>
              <div className='flex flex-col gap-4 col-span-5'>
                <h3 className='text-lg font-bold'>Initial Situation</h3>
                <div className='text-left prose prose-p:text-base prose-ol:list-disc max-w-none mb-2'>{challenge.initial_situation}</div>
              </div>
              <div className='items-center justify-self-center'>
                <Separator orientation='vertical' />
              </div>
              <div className='flex flex-col gap-4 col-span-5'>
                <h3 className='text-lg font-bold '>Objective</h3>
                <div className='text-left prose prose-p:text-base prose-ol:list-disc max-w-none mb-2'>{challenge.objective}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Suspense fallback={<Loading />}>
          <ChallengeProgressCard challenge={challenge} />
        </Suspense>

        <div className='flex justify-center mt-6'>
          <DiscussionButton challengeTitle={challenge.title} />
        </div>
      </div>
    </section>
  );
}

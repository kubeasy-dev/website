"use client";

import { queries } from "@/lib/queries";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useSupabase from "@/hooks/use-supabase";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import ChallengeProgressCard from "@/components/challenges/challenge-progress-card";
import Loading from "../loading";

export default function ChallengeContent({ slug }: Readonly<{ slug: string }>) {
  const supabase = useSupabase();
  const { data: challenge } = useQuery(queries.challenges.get(supabase, { slug }));

  if (!challenge) {
    return notFound();
  }

  return (
    <section className='container mx-auto py-12 md:py-24 lg:py-32'>
      <div className='mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-6 text-center'>
        <div className='flex flex-col items-center space-y-4 w-full'>
          <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>{challenge.title}</h1>
          <div className='flex flex-row items-center gap-4 text-sm font-medium mt-2'>
            <Badge>{challenge.difficulty}</Badge>
            <span className='flex items-center'>
              <svg xmlns='http://www.w3.org/2000/svg' className='h-4 w-4 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
              </svg>
              {challenge.estimated_time} min
            </span>
          </div>
        </div>

        <Card className='w-full'>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className='prose prose-p:text-base prose-ol:list-disc max-w-none'>
            <Markdown remarkPlugins={[remarkGfm]}>{challenge.content}</Markdown>
          </CardContent>
        </Card>

        <Suspense fallback={<Loading />}>
          <ChallengeProgressCard challenge={challenge} />
        </Suspense>
      </div>
    </section>
  );
}

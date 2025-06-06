import React, { Suspense } from "react";
import { queries } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { ChallengeList } from "@/components/challenges/challenge-list";
import { PrefetchWrapper } from "@/components/prefetch-wrapper";
import Loading from "@/components/loading";
import { Container } from "@/components/ui/container";

export async function generateMetadata() {
  return {
    title: "Learning Path - Kubeasy",
  };
}

export default async function LearningPath() {
  const supabase = await createClient();
  const prefetchedQueries = [queries.challengeProgress.list(supabase, {})];

  return (
    <Container className='py-24 lg:py-32'>
      <div className='mx-auto flex flex-col items-center justify-center gap-4 text-center'>
        <h1 className='text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]'>Your Kubernetes Journey</h1>
        <p className='max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7'>Solve real-world Kubernetes problems and track your skills. Your progress, your path.</p>
      </div>

      <div className='mx-auto items-center container flex flex-col gap-20 py-12'>
        <Suspense fallback={<Loading />}>
          <PrefetchWrapper queries={prefetchedQueries}>
            <ChallengeList />
          </PrefetchWrapper>
        </Suspense>
      </div>
    </Container>
  );
}

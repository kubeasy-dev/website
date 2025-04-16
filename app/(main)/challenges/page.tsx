import React from "react"
import { queries } from "@/lib/queries"
import { createStaticClient } from "@/lib/supabase/server"
import ChallengesList from "@/components/challenges/challenge-list"
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query'
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"

export default async function Challenges() {
  const queryClient = new QueryClient()
  const supabase = createStaticClient()
  await prefetchQuery(queryClient, queries.challenges.list(supabase, { searchQuery: "" }))

  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
        <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
          Kubernetes Challenges
        </h1>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Sharpen your Kubernetes skills with our interactive challenges. Learn by doing and track your progress.
        </p>
      </div>

      <div className="mx-auto mt-6 max-w-5xl">
        <HydrationBoundary state={dehydrate(queryClient)}>
          <ChallengesList />
        </HydrationBoundary>
      </div>
    </section>
  )
}
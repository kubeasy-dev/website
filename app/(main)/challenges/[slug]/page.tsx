import React from 'react'
import { createStaticClient } from '@/lib/supabase/server'
import { Params } from 'next/dist/server/request/params'
import { Challenge } from '@/lib/types'
import { prefetchQuery } from '@supabase-cache-helpers/postgrest-react-query'
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { queries } from "@/lib/queries"
import ChallengeContent from '@/components/challenges/challenge-content'

export const revalidate = 3600
export const dynamicParams = true

export async function generateMetadata({ params }: Readonly<{ params: Promise<Params> }>) {
  const awaitedParams = await params
  const { slug } = awaitedParams as { slug: string }
  return {
    title: `${slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} - Kubeasy Challenge`,
  }
}
 
export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: challenges } = await supabase.from("challenges").select()
  const challengesData: Challenge[] = challenges || []
  return challengesData.map((challenge) => ({
    slug: String(challenge.slug),
  }))
}

export default async function ChallengePage({ params }: Readonly<{ params: Promise<Params> }>) {
  const awaitedParams = await params
  const { slug } = awaitedParams as { slug: string }
  const queryClient = new QueryClient()

  const supabase = createStaticClient()
  await prefetchQuery(queryClient, queries.challenges.get(supabase, { slug }))
  
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ChallengeContent slug={slug} />
    </HydrationBoundary>
  )
}
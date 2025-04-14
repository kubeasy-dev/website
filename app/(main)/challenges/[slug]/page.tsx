import React, { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createStaticClient } from '@/lib/supabase/server'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Params } from 'next/dist/server/request/params'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ChallengeProgressCard from '@/components/challenges/challenge-progress-card'
import { Challenge } from '@/lib/types'
import { generateCacheTag } from '@/lib/cache'

// Next.js will invalidate the cache when a
// request comes in, at most once every 3660 seconds.
export const revalidate = 3600
 
// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = true // or false, to 404 on unknown paths
 
export async function generateStaticParams() {
  // Using the static client that doesn't use cookies
  const supabase = createStaticClient()
  const { data: challenges } = await supabase.from("challenges").select()
  const challengesData: Challenge[] = challenges || []
  return challengesData.map((challenge) => ({
    slug: String(challenge.slug),
  }))
}

/**
 * Main challenge page component
 * Displays challenge details and progress tracking UI
 */
export default async function ChallengePage({ params }: Readonly<{ params: Promise<Params> }>) {
  const { slug } = await params
 
  if (typeof slug != 'string') {
    throw new Error("Invalid slug")
  }

  const supabase = createStaticClient(generateCacheTag("challenges", { slug }))

  // Get the challenge data
  const { data: challenge, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("slug", slug)
    .single()

  if (error) {
    throw error
  }

  if (!challenge) {
    notFound()
  }

  return (
    <section className="container mx-auto py-12 md:py-24 lg:py-32">
      <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-6 text-center">
        <div className="flex flex-col items-center space-y-4 w-full">
          <h1 className="text-3xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl lg:leading-[1.1]">
            {challenge.title}
          </h1>
          <div className="flex flex-row items-center gap-4 text-sm font-medium mt-2">
            <Badge>
              {challenge.difficulty}
            </Badge>
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {challenge.estimated_time} min
            </span>
          </div>
        </div>
        
        {/* Challenge Instructions Card */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-p:text-base prose-ol:list-disc max-w-none">
            <Markdown remarkPlugins={[remarkGfm]}>{challenge.content}</Markdown>
          </CardContent>
        </Card>
        
        {/* Challenge Progress Card */}
        <Suspense fallback={<div className="w-full max-w-md bg-white border rounded-lg p-6 shadow-md">Loading...</div>}>
          <ChallengeProgressCard challenge={challenge}/>
        </Suspense>
      </div>
    </section>
  )
}
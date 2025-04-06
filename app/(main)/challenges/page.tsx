import React, { Suspense } from "react"
import { getInitialChallengesByDifficulty } from "@/lib/actions/get-challenges"
import ChallengesWrapper from "./wrapper"
import ChallengeSkeleton from "@/components/challenges/challenges-skeleton"
import dynamic from 'next/dynamic'
import { difficultySections } from "@/config/difficulty-sections"

/**
 * Main Challenges page component
 * Uses Next.js data cache with on-demand revalidation
 */
export default function Challenges() {
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

      <Suspense fallback={<ChallengesLoading />}>
        <ChallengesContent />
      </Suspense>
    </section>
  )
}

/**
 * Loading fallback component that displays skeleton UI while data is loading
 */
function ChallengesLoading() {
  const SearchFiltersLoading = dynamic(
    () => import('@/components/challenges/search-filters'),
    { ssr: true }
  )
  
  return (
    <React.Fragment>
      <SearchFiltersLoading />
      
      <div className="mx-auto mt-6 max-w-5xl">
        {/* Show section titles during loading using the same config */}
        {difficultySections.map((section) => (
          <div key={section.key} className="py-8 border-b last:border-0">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold">{section.title}</h2>
            </div>
            <p className="text-muted-foreground mb-6">{section.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ChallengeSkeleton />
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  )
}

/**
 * Component that fetches and displays challenges content
 * Uses cached data with on-demand revalidation
 */
async function ChallengesContent() {
  // Initial fetch without search parameters, using cache
  const challengesByDifficulty = await getInitialChallengesByDifficulty();
  return <ChallengesWrapper initialChallenges={challengesByDifficulty} />
}

"use client"

import useSupabase from "@/hooks/use-supabase"
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query"
import { queries } from "@/lib/queries"
import ChallengeCard from "@/components/challenges/challenge-card"
import SearchFilters from "@/components/challenges/search-filters"
import { useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import Loading from "@/components/loading"

export default function ChallengesList() {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showAchieved, setShowAchieved] = useState<boolean>(false)

  // Debounce search to avoid too many server requests
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const supabase = useSupabase()

  const { data: challenges, isLoading } = useQuery(queries.challenges.list(supabase, { searchQuery: debouncedSearchTerm }))

  return (
    <div>
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showAchieved={showAchieved}
        setShowAchieved={setShowAchieved}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading && (
          <div >
            <Loading />
          </div>
        )}
        {challenges?.map((challenge) => (
          <ChallengeCard key={challenge.id} challenge={challenge} />
        ))}
      </div>
    </div>
  )
}
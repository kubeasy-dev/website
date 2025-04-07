"use client"

import React, { useState, useTransition, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChallengeExtended } from "@/lib/types"
import CtaCreateChallenge from "@/components/cta-create-challenge"
import ChallengeCard from "@/components/challenges/challenge-card"
import SearchFilters from "@/components/challenges/search-filters"
import { getInitialChallengesByDifficulty } from "@/lib/actions/get-challenges"
import { useDebounce } from "@/hooks/use-debounce"
import { difficultySections } from "@/config/difficulty-sections"

/**
 * Main wrapper component for challenges organized by difficulty levels
 * Client-side component that handles filtering and UI interactions
 */
export default function ChallengesWrapper({ 
  initialChallenges 
}: Readonly<{ 
  initialChallenges: Record<string, ChallengeExtended[]> 
}>) {  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showAchieved, setShowAchieved] = useState<boolean>(false)
  // Storing server-fetched results separately from client-filtered results
  const [fetchedChallenges, setFetchedChallenges] = useState(initialChallenges)
  const [isPending, startTransition] = useTransition();
  
  // Debounce search to avoid too many server requests
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    beginner: false,
    intermediate: false,
    advanced: false,
  })

  // Effect to search challenges when debounced term changes - ONLY for server queries
  React.useEffect(() => {
    startTransition(async () => {
      // Only fetch from server if we have a search term
      if (debouncedSearchTerm) {
        // Fetch challenges matching the search term
        const results = await getInitialChallengesByDifficulty(debouncedSearchTerm);
        setFetchedChallenges(results);
      } else {
        // Reset to initial data when search is cleared
        setFetchedChallenges(initialChallenges);
      }
    });
  }, [debouncedSearchTerm, initialChallenges]);

  // Apply client-side filtering for showAchieved toggle
  const challenges = useMemo(() => {
    // If we want to show achieved challenges, return all fetched challenges
    if (showAchieved) {
      return fetchedChallenges;
    }
    
    // Otherwise, filter out achieved challenges
    const filtered: Record<string, ChallengeExtended[]> = {};
    
    Object.entries(fetchedChallenges).forEach(([key, challengesList]) => {
      filtered[key] = challengesList.filter(challenge => !challenge.achieved);
    });
    
    return filtered;
  }, [fetchedChallenges, showAchieved]);

  // Handle toggling section expansion
  const toggleExpandSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Handler for clearing filters
  const handleClearFilters = () => {
    setSearchTerm('')
    setShowAchieved(false)
  }

  // Function to check if any challenges exist in a section
  const hasChallenges = (section: string) => {
    return challenges[section] && challenges[section].length > 0
  }
  
  // Check if we should show the "no results" message
  const hasNoResults = Object.values(challenges).every(
    challengeArray => challengeArray.length === 0
  );
  
  // Function to get all search results flattened into a single array
  const getAllSearchResults = () => {
    const allResults: ChallengeExtended[] = [];
    Object.values(challenges).forEach(challengesList => {
      allResults.push(...challengesList);
    });
    return allResults;
  }
  
  // Determine if search is active
  const isSearchActive = !!debouncedSearchTerm;

  return (
    <>
      {/* Search Filters */}
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        showAchieved={showAchieved}
        setShowAchieved={setShowAchieved}
        isLoading={isPending}
      />

      {/* Main content */}
      <div className="mx-auto mt-6 max-w-5xl">
        {isPending ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">Searching challenges...</p>
          </div>
        ) : hasNoResults ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">No challenges found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={handleClearFilters}
            >
              Clear Filters
            </Button>
          </div>
        ) : isSearchActive ? (
          // When searching, show all results in a single list
          <div className="py-8">
            <h2 className="text-2xl font-bold mb-6">Search Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getAllSearchResults().map((challenge) => (
                <ChallengeCard key={challenge.id} challenge={challenge} />
              ))}
            </div>
            <div className="text-center mt-6">
              <Button
                variant="outline" 
                onClick={handleClearFilters}
              >
                Clear Search
              </Button>
            </div>
          </div>
        ) : (
          // Display each difficulty section when not searching
          difficultySections.map((section) => (
            <div key={section.key} className="py-8 border-b last:border-0">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>
              <p className="text-muted-foreground mb-6">{section.description}</p>
              
              {!hasChallenges(section.key) ? (
                <div className="text-center py-6 bg-muted bg-opacity-50 rounded-md">
                  <p>No {section.key} challenges available in this category.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {challenges[section.key]
                      .slice(0, expandedSections[section.key] ? undefined : 4)
                      .map((challenge) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                      ))}
                  </div>
                  
                  {challenges[section.key].length > 4 && !expandedSections[section.key] && (
                    <div className="mt-6 text-center">
                      <Button 
                        variant="outline"
                        onClick={() => toggleExpandSection(section.key)}
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
        
        {/* Bottom CTA */}
        <div className="mt-12">
          <CtaCreateChallenge />
        </div>
      </div>
    </>
  )
}
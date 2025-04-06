"use server"

import { createClient } from "@/lib/supabase/server"
import { ChallengeExtended } from "@/lib/types";
import { revalidateTag, unstable_cache } from "next/cache";
import { cookies } from "next/headers";

export type ChallengesFilters = {
  searchTerm?: string;
  showAchieved?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
};

/**
 * Tags used for cache invalidation
 */
export const CACHE_TAGS = {
  CHALLENGES: "challenges"
}


/**
 * Get base challenges without user-specific data
 * This can be safely cached and shared between users
 */
const getBaseChallenges = unstable_cache(
  async (searchTerm?: string): Promise<Record<string, any[]>> => {
    const supabase = await createClient();
    
    // If we have an active search, perform a single query with text search
    if (searchTerm) {
      // Format search term for textSearch (replace spaces with + signs)
      const formattedSearchTerm = searchTerm.split(' ').join('+');
      
      let query = supabase
        .from("challenges")
        .select("*")
        .textSearch('fts', formattedSearchTerm)
        .order('updated_at', { ascending: false });
      
      const { data: challenges, error } = await query;
      
      if (error) {
        console.error("Error retrieving challenges:", error);
        throw error;
      }
      
      // Group the results by difficulty
      const result: Record<string, any[]> = {
        beginner: [],
        intermediate: [],
        advanced: []
      };
      
      challenges.forEach(challenge => {
        if (challenge.difficulty && result[challenge.difficulty]) {
          result[challenge.difficulty].push(challenge);
        }
      });
      
      return result;
    } 
    // If no search term, use separate queries by difficulty
    else {
      const difficulties = ['beginner', 'intermediate', 'advanced'] as const;
      const result: Record<string, any[]> = {
        beginner: [],
        intermediate: [],
        advanced: []
      };

      // Run all queries in parallel using Promise.all
      await Promise.all(
        difficulties.map(async (difficulty) => {
          const { data: challenges, error } = await supabase
            .from("challenges")
            .select("*")
            .eq("difficulty", difficulty)
            .order('updated_at', { ascending: false });

          if (error) {
            console.error(`Error retrieving ${difficulty} challenges:`, error);
            return;
          }
          
          // Store all challenges
          result[difficulty] = challenges;
        })
      );

      return result;
    }
  },
  ['getBaseChallenges'],
  { tags: [CACHE_TAGS.CHALLENGES], revalidate: false }
);

/**
 * Optimized function to get challenges by difficulty with user-specific achieved status
 * Uses data caching for base challenges but adds user-specific data per request
 */
export async function getInitialChallengesByDifficulty(
  searchTerm?: string
): Promise<Record<string, ChallengeExtended[]>> {
  // Get base challenges from cache (shared between users)
  const baseChallenges = await getBaseChallenges(searchTerm);
  
  // Get user-specific completed challenges (not cached/shared)
  const supabase = await createClient();
  let completedIds = new Set<string>();
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // Get challenges completed by the user
    const { data: userProgress, error: progressError } = await supabase
      .from("user_progress")
      .select("challenge_id")
      .eq("user_id", user.id)
      .eq("status", "completed");

    if (progressError) {
      console.error("Error retrieving progress:", progressError);
    } else if (userProgress) {
      completedIds = new Set(userProgress.map(progress => progress.challenge_id));
    }
  }
  
  // Add user-specific data (achieved status) to challenges
  const result: Record<string, ChallengeExtended[]> = {};
  
  Object.entries(baseChallenges).forEach(([difficulty, challenges]) => {
    result[difficulty] = challenges.map(challenge => ({
      ...challenge,
      achieved: completedIds.has(challenge.id)
    }));
  });
  
  return result;
}
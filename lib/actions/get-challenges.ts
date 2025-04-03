"use server"

import { createClient } from "@/lib/supabase/server"
import { Challenge, ChallengeExtended } from "@/lib/types";
import { ChallengesFilters } from "@/hooks/use-getChallenges";

const FETCH_CHALLENGES_LIMIT = 12;

export async function getChallenges(
  pageParam = 1,
  filters: ChallengesFilters = {}
): Promise<ChallengeExtended[]> {
  const { searchTerm, showAchieved } = filters;
  const supabase = await createClient();
  
  // Récupérer l'utilisateur connecté
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  // Récupérer les challenges complétés par l'utilisateur
  const { data: userProgress, error: progressError } = await supabase
    .from("user_progress")
    .select("challenge_id")
    .eq("user_id", user.id)
    .eq("status", "completed");
  
  if (progressError) {
    throw progressError;
  }
  
  // Créer un ensemble des IDs de challenges complétés
  const completedChallengeIds = new Set(userProgress.map(progress => progress.challenge_id));
  
  // Démarrer avec la requête de base pour les challenges
  let query = supabase.from("challenges").select("*");
  
  // Appliquer la recherche textuelle si un terme est fourni
  if (searchTerm) {
    query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
  }
  
  // Appliquer la pagination
  const { data: challenges, error } = await query
    .range((pageParam as number - 1) * FETCH_CHALLENGES_LIMIT, pageParam as number * FETCH_CHALLENGES_LIMIT - 1);
  
  if (error) {
    throw error;
  }
  
  // Étendre les challenges avec le statut 'achieved'
  const extendedChallenges: ChallengeExtended[] = challenges.map(challenge => ({
    ...challenge,
    achieved: completedChallengeIds.has(challenge.id)
  }));
  
  // Filtrer les défis accomplis si nécessaire
  if (showAchieved === false) {
    return extendedChallenges.filter(challenge => !challenge.achieved);
  }
  
  return extendedChallenges;
}
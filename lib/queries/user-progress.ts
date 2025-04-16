import { cache } from "../cache";
import { TypedSupabaseClient } from "../supabase/client";

function getUserProgress(client: TypedSupabaseClient, {challengeId}: {challengeId: string}) {
  const query =  client
    .from("user_progress")
    .select("*")
    .eq("challenge_id", challengeId)
    .throwOnError()
    .maybeSingle()
  return query;
}

export const userProgress = {
  get: getUserProgress,
};
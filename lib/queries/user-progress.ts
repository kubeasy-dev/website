import { TypedSupabaseClient } from "../supabase/client";

function getUserProgress(client: TypedSupabaseClient, { challengeId }: { challengeId: string }) {
  return client.from("user_progress").select("*").eq("challenge_id", challengeId).throwOnError().maybeSingle();
}

export const userProgress = {
  get: getUserProgress,
};

import { TypedSupabaseClient } from "../supabase/client";

function listUserSubmissions(client: TypedSupabaseClient, { challengeId }: { challengeId?: string }) {
  return client.from("user_submissions").select("*").ilike("user_progress", `%${challengeId}`).throwOnError().order("time", { ascending: false });
}

export const userSubmission = {
  list: listUserSubmissions,
};

import { TypedSupabaseClient } from "../supabase/client";

function listChallengesProgress(client: TypedSupabaseClient, opts: { searchQuery?: string }) {
  const parsedQuery = opts.searchQuery
    ?.toLowerCase()
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((word) => `'${word}'`)
    .join(" & ")
    .trim();
  let query = client.from("challenge_progress").select("*").throwOnError();
  if (parsedQuery && parsedQuery.length > 0) {
    query = query.textSearch("fts,", parsedQuery);
  }
  query = query.order("completed_at", { ascending: false, nullsFirst: true });
  query = query.order("started_at", { ascending: false, nullsFirst: false });
  query = query.order("difficulty", { ascending: true });
  return query;
}

export const challengeProgress = {
  list: listChallengesProgress,
};

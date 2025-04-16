import { cache } from "../cache";
import { TypedSupabaseClient } from "../supabase/client";

function getChallenges(client: TypedSupabaseClient, opts: {searchQuery: string}) {
  const parsedQuery = opts.searchQuery.toLowerCase().split(" ").join("+")
  let query = client
    .from("challenges")
    .select("*")
    .order("created_at", { ascending: false })
  
  if (parsedQuery.length > 0) {
    query = query.textSearch("fts,", parsedQuery)
  }

  return query
}


function getChallengeBySlug(client: TypedSupabaseClient, {slug}: {slug: string}) {
  const query = client
    .from("challenges")
    .select("*")
    .eq("slug", slug)
    .throwOnError()
    .single()
  return query
}

export const challenges = {
  list: getChallenges,
  get: getChallengeBySlug,
}
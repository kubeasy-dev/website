import { TypedSupabaseClient } from "../supabase/client";

function listChallengesByTheme(client: TypedSupabaseClient, { theme }: { theme: string }) {
  return client.from("challenges").select("*").eq("theme", theme).throwOnError();
}

function getChallengeBySlug(client: TypedSupabaseClient, { slug }: { slug: string }) {
  return client.from("challenges").select("*").eq("slug", slug).throwOnError().single();
}

function findSimilarChallenges(client: TypedSupabaseClient, { theme, excludeChallengeId }: { theme: string; excludeChallengeId: string }) {
  return client.from("challenges").select("*").eq("theme", theme).neq("id", excludeChallengeId).order("created_at", { ascending: false }).limit(2).throwOnError();
}

export const challenge = {
  listByTheme: listChallengesByTheme,
  get: getChallengeBySlug,
  findSimilar: findSimilarChallenges,
};

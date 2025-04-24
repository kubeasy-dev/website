import { TypedSupabaseClient } from "../supabase/client";

function listChallengesTheme(client: TypedSupabaseClient) {
  return client.from("theme").select("*").throwOnError();
}

function listChallengesByTheme(client: TypedSupabaseClient, { theme }: { theme: string }) {
  return client.from("challenges").select("*").eq("theme", theme).throwOnError();
}

function getChallengeBySlug(client: TypedSupabaseClient, { slug }: { slug: string }) {
  return client.from("challenges").select("*").eq("slug", slug).throwOnError().single();
}

export const challenges = {
  listThemes: listChallengesTheme,
  listByTheme: listChallengesByTheme,
  get: getChallengeBySlug,
};

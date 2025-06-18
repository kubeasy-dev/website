import { TypedSupabaseClient } from "../supabase/client";

function listChallenges(client: TypedSupabaseClient) {
  return client.from("challenges").select("*").throwOnError();
}

function listChallengesByTheme(client: TypedSupabaseClient, { theme }: { theme: string }) {
  return client.from("challenges").select("*").eq("theme", theme).throwOnError();
}

function getChallengeBySlug(client: TypedSupabaseClient, { slug }: { slug: string }) {
  return client.from("challenges").select("*").eq("slug", slug).throwOnError().single();
}

function findSimilarChallenges(client: TypedSupabaseClient, { theme, excludeChallengeId }: { theme: string; excludeChallengeId: string }) {
  return client.from("challenges").select("*").eq("theme", theme).neq("id", excludeChallengeId).order("created_at", { ascending: false }).limit(2).throwOnError();
}

function getChallengeOfTheWeek(client: TypedSupabaseClient) {
  return client.from("challenges").select("*").eq("of_the_week", true).throwOnError().single();
}

function getLatestChallenges(client: TypedSupabaseClient) {
  return client.from("challenges").select("*").order("created_at", { ascending: false }).limit(3).throwOnError();
}

export const challenge = {
  list: listChallenges,
  listByTheme: listChallengesByTheme,
  get: getChallengeBySlug,
  findSimilar: findSimilarChallenges,
  getChallengeOfTheWeek,
  getLatest: getLatestChallenges,
};

import { TypedSupabaseClient } from "../supabase/client";

function listChallengesByTheme(client: TypedSupabaseClient, { theme }: { theme: string }) {
  return client.from("challenges").select("*").eq("theme", theme).throwOnError();
}

function getChallengeBySlug(client: TypedSupabaseClient, { slug }: { slug: string }) {
  return client.from("challenges").select("*").eq("slug", slug).throwOnError().single();
}

export const challenge = {
  listByTheme: listChallengesByTheme,
  get: getChallengeBySlug,
};

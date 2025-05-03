import { TypedSupabaseClient } from "../supabase/client";

function listChallengesTheme(client: TypedSupabaseClient) {
  return client.from("themes").select("*").throwOnError();
}

function getThemeBySlug(client: TypedSupabaseClient, { slug }: { slug: string }) {
  return client.from("themes").select("*").eq("slug", slug).throwOnError().single();
}

export const theme = {
  list: listChallengesTheme,
  get: getThemeBySlug,
};

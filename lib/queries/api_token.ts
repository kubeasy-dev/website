import { TypedSupabaseClient } from "../supabase/client";

function listApiTokens(client: TypedSupabaseClient) {
  return client.from("api_tokens").select("*").throwOnError().order("created_at", { ascending: false });
}

export const apiToken = {
  list: listApiTokens,
};

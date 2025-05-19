import { TypedSupabaseClient } from "../supabase/client";

function getUserProfile(client: TypedSupabaseClient) {
  return client.from("profiles").select("*").throwOnError().single();
}

export const profile = {
  get: getUserProfile,
};

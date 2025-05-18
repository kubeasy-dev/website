import { TypedSupabaseClient } from "../supabase/client";

function getUserProfile(client: TypedSupabaseClient) {
  return client.from("profiles").select("*").throwOnError().single();
}

function createUserProfile(client: TypedSupabaseClient, { name, userId }: { name: string; userId: string }) {
  return client.from("profiles").insert({ name, user_id: userId }).throwOnError().single();
}

export const profile = {
  get: getUserProfile,
  create: createUserProfile,
};

import { TypedSupabaseClient } from "../supabase/client";

function listEmailSubscriptions(supabase: TypedSupabaseClient) {
  return supabase.from("email_subscriptions").select("subscribed, category_id, email_category (name, description, force_subscription)").order("category_id", { ascending: true });
}

export const emailSubscriptions = {
  list: listEmailSubscriptions,
};

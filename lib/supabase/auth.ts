import { createClient } from "@/lib/supabase/server"

export async function getUser() {
  const supabase = await createClient(null);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error retrieving user:", error);
    return null;
  }

  return user;
}
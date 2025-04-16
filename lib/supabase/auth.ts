import { createClient } from "@/lib/supabase/server"

export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }

  return user;
}
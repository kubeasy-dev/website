import { createBrowserClient } from "@supabase/ssr";
import { Database } from "../database.types";
import { SupabaseClient } from '@supabase/supabase-js'

export type TypedSupabaseClient = SupabaseClient<Database>

let client: TypedSupabaseClient | undefined

export const createClient = () => {
  if (client) {
    return client
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

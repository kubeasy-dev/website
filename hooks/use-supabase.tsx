import { createClient } from "@/lib/supabase/client";
import { useMemo } from "react";

export default function useSupabase() {
  return useMemo(createClient, [])
}
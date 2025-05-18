import { useQuery } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import useSupabase from "./use-supabase";

export function useUser() {
  const supabase = useSupabase();
  return useQuery({
    queryKey: ["user"],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
    refetchOnWindowFocus: true,
  });
}

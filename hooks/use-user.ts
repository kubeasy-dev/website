import { useQuery } from "@tanstack/react-query";
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

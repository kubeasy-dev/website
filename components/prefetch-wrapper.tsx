import { prefetchQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

export async function PrefetchWrapper({ queries, children }: { queries: PromiseLike<PostgrestSingleResponse<unknown>>[]; children: React.ReactNode }) {
  const queryClient = new QueryClient();

  await Promise.all(queries.map((query) => prefetchQuery(queryClient, query)));

  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>;
}

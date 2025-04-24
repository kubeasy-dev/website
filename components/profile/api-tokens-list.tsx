"use client";

import { queries } from "@/lib/queries";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { ApiTokenTable } from "./api-tokens-table";
import useSupabase from "@/hooks/use-supabase";
import Loading from "../loading";

export function ApiTokensList() {
  const supabase = useSupabase();

  const { data: tokens, isLoading } = useQuery(queries.apiTokens.list(supabase));

  if (isLoading) {
    return <Loading />;
  }

  return tokens?.length === 0 ? (
    <div className='flex flex-col items-center justify-center gap-4 h-20'>
      <p className='text-muted-foreground'>No API tokens found.</p>
    </div>
  ) : (
    <section className='flex flex-col gap-4'>
      <ApiTokenTable tokens={tokens || []} />
    </section>
  );
}

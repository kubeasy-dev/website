"use client";

import React, { useState } from "react";
import useSupabase from "@/hooks/use-supabase";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { useDebounce } from "@/hooks/use-debounce";
import Loading from "@/components/loading";
import { Input } from "@/components/ui/input";
import { ChallengeTable } from "./challenge-table";
import { ChallengeBoard } from "./challenge-board";
import { useViewMode } from "@/hooks/use-view-mode";
import { Button } from "../ui/button";
import { Columns3Icon, Grid3X3Icon } from "lucide-react";
import { ChallengeStats } from "./challenge-stats";

export function ChallengeList() {
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Debounce search to avoid too many server requests
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const supabase = useSupabase();

  const { data: challenges, isLoading: queryLoading } = useQuery(queries.challengeProgress.list(supabase, { searchQuery: debouncedSearchTerm }));

  const { viewMode, setViewMode, isLoading } = useViewMode();

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='w-full flex flex-col gap-6'>
      <ChallengeStats />
      <section>
        <h2 className='text-2xl font-bold mb-4'>Explore challenges</h2>
        <div className='flex flex-row items-center gap-4 mb-6'>
          <div className='grow'>
            <Input type='text' placeholder='Search challenges...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='grow bg-card' />
          </div>
          <div className='space-x-2'>
            <div className='flex items-center space-x-2'>
              <Button variant={viewMode === "board" ? "default" : "outline-solid"} size='sm' onClick={() => setViewMode("board")} className='flex items-center gap-1'>
                <Columns3Icon />
                Board
              </Button>
              <Button variant={viewMode === "table" ? "default" : "outline-solid"} size='sm' onClick={() => setViewMode("table")} className='flex items-center gap-1'>
                <Grid3X3Icon />
                Table
              </Button>
            </div>
          </div>
        </div>
        {(() => {
          let content;
          if (queryLoading) {
            content = <Loading />;
          } else if (viewMode === "table") {
            content = <ChallengeTable challenges={challenges} />;
          } else {
            content = <ChallengeBoard challenges={challenges} />;
          }
          return <div>{content}</div>;
        })()}
      </section>
    </div>
  );
}

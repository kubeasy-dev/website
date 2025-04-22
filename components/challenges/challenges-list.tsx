"use client";

import React from "react";
import useSupabase from "@/hooks/use-supabase";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import Loading from "@/components/loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ChallengesTable } from "./challenges-table";
import { ChallengesBoard } from "./challenges-board";
import { useViewMode } from "@/hooks/use-view-mode";

export function ChallengesList() {
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
    <div className='w-full px-20'>
      <div className='flex flex-row items-center gap-4 mb-6'>
        <div className='w-10/12'>
          <Input type='text' placeholder='Search challenges...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='flex-grow' />
        </div>
        <div className='w-2/12 space-x-2'>
          <RadioGroup value={viewMode} onValueChange={(val: "board" | "table") => setViewMode(val)} className='flex items-center space-x-2'>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='board' id='board' />
              <Label htmlFor='board'>Board View</Label>
            </div>
            <div className='flex items-center space-x-2'>
              <RadioGroupItem value='table' id='table' />
              <Label htmlFor='table'>Table View</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
      <div>{queryLoading ? <Loading /> : viewMode === "table" ? <ChallengesTable challenges={challenges} /> : <ChallengesBoard challenges={challenges} />}</div>
    </div>
  );
}

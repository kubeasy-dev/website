"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { difficulties } from "@/lib/constants";
import type {
  ChallengeDifficulty,
  ChallengeFilters,
} from "@/schemas/challengeFilters";
import { useTRPC } from "@/trpc/client";

interface ChallengesFiltersProps {
  onFilterChange: (filters: ChallengeFilters) => void;
}

export function ChallengesFilters({
  onFilterChange,
}: Readonly<ChallengesFiltersProps>) {
  const [theme, setTheme] = useState<string | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<
    (ChallengeDifficulty | "all") | undefined
  >(undefined);
  const [search, setSearch] = useState<string>("");

  const trpc = useTRPC();
  const { data: themes } = useSuspenseQuery(trpc.theme.list.queryOptions());

  const handleThemeChange = (value: string) => {
    setTheme(value);
    if (value === "all") {
      onFilterChange({
        theme: undefined,
        difficulty: difficulty === "all" ? undefined : difficulty,
        search: search === "" ? undefined : search,
      });
    } else {
      onFilterChange({
        theme: value,
        difficulty: difficulty === "all" ? undefined : difficulty,
        search: search === "" ? undefined : search,
      });
    }
  };

  const handleDifficultyChange = (value: ChallengeDifficulty | "all") => {
    setDifficulty(value);
    if (value === "all") {
      onFilterChange({
        theme,
        difficulty: undefined,
        search: search === "" ? undefined : search,
      });
    } else {
      onFilterChange({
        theme,
        difficulty: value,
        search: search === "" ? undefined : search,
      });
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({
      theme,
      difficulty: difficulty === "all" ? undefined : difficulty,
      search: value === "" ? undefined : value,
    });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 flex-1">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
        <Input
          placeholder="Search challenges..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-12 pr-4 py-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-base focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"
        />
      </div>
      <Select value={theme} onValueChange={handleThemeChange}>
        <SelectTrigger className="w-full md:w-[200px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold py-6 text-base">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <SelectItem value="all" className="font-bold">
            All Themes
          </SelectItem>
          {themes.map((t) => (
            <SelectItem key={t.slug} value={t.slug} className="font-bold">
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={difficulty} onValueChange={handleDifficultyChange}>
        <SelectTrigger className="w-full md:w-[200px] border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold py-6 text-base">
          <SelectValue placeholder="Difficulty" />
        </SelectTrigger>
        <SelectContent className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {difficulties.map((diff) => (
            <SelectItem
              key={diff.value}
              value={diff.value}
              className="font-bold"
            >
              {diff.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

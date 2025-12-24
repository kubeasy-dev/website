"use client";

import { Suspense, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChallengesFilters } from "@/components/challenges-filters";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import type { ChallengeFilters } from "@/schemas/challengeFilters";
import { ChallengesGrid } from "./challenges-grid";

export function ChallengesView() {
  const { data: session, isPending } = authClient.useSession();
  const [filters, setFilters] = useState<ChallengeFilters>({
    difficulty: undefined,
    theme: undefined,
    search: undefined,
    showCompleted: true,
  });

  return (
    <>
      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <ChallengesFilters
            onFilterChange={(newFilters) =>
              setFilters({
                difficulty: newFilters.difficulty,
                theme: newFilters.theme,
                search: newFilters.search,
                showCompleted: filters.showCompleted,
              })
            }
          />
          {session && (
            <Button
              variant={filters.showCompleted ? "outline" : "default"}
              onClick={() =>
                setFilters({
                  ...filters,
                  showCompleted: !filters.showCompleted,
                })
              }
              disabled={!session || isPending}
              className="neo-border-thick font-black neo-shadow hover:neo-shadow-lg transition-shadow px-6 py-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !session ? "Sign in to filter completed challenges" : undefined
              }
            >
              {filters.showCompleted ? "Hide Completed" : "Show Completed"}
            </Button>
          )}
        </div>
      </div>

      {/* Challenges Grid */}
      <ErrorBoundary
        fallback={<div>Something went wrong loading the challenges.</div>}
      >
        <Suspense fallback={<div>Loading...</div>}>
          <ChallengesGrid filters={filters} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
}

"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { ChallengeCard } from "@/components/challenge-card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { ChallengeFilters } from "@/schemas/challengeFilters";
import { useTRPC } from "@/trpc/client";

export function ChallengesGrid({
  filters,
}: Readonly<{ filters: ChallengeFilters }>) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.challenge.list.queryOptions(filters));

  return (
    <div>
      {data.challenges.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.challenges.map((challenge) => (
            <ChallengeCard key={challenge.slug} challenge={challenge} />
          ))}
        </div>
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No challenges found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your filters or search criteria to find what
              you&apos;re looking for.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}

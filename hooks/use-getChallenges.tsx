"use client";

import { getChallenges } from "@/lib/actions";
import { ChallengeExtended } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export type ChallengesFilters = {
  searchTerm?: string;
  showAchieved?: boolean;
};

export default function useGetChallenges(
  initialData: ChallengeExtended[],
  filters: ChallengesFilters = {}
) {
  return useInfiniteQuery<ChallengeExtended[]>({
    queryKey: ["challenges", filters],
    queryFn: ({ pageParam }) => getChallenges(pageParam as number, filters),
    initialData: { pages: [initialData], pageParams: [1] },
    initialPageParam: 1,
    getNextPageParam(lastPage, allPages) {
      return lastPage.length > 0 ? allPages.length + 1 : undefined;
    },
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });
}
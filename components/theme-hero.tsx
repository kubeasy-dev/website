"use client";

import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { LucideIcon, type LucideIconName } from "./lucide-icon";

export function ThemeHero({ themeSlug }: { themeSlug: string }) {
  const trpc = useTRPC();
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;

  // Fetch theme data (always available)
  const { data: theme } = useSuspenseQuery(
    trpc.theme.get.queryOptions({ slug: themeSlug }),
  );

  // Fetch challenges count (always available)
  const { data: challengesData } = useSuspenseQuery(
    trpc.challenge.list.queryOptions({ theme: themeSlug }),
  );

  // Fetch progression only if authenticated - use regular useQuery with enabled
  const { data: progressionData } = useQuery({
    ...trpc.userProgress.getCompletionPercentage.queryOptions({
      themeSlug,
    }),
    enabled: isAuthenticated,
  });

  if (!theme) {
    return null;
  }

  const totalChallenges = challengesData?.count ?? 0;

  return (
    <div className="bg-secondary text-foreground p-8 md:p-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
        <div className="flex items-start gap-6">
          {theme.logo && (
            <div className="p-6 bg-primary border-4 border-black shrink-0">
              <LucideIcon
                name={theme.logo as LucideIconName}
                className="h-12 w-12 text-primary-foreground"
              />
            </div>
          )}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-primary text-primary-foreground border-3 border-black font-black uppercase text-xs mb-3">
              <TrendingUp className="h-3 w-3" />
              <span>{totalChallenges} Challenges</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
              {theme.name}
            </h1>
            <p className="text-xl font-bold opacity-90 max-w-3xl leading-relaxed">
              {theme.description}
            </p>
          </div>
        </div>

        {/* Stats Cards - Only show if user is authenticated */}
        {isAuthenticated && progressionData && (
          <div className="flex flex-col gap-4 h-full">
            <div className="bg-primary text-primary-foreground backdrop-blur-sm px-6 py-4 border-3 border-black flex-1 flex flex-col justify-center">
              <div className="text-3xl font-black">
                {progressionData.completedCount}
              </div>
              <div className="text-sm font-bold uppercase opacity-90">
                Completed
              </div>
            </div>
            <div className="bg-primary text-primary-foreground backdrop-blur-sm px-6 py-4 border-3 border-black flex-1 flex flex-col justify-center">
              <div className="text-3xl font-black">
                {progressionData.percentageCompleted}%
              </div>
              <div className="text-sm font-bold uppercase opacity-90">
                Progress
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

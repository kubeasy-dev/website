"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, Flame, Star } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";

export function UserStats() {
  const trpc = useTRPC();
  const { data: session, isPending } = authClient.useSession();

  // Only fetch stats if user is authenticated
  const { data: completionData } = useQuery({
    ...trpc.userProgress.getCompletionPercentage.queryOptions(),
    enabled: !!session,
  });
  const { data: xpAndRank } = useQuery({
    ...trpc.userProgress.getXpAndRank.queryOptions(),
    enabled: !!session,
  });
  const { data: streak } = useQuery({
    ...trpc.userProgress.getStreak.queryOptions(),
    enabled: !!session,
  });

  // Don't render if not authenticated or still loading
  if (
    isPending ||
    !session ||
    !completionData ||
    !xpAndRank ||
    streak === undefined
  ) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-6 mb-8">
      {/* Challenges Completed Card */}
      <div className="p-6 bg-secondary neo-border-thick neo-shadow-lg hover:neo-shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary neo-border">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div className="text-4xl font-black text-foreground">
            {completionData.completedCount}
          </div>
        </div>
        <div className="text-sm font-bold text-foreground uppercase tracking-wide">
          Challenges completed
        </div>
        <div className="mt-1 text-xs font-bold text-foreground">
          {completionData.percentageCompleted}% done
        </div>
      </div>

      {/* Rank Card */}
      <div className="p-6 bg-primary neo-border-thick neo-shadow-lg hover:neo-shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white neo-border">
            <Star className="h-6 w-6 text-accent" />
          </div>
          <div className="text-2xl font-black text-white leading-tight">
            {xpAndRank.rank}
          </div>
        </div>
        <div className="text-sm font-bold text-white uppercase tracking-wide">
          Rank
        </div>
        <div className="mt-1 text-xs font-bold text-white/80">
          {xpAndRank.xpEarned} xp earned
        </div>
      </div>

      {/* Streak Card */}
      <div className="p-6 bg-[#FF6B6B] neo-border-thick neo-shadow-lg hover:neo-shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white neo-border">
            <Flame className="h-6 w-6 text-[#FF6B6B]" />
          </div>
          <div className="text-4xl font-black text-white">{streak}</div>
        </div>
        <div className="text-sm font-bold text-white uppercase tracking-wide">
          Day Streak
        </div>
        <div className="mt-1 text-xs font-bold text-white/80">
          {streak === 0 ? "Start your journey! 🔥" : "Keep it up! 🔥"}
        </div>
      </div>
    </div>
  );
}

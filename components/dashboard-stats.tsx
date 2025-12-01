"use client";

import { useQuery } from "@tanstack/react-query";
import { Award, Flame, Star, Trophy } from "lucide-react";
import { useTRPC } from "@/trpc/client";

function StatCardSkeleton() {
  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 bg-primary/20 border-4 border-border rounded-lg" />
        <div>
          <div className="h-4 w-16 bg-foreground/10 rounded mb-2" />
          <div className="h-8 w-20 bg-foreground/10 rounded" />
        </div>
      </div>
      <div className="h-4 w-32 bg-foreground/10 rounded" />
    </div>
  );
}

function CompletedStat() {
  const trpc = useTRPC();
  const { data: completionData, isLoading } = useQuery({
    ...trpc.userProgress.getCompletionPercentage.queryOptions({
      splitByTheme: false,
    }),
  });

  if (isLoading || !completionData) {
    return <StatCardSkeleton />;
  }

  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-primary border-4 border-border neo-shadow rounded-lg">
          <Award className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Completed</p>
          <p className="text-3xl font-black text-foreground">
            {completionData.completedCount}
          </p>
        </div>
      </div>
      <p className="text-sm font-bold text-foreground">
        {completionData.percentageCompleted}% of all challenges
      </p>
    </div>
  );
}

function XpStat() {
  const trpc = useTRPC();
  const { data: xpAndRank, isLoading } = useQuery({
    ...trpc.userProgress.getXpAndRank.queryOptions(),
  });

  if (isLoading || !xpAndRank) {
    return <StatCardSkeleton />;
  }

  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-primary border-4 border-border neo-shadow rounded-lg">
          <Trophy className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Points</p>
          <p className="text-3xl font-black text-foreground">
            {xpAndRank.xpEarned}
          </p>
        </div>
      </div>
      <p className="text-sm font-bold text-foreground">Total XP earned</p>
    </div>
  );
}

function RankStat() {
  const trpc = useTRPC();
  const { data: xpAndRank, isLoading } = useQuery({
    ...trpc.userProgress.getXpAndRank.queryOptions(),
  });

  if (isLoading || !xpAndRank) {
    return <StatCardSkeleton />;
  }

  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-primary border-4 border-border neo-shadow rounded-lg">
          <Star className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Rank</p>
          <p className="text-2xl font-black text-foreground leading-tight">
            {xpAndRank.rank}
          </p>
        </div>
      </div>
      <p className="text-sm font-bold text-foreground">Congratulations!</p>
    </div>
  );
}

function StreakStat() {
  const trpc = useTRPC();
  const { data: streak, isLoading } = useQuery({
    ...trpc.userProgress.getStreak.queryOptions(),
  });

  if (isLoading || streak === undefined) {
    return <StatCardSkeleton />;
  }

  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-primary border-4 border-border neo-shadow rounded-lg">
          <Flame className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Day Streak</p>
          <p className="text-3xl font-black text-foreground">{streak}</p>
        </div>
      </div>
      <p className="text-sm font-bold text-foreground">Keep it up!</p>
    </div>
  );
}

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <CompletedStat />
      <XpStat />
      <RankStat />
      <StreakStat />
    </div>
  );
}

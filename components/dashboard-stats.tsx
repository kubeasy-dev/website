import { Award, Flame, Star, Trophy } from "lucide-react";
import { Suspense } from "react";
import { getQueryClient, trpc } from "@/trpc/server";

// Skeleton pour une carte
function StatCardSkeleton() {
  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 bg-primary/20 border-4 border-border rounded-lg"></div>
        <div>
          <div className="h-4 w-16 bg-foreground/10 rounded mb-2"></div>
          <div className="h-8 w-20 bg-foreground/10 rounded"></div>
        </div>
      </div>
      <div className="h-4 w-32 bg-foreground/10 rounded"></div>
    </div>
  );
}

// Stat individuelle : Challenges complétés
async function CompletedStat() {
  const queryClient = getQueryClient();
  const challengesCompletions = await queryClient.fetchQuery(
    trpc.userProgress.getCompletionPercentage.queryOptions({
      splitByTheme: false,
    }),
  );

  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-6">
      <div className="flex items-center gap-4 mb-3">
        <div className="p-3 bg-primary border-4 border-border neo-shadow rounded-lg">
          <Award className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Completed</p>
          <p className="text-3xl font-black text-foreground">
            {challengesCompletions.completedCount}
          </p>
        </div>
      </div>
      <p className="text-sm font-bold text-foreground">
        {challengesCompletions.percentageCompleted}% of all challenges
      </p>
    </div>
  );
}

// Stat individuelle : Points XP
async function XpStat() {
  const queryClient = getQueryClient();
  const xpAndRank = await queryClient.fetchQuery(
    trpc.userProgress.getXpAndRank.queryOptions(),
  );

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

// Stat individuelle : Rank
async function RankStat() {
  const queryClient = getQueryClient();
  const xpAndRank = await queryClient.fetchQuery(
    trpc.userProgress.getXpAndRank.queryOptions(),
  );

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

// Stat individuelle : Streak
async function StreakStat() {
  const queryClient = getQueryClient();
  const streak = await queryClient.fetchQuery(
    trpc.userProgress.getStreak.queryOptions(),
  );

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

// Composant parent qui wrap chaque stat avec Suspense
export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <Suspense fallback={<StatCardSkeleton />}>
        <CompletedStat />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton />}>
        <XpStat />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton />}>
        <RankStat />
      </Suspense>

      <Suspense fallback={<StatCardSkeleton />}>
        <StreakStat />
      </Suspense>
    </div>
  );
}

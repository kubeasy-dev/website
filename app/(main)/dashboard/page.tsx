import { all } from "better-all";
import { Clock, Target, TrendingUp, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { DashboardChart } from "@/components/dashboard-chart";
import { DashboardRecentGains } from "@/components/dashboard-recent-gains";
import { DashboardStats } from "@/components/dashboard-stats";
import { DashboardChecklist } from "@/components/onboarding/dashboard-checklist";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { requireAuth } from "@/lib/require-auth";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getQueryClient, HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = generateSEOMetadata({
  title: "Dashboard",
  description: "Track your Kubernetes learning progress and achievements",
  url: "/dashboard",
  noIndex: true, // Private page, don't index
});

function DashboardChartSkeleton() {
  return (
    <div className="bg-secondary neo-border-thick neo-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-primary/20 neo-border-thick rounded-lg"></div>
        <div className="h-8 w-48 bg-foreground/10 rounded"></div>
      </div>
      <div className="h-[200px] bg-foreground/5 rounded animate-pulse"></div>
      <div className="mt-4 p-4 bg-secondary neo-border-thick rounded-lg">
        <div className="h-4 w-full bg-foreground/10 rounded"></div>
      </div>
    </div>
  );
}

function DashboardRecentGainsSkeleton() {
  return (
    <div className="bg-secondary neo-border-thick neo-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-primary/20 neo-border-thick rounded-lg"></div>
        <div className="h-8 w-48 bg-foreground/10 rounded"></div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, i) => `skeleton-${i}`).map((key) => (
          <div
            key={key}
            className="p-4 bg-background neo-border-thick neo-shadow-sm animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 neo-border-thick rounded-lg bg-foreground/10"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 bg-foreground/10 rounded"></div>
                <div className="h-4 w-full bg-foreground/10 rounded"></div>
                <div className="h-6 w-20 bg-primary/20 rounded"></div>
                <div className="h-3 w-24 bg-foreground/10 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-full mt-6 h-12 bg-foreground/10 rounded"></div>
    </div>
  );
}

function DashboardChartError() {
  return (
    <div className="bg-secondary neo-border-thick neo-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary neo-border-thick neo-shadow rounded-lg">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-black">Skills by Themes</h2>
      </div>
      <div className="h-[400px] flex items-center justify-center bg-destructive/10 neo-border-thick neo-border-destructive rounded-lg">
        <p className="text-lg font-bold text-destructive">
          Failed to load chart
        </p>
      </div>
    </div>
  );
}

function DashboardRecentGainsError() {
  return (
    <div className="bg-secondary neo-border-thick neo-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary neo-border-thick neo-shadow rounded-lg">
          <Clock className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-black">Recent Activity</h2>
      </div>
      <div className="h-[200px] flex items-center justify-center bg-destructive/10 neo-border-thick neo-border-destructive rounded-lg">
        <p className="text-lg font-bold text-destructive">
          Failed to load recent activity
        </p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12">
          <div className="h-16 w-64 bg-foreground/10 rounded animate-pulse mb-4"></div>
          <div className="h-6 w-96 bg-foreground/10 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-secondary neo-border-thick neo-shadow p-6 h-32 animate-pulse"
            ></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <DashboardChartSkeleton />
          <DashboardRecentGainsSkeleton />
        </div>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const session = await requireAuth();
  const queryClient = getQueryClient();

  // Fetch onboarding status and prefetch data for client components
  const { onboardingStatus } = await all({
    async onboardingStatus() {
      return queryClient.fetchQuery(trpc.onboarding.getStatus.queryOptions());
    },
    async completionByTheme() {
      await prefetch(
        trpc.userProgress.getCompletionPercentage.queryOptions({
          splitByTheme: true,
        }),
      );
    },
    async completionTotal() {
      await prefetch(
        trpc.userProgress.getCompletionPercentage.queryOptions({
          splitByTheme: false,
        }),
      );
    },
    async xpAndRank() {
      await prefetch(trpc.userProgress.getXpAndRank.queryOptions());
    },
    async streak() {
      await prefetch(trpc.userProgress.getStreak.queryOptions());
    },
    async themes() {
      await prefetch(trpc.theme.list.queryOptions());
    },
  });

  const isOnboardingComplete =
    onboardingStatus.isComplete || onboardingStatus.steps.hasCompletedChallenge;
  const firstName = session.user.name?.split(" ")[0] || "there";

  return (
    <HydrateClient>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-black mb-4">
              {isOnboardingComplete ? (
                <>
                  Welcome back,{" "}
                  <span className="text-primary">{firstName}</span>!
                </>
              ) : (
                <>
                  Hey <span className="text-primary">{firstName}</span>, let's
                  get started!
                </>
              )}
            </h1>
            <p className="text-xl text-muted-foreground font-bold">
              {isOnboardingComplete
                ? "Track your Kubernetes learning journey"
                : "Complete the setup to start your Kubernetes journey"}
            </p>
          </div>

          {/* Onboarding Checklist - shown if not complete */}
          {!isOnboardingComplete && (
            <DashboardChecklist
              steps={onboardingStatus.steps}
              currentStep={onboardingStatus.currentStep}
            />
          )}

          {/* Stats and Charts - only shown after onboarding complete */}
          {isOnboardingComplete && (
            <>
              {/* Stats Cards */}
              <Suspense
                fallback={
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-secondary neo-border-thick neo-shadow p-6 h-32 animate-pulse"
                      />
                    ))}
                  </div>
                }
              >
                <DashboardStats />
              </Suspense>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Radar Chart */}
                <ErrorBoundary fallback={<DashboardChartError />}>
                  <Suspense fallback={<DashboardChartSkeleton />}>
                    <DashboardChart />
                  </Suspense>
                </ErrorBoundary>

                {/* Recent Activity */}
                <ErrorBoundary fallback={<DashboardRecentGainsError />}>
                  <Suspense fallback={<DashboardRecentGainsSkeleton />}>
                    <DashboardRecentGains />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </>
          )}

          {/* Quick Actions */}
          <div className="bg-primary neo-border-thick neo-shadow p-8">
            <h2 className="text-2xl font-black text-primary-foreground mb-6">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="secondary"
                className="neo-border neo-shadow font-black h-auto py-6 flex-col gap-2"
                asChild
              >
                <Link href="/challenges">
                  <Target className="w-8 h-8" />
                  <span>Browse Challenges</span>
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="neo-border neo-shadow font-black h-auto py-6 flex-col gap-2"
                asChild
              >
                <Link href="/themes">
                  <TrendingUp className="w-8 h-8" />
                  <span>Explore Themes</span>
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="neo-border neo-shadow font-black h-auto py-6 flex-col gap-2"
                asChild
              >
                <Link href={siteConfig.links.github} target="_blank">
                  <Trophy className="w-8 h-8" />
                  <span>View on GitHub</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}

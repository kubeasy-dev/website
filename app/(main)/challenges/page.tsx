import { Trophy } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChallengesView } from "@/components/challenges-view";
import { UserStats } from "@/components/user-stats";
import { getChallenges } from "@/server/db/queries";

// ISR: Revalidate every hour for SEO while keeping content fresh
export const revalidate = 3600;

export default async function ChallengesPage() {
  // Access database directly for ISR (no headers/session needed)
  const { count } = await getChallenges();

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground border-4 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Trophy className="h-4 w-4" />
          <span>{count} Challenges Available</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-balance">
          Kubernetes Challenges
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed font-bold">
          Master Kubernetes through hands-on practice. Each challenge is
          designed to teach you real-world skills you&apos;ll use in production.
        </p>
      </div>

      {/* Stats Cards - Client-side component handles auth check */}
      <ErrorBoundary fallback={<div>Error loading user statistics.</div>}>
        <Suspense
          fallback={
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-secondary border-4 border-black animate-pulse h-32" />
              <div className="p-6 bg-primary border-4 border-black animate-pulse h-32" />
              <div className="p-6 bg-[#FF6B6B] border-4 border-black animate-pulse h-32" />
            </div>
          }
        >
          <UserStats />
        </Suspense>
      </ErrorBoundary>

      {/* Challenges View */}
      <ChallengesView />
    </div>
  );
}

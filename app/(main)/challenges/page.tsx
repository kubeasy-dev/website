import { ArrowRight, Terminal, Trophy } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChallengesView } from "@/components/challenges-view";
import { UserStats } from "@/components/user-stats";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getChallenges } from "@/server/db/queries";

// ISR: Revalidate every hour for SEO while keeping content fresh
export const revalidate = 3600;

export const metadata: Metadata = generateSEOMetadata({
  title: "Kubernetes Challenges",
  description:
    "Master Kubernetes through hands-on practice. Browse our collection of real-world challenges designed to teach you production-ready skills.",
  url: "/challenges",
  keywords: [
    "kubernetes challenges",
    "kubernetes exercises",
    "hands-on kubernetes",
    "kubernetes practice",
    "kubernetes learning",
    "k8s challenges",
    "kubernetes tutorial",
  ],
});

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

      {/* Quick Start CTA */}
      <div className="mb-8 p-4 bg-secondary border-4 border-black neo-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Terminal className="h-5 w-5 text-primary" />
          <span className="font-bold">
            New to Kubeasy? Follow our setup guide to start your first
            challenge.
          </span>
        </div>
        <Link
          href="/get-started"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 font-bold border-2 border-black hover:translate-x-0.5 hover:translate-y-0.5 transition-transform whitespace-nowrap"
        >
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* All Challenges View */}
      <ChallengesView />
    </div>
  );
}

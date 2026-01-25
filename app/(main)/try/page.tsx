import type { Metadata } from "next";
import { headers } from "next/headers";
import { Suspense } from "react";
import { DemoContent } from "@/components/demo/demo-content";
import { FullOnboarding } from "@/components/demo/full-onboarding";
import { auth } from "@/lib/auth";
import { isRedisConfigured } from "@/lib/redis";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getStarterChallenges } from "@/server/db/queries";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = generateSEOMetadata({
  title: "Try Kubeasy",
  description:
    "Try Kubeasy instantly without signing up. Create your first Kubernetes pod and see your results in real-time.",
  url: "/try",
  keywords: [
    "kubeasy demo",
    "try kubernetes",
    "kubernetes tutorial",
    "learn kubernetes free",
    "kubernetes hands-on",
    "kubernetes playground",
  ],
});

function TrySkeleton() {
  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="mb-12 space-y-6 text-center">
        <div className="h-12 w-32 bg-foreground/10 rounded mx-auto animate-pulse" />
        <div className="h-12 w-96 bg-foreground/10 rounded mx-auto animate-pulse" />
        <div className="h-6 w-full max-w-2xl bg-foreground/10 rounded mx-auto animate-pulse" />
      </div>
      <div className="mb-12 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 bg-secondary neo-border-thick neo-shadow animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

async function AuthenticatedContent() {
  const starterChallenges = await getStarterChallenges(5);

  // Prefetch objectives for all starter challenges
  await Promise.all(
    starterChallenges.map((challenge) =>
      prefetch(
        trpc.challenge.getObjectives.queryOptions({ slug: challenge.slug }),
      ),
    ),
  );

  return (
    <HydrateClient>
      <FullOnboarding challenges={starterChallenges} />
    </HydrateClient>
  );
}

async function UnauthenticatedContent() {
  // Check if Redis is configured for demo mode
  if (!isRedisConfigured) {
    return (
      <div className="container mx-auto px-4 max-w-4xl text-center py-20">
        <h1 className="text-3xl font-black mb-4">Demo Mode Unavailable</h1>
        <p className="text-muted-foreground font-bold mb-8">
          Demo mode is temporarily unavailable. Please sign in to access the
          full experience.
        </p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-black text-lg neo-border neo-shadow hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <HydrateClient>
      <DemoContent />
    </HydrateClient>
  );
}

export default async function TryPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    // User is authenticated - show full onboarding
    return (
      <Suspense fallback={<TrySkeleton />}>
        <AuthenticatedContent />
      </Suspense>
    );
  }

  // User is not authenticated - show demo mode
  return (
    <Suspense fallback={<TrySkeleton />}>
      <UnauthenticatedContent />
    </Suspense>
  );
}

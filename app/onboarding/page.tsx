import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireAuth } from "@/lib/require-auth";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getQueryClient, HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = generateSEOMetadata({
  title: "Get Started",
  description: "Set up Kubeasy and complete your first Kubernetes challenge",
  url: "/onboarding",
  noIndex: true, // Private page, don't index
});

function OnboardingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Progress bar skeleton */}
      <div className="py-8 px-4 border-b neo-border-thick bg-secondary/50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-4 w-24 bg-foreground/10 rounded animate-pulse" />
            <div className="flex gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-foreground/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-foreground/10 rounded-lg animate-pulse" />
            <div className="h-10 w-64 bg-foreground/10 rounded animate-pulse" />
            <div className="h-6 w-80 bg-foreground/10 rounded animate-pulse" />
          </div>
          <div className="h-48 bg-secondary neo-border-thick animate-pulse" />
          <div className="flex gap-4">
            <div className="h-12 flex-1 bg-primary/20 rounded animate-pulse" />
            <div className="h-12 w-32 bg-foreground/10 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

async function OnboardingContent() {
  const session = await requireAuth();
  const queryClient = getQueryClient();

  // Fetch onboarding status
  const status = await queryClient.fetchQuery(
    trpc.onboarding.getStatus.queryOptions(),
  );

  // If already completed or skipped, redirect to dashboard
  if (status.isComplete || status.isSkipped) {
    redirect("/dashboard");
  }

  // Prefetch for client components
  await prefetch(trpc.onboarding.getStatus.queryOptions());

  const userName = session.user.name?.split(" ")[0] || "there";
  const userId = session.user.id;

  return (
    <HydrateClient>
      <OnboardingWizard
        userName={userName}
        userId={userId}
        initialStatus={status}
      />
    </HydrateClient>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OnboardingContent />
    </Suspense>
  );
}

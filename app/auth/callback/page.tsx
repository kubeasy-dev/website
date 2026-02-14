import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireAuth } from "@/lib/require-auth";
import { getQueryClient, trpc } from "@/trpc/server";

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
        <p className="text-lg font-bold text-foreground/70">
          Setting up your account...
        </p>
      </div>
    </div>
  );
}

async function CallbackContent() {
  // Ensure user is authenticated
  await requireAuth();
  const queryClient = getQueryClient();

  // Check onboarding status
  const status = await queryClient.fetchQuery(
    trpc.onboarding.getStatus.queryOptions(),
  );

  // Redirect based on onboarding status
  if (status.isComplete || status.isSkipped) {
    // User has completed or skipped onboarding
    redirect("/dashboard");
  }

  // New user or user who hasn't completed onboarding
  // Check if they have any progress at all
  if (
    !status.steps.hasApiToken &&
    !status.steps.cliAuthenticated &&
    !status.steps.hasCompletedChallenge
  ) {
    // New user with no progress - send to onboarding
    redirect("/onboarding");
  }

  // User with some progress but not completed - send to dashboard with checklist
  redirect("/dashboard");

  // This line is unreachable but satisfies TypeScript's return type requirement
  // redirect() throws, so this never executes
  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <CallbackContent />
    </Suspense>
  );
}

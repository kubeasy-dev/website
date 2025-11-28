"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { NotLoggedIn } from "./challenge-status/not-logged-in";

interface ChallengeStatusProps {
  slug: string;
  objective: string;
}

export function ChallengeStatus({ slug, objective }: ChallengeStatusProps) {
  const { data: session } = authClient.useSession();
  const trpc = useTRPC();

  // Poll every 5 seconds for status updates (only if user is logged in)
  const { data: statusData } = useQuery({
    ...trpc.userProgress.getStatus.queryOptions({ slug }),
    enabled: !!session?.user,
    refetchInterval: 5000, // Poll every 5 seconds
    refetchIntervalInBackground: true,
  });

  // If user is not logged in, show "not started" state with CLI CTA
  if (!session?.user) {
    return <NotLoggedIn slug={slug} />;
  }

  // All states (not_started, in_progress, completed) are now handled in ChallengeMission
  return null;
}

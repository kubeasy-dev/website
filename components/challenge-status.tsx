"use client";

import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/trpc/client";
import { Completed } from "./challenge-status/completed";
import { InProgress } from "./challenge-status/in-progress";
import { NotLoggedIn } from "./challenge-status/not-logged-in";
import { NotStarted } from "./challenge-status/not-started";

interface ChallengeStatusProps {
  slug: string;
}

export function ChallengeStatus({ slug }: ChallengeStatusProps) {
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

  const status = statusData?.status ?? "not_started";

  // Route to appropriate component based on status
  switch (status) {
    case "not_started":
      return <NotStarted slug={slug} />;
    case "in_progress":
      return <InProgress slug={slug} />;
    case "completed":
      return <Completed slug={slug} />;
    default:
      return <NotStarted slug={slug} />;
  }
}

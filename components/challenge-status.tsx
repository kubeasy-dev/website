"use client";

import { authClient } from "@/lib/auth-client";
import { NotLoggedIn } from "./challenge-status/not-logged-in";

interface ChallengeStatusProps {
  slug: string;
}

export function ChallengeStatus({ slug }: ChallengeStatusProps) {
  const { data: session } = authClient.useSession();

  // If user is not logged in, show "not started" state with CLI CTA
  if (!session?.user) {
    return <NotLoggedIn slug={slug} />;
  }

  // All states (not_started, in_progress, completed) are now handled in ChallengeMission
  return null;
}

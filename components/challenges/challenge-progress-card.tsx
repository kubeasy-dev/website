import React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Challenge, UserProgress } from '@/lib/types';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StartButton, RestartButton } from '@/components/challenges/progress-actions';
import { generateCacheTag } from '@/lib/cache';


const getChallengeProgress = async (challengeId: string, userId: string) => {
  const cacheKey = generateCacheTag("user_progress", { user_id: userId, challenge_id: challengeId });
  const supabase = await createClient(cacheKey);

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('challenge_id', challengeId)
    .order('started_at', { ascending: false })
    .single();

  if (error) {
    throw new Error(`Failed to fetch challenge progress: ${error.message}`);
  }

  return data || null;
}


/**
 * Main Challenge Progress Card Component - Server Component
 * Fetches data server-side and renders the appropriate sub-component
 */
export default async function ChallengeProgressCard({
  challenge,
}: Readonly<{
  challenge: Challenge;
}>) {
  // Fetch user progress data server-side
  let userProgress: UserProgress | null = null;

  const supabase = await createClient(null)
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id;

  if (userId) {
    userProgress = await getChallengeProgress(challenge.id, userId);
  }

  // Render appropriate component based on auth state and user progress
  if (!userId) {
    return <NotLoggedInCard challengeSlug={challenge.slug} />;
  }

  if (!userProgress || userProgress.status === "not_started") {
    return <NotStartedCard challenge={challenge} />;
  }

  if (userProgress.status === "in_progress") {
    return <InProgressCard userProgress={userProgress} challenge={challenge} />;
  }

  if (userProgress.status === "completed") {
    return <CompletedCard userProgress={userProgress} challenge={challenge} />;
  }

  // Fallback
  return <ErrorCard />;
}

/**
 * Card displayed when user is not logged in
 */
function NotLoggedInCard({
  challengeSlug
}: Readonly<{
  challengeSlug: string | null
}>) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Track Your Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-muted-foreground">
          Sign in to track your progress on this challenge.
        </p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/login?next=${encodeURIComponent('/challenges/' + challengeSlug)}`}
          className="w-full"
        >
          <Button className="w-full">Sign in to continue</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

/**
 * Card displayed when the challenge has not been started yet
 */
function NotStartedCard({
  challenge,
}: Readonly<{
  challenge: Challenge,
}>) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ready to Start?</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Begin this challenge to track your progress and earn achievements.
        </p>
      </CardContent>
      <CardFooter>
        <StartButton challengeId={challenge.id} />
      </CardFooter>
    </Card>
  );
}

/**
 * Card displayed when the challenge is in progress
 */
function InProgressCard({
  userProgress,
  challenge,
}: Readonly<{
  userProgress: UserProgress,
  challenge: Challenge,
}>) {
  const startedAt = userProgress.started_at
    ? formatDistanceToNow(new Date(userProgress.started_at), { addSuffix: true, locale: fr })
    : "recently";

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>In Progress</CardTitle>
          <Badge variant="secondary">Active</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Started:</span> {startedAt}
        </p>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Progress</p>
          <Progress value={50} className="h-2" />
        </div>
        <p className="text-sm text-muted-foreground">
          Keep working on this challenge. You're making great progress!
        </p>
      </CardContent>
      <CardFooter>
        <RestartButton challengeId={challenge.id} />
      </CardFooter>
    </Card>
  );
}

/**
 * Card displayed when the challenge is completed
 */
function CompletedCard({
  userProgress,
  challenge,
}: Readonly<{
  userProgress: UserProgress,
  challenge: Challenge,
}>) {
  const completedAt = userProgress.completed_at
    ? formatDistanceToNow(new Date(userProgress.completed_at), { addSuffix: true, locale: fr })
    : "recently";

  const duration = userProgress.started_at && userProgress.completed_at
    ? Math.round((new Date(userProgress.completed_at).getTime() - new Date(userProgress.started_at).getTime()) / (1000 * 60))
    : null;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Completed!</CardTitle>
          <Badge variant="default">Finished</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">Completed:</span> {completedAt}
        </p>
        {duration && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Duration:</span> {duration} minutes
          </p>
        )}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Progress</p>
          <Progress value={100} className="h-2" />
        </div>
        <p className="text-sm text-muted-foreground">
          Congratulations! You've successfully completed this challenge.
        </p>
      </CardContent>
      {/* Removed restart button from completed card */}
    </Card>
  );
}

/**
 * Error state card
 */
function ErrorCard() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Something went wrong</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          There was an error loading your progress. Please try refreshing the page.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="w-full"
        >
          Refresh Page
        </Button>
      </CardFooter>
    </Card>
  );
}

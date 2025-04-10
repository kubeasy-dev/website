"use client";

import React, { useOptimistic, useState, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { startChallenge, restartChallenge } from '@/lib/actions';

/**
 * Start Challenge Button Component - Client Component
 * Uses optimistic UI updates with server actions
 */
export function StartButton({
  challengeId,
}: Readonly<{
  challengeId: string;
}>) {
  const [isPending, setIsPending] = useState(false);
  const [optimisticState, addOptimisticState] = useOptimistic(
    { started: false },
    (state) => ({ ...state, started: true })
  );

  // Handle start challenge action
  async function handleStartChallenge() {
    setIsPending(true);
    
    // Wrap optimistic state update in startTransition
    startTransition(() => {
      addOptimisticState({});
    });

    try {
      await startChallenge(challengeId);
      toast.success("Challenge started successfully!");
    } catch (error) {
      toast.error("Failed to start challenge: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      onClick={handleStartChallenge}
      disabled={isPending || optimisticState.started}
    >
      {isPending && <span className="animate-spin mr-2">↻</span>}
      {optimisticState.started ? "Starting..." : "Start Challenge"}
    </Button>
  );
}

/**
 * Restart Challenge Button Component - Client Component
 * Uses optimistic UI updates with server actions
 */
export function RestartButton({
  challengeId,
}: Readonly<{
  challengeId: string;
}>) {
  const [isPending, setIsPending] = useState(false);
  const [optimisticState, addOptimisticState] = useOptimistic(
    { restarted: false },
    (state) => ({ ...state, restarted: true })
  );

  // Handle restart challenge action
  async function handleRestartChallenge() {
    setIsPending(true);
    
    // Wrap optimistic state update in startTransition
    startTransition(() => {
      addOptimisticState({});
    });

    try {
      await restartChallenge(challengeId);
      toast.success("Challenge restarted!");
    } catch (error) {
      toast.error("Failed to restart challenge: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      className="w-full"
      onClick={handleRestartChallenge}
      disabled={isPending || optimisticState.restarted}
    >
      {isPending && <span className="animate-spin mr-2">↻</span>}
      {optimisticState.restarted ? "Restarting..." : "Restart Challenge"}
    </Button>
  );
}
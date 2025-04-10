'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidateTag } from 'next/cache';

/**
 * Start a challenge for the current user
 */
export async function startChallenge(challengeId: string) {
  const supabase = await createClient(null)

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('user_progress')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error(`Failed to start challenge: ${error.message}`);
  }

  // Revalidate cached data
  revalidateTag(`userProgress-${userId}-${challengeId}`);

  return { success: true };
}

/**
 * Restart a challenge for the current user
 */
export async function restartChallenge(challengeId: string) {
  const supabase = await createClient(null)

  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Insert a new progress record with 'in_progress' status
  const { error } = await supabase
    .from('user_progress')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('challenge_id', challengeId);

  if (error) {
    throw new Error(`Failed to restart challenge: ${error.message}`);
  }

  // Revalidate cached data
  revalidateTag(`userProgress-${userId}-${challengeId}`);

  return { success: true };
}
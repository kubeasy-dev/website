/**
 * Calculate user's current streak (consecutive days with completions)
 *
 * Uses daily_streak transactions as source of truth
 */

import { and, eq, sql } from "drizzle-orm";
import db from "@/server/db";
import { userXpTransaction } from "@/server/db/schema";
import { MAX_STREAK_WINDOW_DAYS } from "./constants";

/**
 * Calculate the current streak for a user
 *
 * @param userId - User ID to calculate streak for
 * @returns Number of consecutive days (including today if completed)
 */
export async function calculateStreak(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const windowStart = new Date(today);
  windowStart.setDate(windowStart.getDate() - MAX_STREAK_WINDOW_DAYS);

  // Get all daily_streak transactions within the window
  const streakTransactions = await db
    .select({
      createdAt: userXpTransaction.createdAt,
    })
    .from(userXpTransaction)
    .where(
      and(
        eq(userXpTransaction.userId, userId),
        eq(userXpTransaction.action, "daily_streak"),
        sql`${userXpTransaction.createdAt} >= ${windowStart}`,
      ),
    )
    .orderBy(userXpTransaction.createdAt);

  if (streakTransactions.length === 0) {
    return 0;
  }

  // Get unique days (multiple transactions on same day count as 1)
  const uniqueDays = new Set<string>();
  for (const transaction of streakTransactions) {
    const date = new Date(transaction.createdAt);
    date.setHours(0, 0, 0, 0);
    uniqueDays.add(date.toISOString());
  }

  // Sort days in descending order (most recent first)
  const sortedDays = Array.from(uniqueDays)
    .map((dateStr) => new Date(dateStr))
    .sort((a, b) => b.getTime() - a.getTime());

  // Start from most recent day and count backwards
  let streak = 0;
  const expectedDate = new Date(today);

  // If last activity was not today or yesterday, streak is broken
  const mostRecentDay = sortedDays[0];
  const daysSinceLastActivity = Math.floor(
    (today.getTime() - mostRecentDay.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysSinceLastActivity > 1) {
    // Streak is broken (more than 1 day gap)
    return 0;
  }

  // If last activity was yesterday, start from yesterday
  if (daysSinceLastActivity === 1) {
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  // Count consecutive days backwards
  for (const day of sortedDays) {
    if (day.getTime() === expectedDate.getTime()) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      // Gap found, stop counting
      break;
    }
  }

  return streak;
}

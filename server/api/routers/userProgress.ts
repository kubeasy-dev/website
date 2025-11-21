import * as Sentry from "@sentry/nextjs";
import { and, count, desc, eq, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  trackChallengeCompletedServer,
  trackChallengeStartedServer,
  trackChallengeValidationFailedServer,
} from "@/lib/analytics-server";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import type db from "@/server/db";
import {
  challenge,
  challengeCompletionIdempotency,
  userProgress,
  userSubmission,
  userXp,
  userXpTransaction,
} from "@/server/db/schema";

const { logger } = Sentry;

// Rank thresholds based on XP
// Based on ~150 challenges (60 easy, 60 medium, 30 hard) = ~15,000 XP total
// Legend rank achievable at ~80% completion (12,000 XP / ~120 challenges)
const RANK_THRESHOLDS = [
  { name: "Novice", minXp: 0 },
  { name: "Beginner", minXp: 300 }, // ~3-6 challenges (2-4%)
  { name: "Advanced", minXp: 1200 }, // ~12-18 challenges (8-12%)
  { name: "Expert", minXp: 3500 }, // ~35 challenges (23%)
  { name: "Master", minXp: 7000 }, // ~70 challenges (47%)
  { name: "Legend", minXp: 12000 }, // ~120 challenges (80%)
] as const;

// XP rewards based on challenge difficulty
const XP_REWARDS = {
  easy: 50,
  medium: 100,
  hard: 200,
} as const;

const FIRST_CHALLENGE_BONUS = 50;

// Streak bonus thresholds
// Awarded when completing a challenge on a new consecutive day
const STREAK_BONUSES = [
  { minStreak: 3, bonus: 25, label: "3-day streak" },
  { minStreak: 7, bonus: 50, label: "1-week streak" },
  { minStreak: 14, bonus: 100, label: "2-week streak" },
  { minStreak: 30, bonus: 200, label: "1-month streak" },
  { minStreak: 60, bonus: 400, label: "2-month streak" },
  { minStreak: 90, bonus: 600, label: "3-month streak" },
] as const;

function calculateRank(xp: number): string {
  // Find the highest rank the user qualifies for
  for (let i = RANK_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= RANK_THRESHOLDS[i].minXp) {
      return RANK_THRESHOLDS[i].name;
    }
  }
  return "Novice";
}

function calculateStreakBonus(streak: number): {
  bonus: number;
  label: string;
} | null {
  // Find the highest streak bonus the user qualifies for
  for (let i = STREAK_BONUSES.length - 1; i >= 0; i--) {
    if (streak >= STREAK_BONUSES[i].minStreak) {
      return {
        bonus: STREAK_BONUSES[i].bonus,
        label: STREAK_BONUSES[i].label,
      };
    }
  }
  return null;
}

/**
 * Get the user's current streak (including today if completed today)
 * Uses transaction history as source of truth to preserve streak even after resets
 */
async function getCurrentStreak(
  database: typeof db,
  userId: string,
): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Query daily_streak transactions from the last 91 days
  // These transactions are the source of truth for streak-eligible days
  // This preserves streak history even when challenges are reset
  const streakResult = await database
    .select({
      createdAt: userXpTransaction.createdAt,
    })
    .from(userXpTransaction)
    .where(
      and(
        eq(userXpTransaction.userId, userId),
        eq(userXpTransaction.action, "daily_streak"),
        sql`${userXpTransaction.createdAt} >= ${ninetyDaysAgo}`,
      ),
    )
    .orderBy(sql`${userXpTransaction.createdAt} DESC`);

  let streak = 0;
  if (streakResult.length > 0) {
    let currentDate = new Date(today);
    const completedDates = new Set(
      streakResult.map((r) => {
        const date = new Date(r.createdAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      }),
    );

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if completed today or yesterday (streak is still active)
    if (
      completedDates.has(today.getTime()) ||
      completedDates.has(yesterday.getTime())
    ) {
      // Start counting from today if completed, otherwise yesterday
      if (!completedDates.has(today.getTime())) {
        currentDate = yesterday;
      }

      // Count consecutive days
      while (completedDates.has(currentDate.getTime())) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }
  }

  return streak;
}

/**
 * Safely insert XP transaction with retry logic and error monitoring
 *
 * Implements eventual consistency by retrying failed transaction logs
 * with exponential backoff. If all retries fail, throws an error to
 * abort the operation, allowing safe retry later via idempotency key.
 *
 * @param database - Database instance
 * @param transactionData - XP transaction data to insert
 * @param context - Additional context for error logging (operation, userId, challengeId, etc.)
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @throws {Error} If all retry attempts fail
 */
async function insertXpTransactionWithRetry(
  database: typeof db,
  transactionData: {
    userId: string;
    action: "challenge_completed" | "daily_streak" | "first_challenge";
    xpAmount: number;
    challengeId: number;
    description: string;
  },
  context: {
    operation: string;
    userId: string;
    challengeId: number;
    inconsistencyType: string;
    additionalData?: Record<string, unknown>;
  },
  maxRetries = 3,
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await database.insert(userXpTransaction).values(transactionData);
      // Success! Log if this was a retry
      if (attempt > 0) {
        logger.info("XP transaction log succeeded after retry", {
          attempt,
          ...context,
        });
      }
      return;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If not the last attempt, wait with exponential backoff
      if (attempt < maxRetries) {
        const delayMs = Math.min(1000 * 2 ** attempt, 5000); // Max 5s
        logger.warn("XP transaction log failed, retrying...", {
          attempt: attempt + 1,
          maxRetries,
          delayMs,
          error: lastError.message,
          ...context,
        });
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // All retries exhausted - log critical error, alert via Sentry, and throw
  logger.error("CRITICAL: XP transaction log failed after all retries", {
    attempts: maxRetries + 1,
    error: lastError?.message,
    ...context,
  });

  Sentry.captureException(lastError, {
    level: "error",
    tags: {
      operation: context.operation,
      inconsistency_type: context.inconsistencyType,
      retry_exhausted: "true",
    },
    contexts: {
      challenge: { id: context.challengeId },
      user: { id: context.userId },
      transaction: {
        action: transactionData.action,
        xpAmount: transactionData.xpAmount,
        description: transactionData.description,
      },
      ...(context.additionalData && { additional: context.additionalData }),
    },
  });

  // Throw error to abort the operation
  // The idempotency key will remain, allowing safe retry later
  throw lastError || new Error("Transaction log failed after all retries");
}

/**
 * Calculate current streak and check if this is the first challenge completed today
 * Returns null if a challenge was already completed today, otherwise returns streak info
 * Uses transaction history as source of truth to preserve streak even after resets
 */
async function calculateStreakForCompletion(
  database: typeof db,
  userId: string,
): Promise<{
  streak: number;
  streakBonus: { bonus: number; label: string } | null;
} | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate date 90 days ago (max possible streak bonus is 90 days)
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  // Query daily_streak transactions from the last 91 days
  // These transactions are the source of truth for streak-eligible days
  // This preserves streak history even when challenges are reset
  const streakResult = await database
    .select({
      createdAt: userXpTransaction.createdAt,
    })
    .from(userXpTransaction)
    .where(
      and(
        eq(userXpTransaction.userId, userId),
        eq(userXpTransaction.action, "daily_streak"),
        sql`${userXpTransaction.createdAt} >= ${ninetyDaysAgo}`,
      ),
    )
    .orderBy(desc(userXpTransaction.createdAt));

  // Check if user already received a streak bonus today
  const completedDates = new Set(
    streakResult.map((r) => {
      const date = new Date(r.createdAt);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    }),
  );

  if (completedDates.has(today.getTime())) {
    // Already received streak bonus today, no additional bonus
    return null;
  }

  // Calculate current streak (before today)
  let streak = 0;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const currentDate = new Date(yesterday);

  // Count consecutive days before today
  while (completedDates.has(currentDate.getTime())) {
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // The new streak will be current streak + 1 (including today)
  const newStreak = streak + 1;
  const streakBonus = calculateStreakBonus(newStreak);

  return {
    streak: newStreak,
    streakBonus,
  };
}

export const userProgressRouter = createTRPCRouter({
  // Get completion percentage
  getCompletionPercentage: privateProcedure
    .input(
      z
        .object({
          splitByTheme: z.boolean().default(false),
          themeSlug: z.string().optional(),
        })
        .optional()
        .default({ splitByTheme: false }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const splitByTheme = input.splitByTheme;

      // If splitByTheme is true, return progression by theme + global stats
      if (splitByTheme) {
        // Single optimized query: get total and completed counts by theme with theme name
        const byTheme = await ctx.db
          .select({
            themeSlug: challenge.theme,
            totalCount: count(challenge.id),
            completedCount: sql<number>`CAST(COUNT(CASE WHEN ${userProgress.userId} = ${userId} AND ${userProgress.status} = 'completed' THEN 1 END) AS INTEGER)`,
          })
          .from(challenge)
          .leftJoin(userProgress, eq(challenge.id, userProgress.challengeId))
          .groupBy(challenge.theme)
          .then((results) =>
            results.map((theme) => ({
              themeSlug: theme.themeSlug,
              completedCount: theme.completedCount,
              totalCount: theme.totalCount,
              percentageCompleted:
                theme.totalCount > 0
                  ? Math.round((theme.completedCount / theme.totalCount) * 100)
                  : 0,
            })),
          );

        // Calculate global stats from theme stats
        const totalCount = byTheme.reduce(
          (sum, theme) => sum + theme.totalCount,
          0,
        );
        const completedCount = byTheme.reduce(
          (sum, theme) => sum + theme.completedCount,
          0,
        );
        const percentageCompleted =
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return {
          byTheme,
          completedCount,
          totalCount,
          percentageCompleted,
        };
      }

      // Standard mode: single theme or all themes
      const themeSlug = input.themeSlug;
      // Build filter for theme if provided
      const themeFilter = themeSlug
        ? eq(challenge.theme, themeSlug)
        : undefined;

      // Get total challenges (optionally filtered by theme)
      const [totalResult] = await ctx.db
        .select({ count: count() })
        .from(challenge)
        .where(themeFilter);

      // Get completed challenges (optionally filtered by theme)
      const completedQuery = ctx.db
        .select({ count: count() })
        .from(userProgress)
        .innerJoin(challenge, eq(userProgress.challengeId, challenge.id))
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.status, "completed"),
            themeFilter,
          ),
        );

      const [completedResult] = await completedQuery;

      const totalCount = totalResult?.count ?? 0;
      const completedCount = completedResult?.count ?? 0;

      return {
        completedCount,
        totalCount,
        percentageCompleted:
          totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      };
    }),

  // Get user XP and rank
  getXpAndRank: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const [userXpResult] = await ctx.db
      .select({ totalXp: userXp.totalXp })
      .from(userXp)
      .where(eq(userXp.userId, userId));

    const xpEarned = userXpResult?.totalXp ?? 0;
    const rank = calculateRank(xpEarned);

    return {
      xpEarned,
      rank,
    };
  }),

  // Get user streak
  getStreak: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const streak = await getCurrentStreak(ctx.db, userId);
    return streak;
  }),

  // Complete a challenge and award XP
  completeChallenge: privateProcedure
    .input(
      z.object({
        challengeId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { challengeId } = input;

      return Sentry.startSpan(
        {
          op: "challenge.complete",
          name: "Complete Challenge",
        },
        async (span) => {
          span.setAttribute("userId", userId);
          span.setAttribute("challengeId", challengeId);

          // Check if challenge exists and get its difficulty
          const [challengeData] = await ctx.db
            .select({
              id: challenge.id,
              difficulty: challenge.difficulty,
            })
            .from(challenge)
            .where(eq(challenge.id, challengeId));

          if (!challengeData) {
            logger.warn("Challenge not found", { challengeId, userId });
            throw new Error("Challenge not found");
          }

          span.setAttribute("difficulty", challengeData.difficulty);

          // Check if user already completed this challenge
          const [existingProgress] = await ctx.db
            .select()
            .from(userProgress)
            .where(
              and(
                eq(userProgress.userId, userId),
                eq(userProgress.challengeId, challengeId),
              ),
            );

          if (existingProgress?.status === "completed") {
            logger.warn("Challenge already completed", {
              challengeId,
              userId,
              completedAt: existingProgress.completedAt,
            });
            throw new Error("Challenge already completed");
          }

          // Calculate XP based on difficulty
          const baseXp = XP_REWARDS[challengeData.difficulty];

          // Check if this is the user's first challenge by looking at transaction history
          // This prevents farming first-challenge bonus through reset cycles
          const [existingFirstChallengeBonus] = await ctx.db
            .select({ id: userXpTransaction.id })
            .from(userXpTransaction)
            .where(
              and(
                eq(userXpTransaction.userId, userId),
                eq(userXpTransaction.action, "first_challenge"),
              ),
            )
            .limit(1);

          const isFirstChallenge = !existingFirstChallengeBonus;
          const firstChallengeBonusXp = isFirstChallenge
            ? FIRST_CHALLENGE_BONUS
            : 0;

          // Calculate streak bonus (BEFORE marking challenge as completed)
          const streakInfo = await calculateStreakForCompletion(ctx.db, userId);
          const streakBonusXp = streakInfo?.streakBonus?.bonus ?? 0;

          const totalXp = baseXp + firstChallengeBonusXp + streakBonusXp;

          span.setAttribute("baseXp", baseXp);
          span.setAttribute("firstChallengeBonusXp", firstChallengeBonusXp);
          span.setAttribute("streakBonusXp", streakBonusXp);
          span.setAttribute("streak", streakInfo?.streak ?? 0);
          span.setAttribute("totalXp", totalXp);
          span.setAttribute("isFirstChallenge", isFirstChallenge);

          // Track if we hit the daily completion limit (for streak bonus)
          let hitDailyLimit = false;

          try {
            // Note: Neon serverless driver does not support transactions
            // Use idempotency table to prevent duplicate XP awards and allow safe retries

            // IDEMPOTENCY CHECK: Attempt to insert idempotency key
            // This will fail with unique constraint if already processed
            const idempotencyId = nanoid();
            try {
              await ctx.db.insert(challengeCompletionIdempotency).values({
                id: idempotencyId,
                userId,
                challengeId,
              });
              // Success - this is a new completion, proceed with XP award
            } catch (idempotencyError) {
              // Idempotency key already exists - challenge was already processed
              if (
                idempotencyError instanceof Error &&
                "code" in idempotencyError &&
                idempotencyError.code === "23505"
              ) {
                logger.info("Challenge already processed (idempotency check)", {
                  userId,
                  challengeId,
                });

                // Get current user XP for response
                const [_currentXp] = await ctx.db
                  .select({ totalXp: userXp.totalXp })
                  .from(userXp)
                  .where(eq(userXp.userId, userId));

                // Get all XP transactions for this challenge with action breakdown
                const transactions = await ctx.db
                  .select({
                    xpAmount: userXpTransaction.xpAmount,
                    action: userXpTransaction.action,
                  })
                  .from(userXpTransaction)
                  .where(
                    and(
                      eq(userXpTransaction.userId, userId),
                      eq(userXpTransaction.challengeId, challengeId),
                    ),
                  );

                // Calculate bonuses from actual transaction history
                const firstChallengeBonusXp =
                  transactions.find((t) => t.action === "first_challenge")
                    ?.xpAmount ?? 0;
                const streakBonusXp =
                  transactions.find((t) => t.action === "daily_streak")
                    ?.xpAmount ?? 0;
                const totalXpAwarded = transactions.reduce(
                  (sum, t) => sum + t.xpAmount,
                  0,
                );

                // Get streak information for accurate response
                const currentStreak = await getCurrentStreak(ctx.db, userId);

                return {
                  success: true,
                  xpAwarded: totalXpAwarded,
                  baseXp,
                  firstChallengeBonusXp,
                  streakBonusXp,
                  streak: currentStreak,
                  isFirstChallenge: firstChallengeBonusXp > 0,
                  cached: true, // Indicate this is a cached response
                };
              }
              // Re-throw if not an idempotency error
              throw idempotencyError;
            }

            // Update or create user progress FIRST
            // Wrap in try-catch to handle unique constraint violations
            // (one completion per user per day constraint for streak tracking)
            try {
              if (existingProgress) {
                await ctx.db
                  .update(userProgress)
                  .set({
                    status: "completed",
                    completedAt: new Date(),
                    updatedAt: new Date(),
                  })
                  .where(eq(userProgress.id, existingProgress.id));
              } else {
                await ctx.db.insert(userProgress).values({
                  id: nanoid(),
                  userId,
                  challengeId,
                  status: "completed",
                  completedAt: new Date(),
                });
              }
            } catch (dbError) {
              // Check if this is a unique constraint violation (PostgreSQL error code 23505)
              // This means the user already completed another challenge today
              if (
                dbError instanceof Error &&
                "code" in dbError &&
                dbError.code === "23505"
              ) {
                logger.info(
                  "Unique constraint violation - already completed a challenge today, no streak bonus",
                  {
                    userId,
                    challengeId,
                    constraintError: dbError.message,
                  },
                );

                hitDailyLimit = true;
                // Fall through to still award base XP and mark challenge
                // Set dailyLimitReached=true to preserve completedAt timestamp
                // This allows date-based queries to work while excluding from streak bonuses
                if (existingProgress) {
                  await ctx.db
                    .update(userProgress)
                    .set({
                      status: "completed",
                      completedAt: new Date(),
                      dailyLimitReached: true,
                      updatedAt: new Date(),
                    })
                    .where(eq(userProgress.id, existingProgress.id));
                } else {
                  await ctx.db.insert(userProgress).values({
                    id: nanoid(),
                    userId,
                    challengeId,
                    status: "completed",
                    completedAt: new Date(),
                    dailyLimitReached: true,
                  });
                }
              } else {
                // Re-throw if it's not a unique constraint violation
                throw dbError;
              }
            }

            // Adjust XP if we hit the daily limit (no streak bonus)
            const actualStreakBonusXp = hitDailyLimit ? 0 : streakBonusXp;
            const actualTotalXp =
              baseXp + firstChallengeBonusXp + actualStreakBonusXp;

            // Check if user has XP record
            const [existingXp] = await ctx.db
              .select()
              .from(userXp)
              .where(eq(userXp.userId, userId));

            const oldXp = existingXp?.totalXp ?? 0;
            const newXp = oldXp + actualTotalXp;
            const oldRank = calculateRank(oldXp);
            const newRank = calculateRank(newXp);

            // Update user's total XP SECOND (critical operation)
            if (existingXp) {
              // Update existing XP
              await ctx.db
                .update(userXp)
                .set({
                  totalXp: newXp,
                  updatedAt: new Date(),
                })
                .where(eq(userXp.userId, userId));
            } else {
              // Create new XP record
              await ctx.db.insert(userXp).values({
                userId,
                totalXp: actualTotalXp,
              });
            }

            // Record base XP transaction (for history/audit trail)
            // Uses retry logic with exponential backoff for resilience
            await insertXpTransactionWithRetry(
              ctx.db,
              {
                userId,
                action: "challenge_completed",
                xpAmount: baseXp,
                challengeId,
                description: `Completed ${challengeData.difficulty} challenge`,
              },
              {
                operation: "challenge.complete",
                userId,
                challengeId,
                inconsistencyType: "xp_transaction_log_failed",
                additionalData: {
                  difficulty: challengeData.difficulty,
                  awarded: actualTotalXp,
                  newTotal: newXp,
                },
              },
            );

            // Record first challenge bonus XP transaction if applicable
            if (isFirstChallenge) {
              await insertXpTransactionWithRetry(
                ctx.db,
                {
                  userId,
                  action: "first_challenge",
                  xpAmount: firstChallengeBonusXp,
                  challengeId,
                  description: "First challenge bonus",
                },
                {
                  operation: "challenge.complete",
                  userId,
                  challengeId,
                  inconsistencyType: "first_challenge_transaction_log_failed",
                  additionalData: { bonusAmount: firstChallengeBonusXp },
                },
              );

              logger.info("First challenge completed", {
                userId,
                challengeId,
                totalXp,
                baseXp,
                firstChallengeBonusXp,
              });
            }

            // Record streak bonus XP transaction if applicable and not hit daily limit
            if (streakInfo?.streakBonus && !hitDailyLimit) {
              await insertXpTransactionWithRetry(
                ctx.db,
                {
                  userId,
                  action: "daily_streak",
                  xpAmount: streakBonusXp,
                  challengeId,
                  description: streakInfo.streakBonus.label,
                },
                {
                  operation: "challenge.complete",
                  userId,
                  challengeId,
                  inconsistencyType: "streak_transaction_log_failed",
                  additionalData: {
                    bonusAmount: streakBonusXp,
                    streak: streakInfo.streak,
                  },
                },
              );

              logger.info("Streak bonus awarded", {
                userId,
                challengeId,
                streak: streakInfo.streak,
                streakBonusXp,
                streakLabel: streakInfo.streakBonus.label,
              });
            }

            // Log if we hit the daily limit
            if (hitDailyLimit) {
              logger.info("Daily completion limit reached - no streak bonus", {
                userId,
                challengeId,
              });
            }

            // Log rank upgrade if applicable
            if (oldRank !== newRank) {
              logger.info("User rank upgraded", {
                userId,
                oldRank,
                newRank,
                oldXp,
                newXp,
                challengeId,
              });
            }

            logger.info("Challenge completed successfully", {
              userId,
              challengeId,
              difficulty: challengeData.difficulty,
              xpAwarded: actualTotalXp,
              isFirstChallenge,
              streak: hitDailyLimit ? 0 : (streakInfo?.streak ?? 0),
              streakBonusXp: actualStreakBonusXp,
              hitDailyLimit,
            });

            return {
              success: true,
              xpAwarded: actualTotalXp,
              baseXp,
              firstChallengeBonusXp,
              streakBonusXp: actualStreakBonusXp,
              streak: hitDailyLimit ? 0 : (streakInfo?.streak ?? 0),
              isFirstChallenge,
            };
          } catch (error) {
            logger.error("Failed to complete challenge", {
              userId,
              challengeId,
              error: error instanceof Error ? error.message : String(error),
            });
            Sentry.captureException(error, {
              tags: { operation: "challenge.complete" },
              contexts: {
                challenge: {
                  id: challengeId,
                  difficulty: challengeData.difficulty,
                },
                user: {
                  id: userId,
                },
              },
            });
            throw error;
          }
        },
      );
    }),

  // Get challenge status for CLI
  getStatus: privateProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { slug } = input;

      // Find challenge by slug
      const [challengeData] = await ctx.db
        .select({ id: challenge.id })
        .from(challenge)
        .where(eq(challenge.slug, slug))
        .limit(1);

      if (!challengeData) {
        throw new Error("Challenge not found");
      }

      // Find user progress
      const [progress] = await ctx.db
        .select({
          status: userProgress.status,
          startedAt: userProgress.startedAt,
          completedAt: userProgress.completedAt,
        })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.challengeId, challengeData.id),
          ),
        )
        .limit(1);

      if (!progress) {
        return {
          status: "not_started" as const,
        };
      }

      return {
        status: progress.status,
        startedAt: progress.startedAt,
        completedAt: progress.completedAt,
      };
    }),

  // Start challenge for CLI
  startChallenge: privateProcedure
    .input(
      z.object({
        challengeSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { challengeSlug } = input;

      // Find challenge by slug
      const [challengeData] = await ctx.db
        .select({ id: challenge.id, title: challenge.title })
        .from(challenge)
        .where(eq(challenge.slug, challengeSlug))
        .limit(1);

      if (!challengeData) {
        throw new Error("Challenge not found");
      }

      // Check if user progress already exists
      const [existingProgress] = await ctx.db
        .select({
          id: userProgress.id,
          status: userProgress.status,
          startedAt: userProgress.startedAt,
        })
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.challengeId, challengeData.id),
          ),
        )
        .limit(1);

      const now = new Date();

      if (existingProgress) {
        // Already completed
        if (existingProgress.status === "completed") {
          logger.info("Challenge already completed", {
            userId,
            challengeId: challengeData.id,
          });
          return {
            status: existingProgress.status,
            startedAt: existingProgress.startedAt,
            message: "Challenge already completed",
          };
        }

        // Update to in_progress if not_started
        if (existingProgress.status === "not_started") {
          await ctx.db
            .update(userProgress)
            .set({
              status: "in_progress",
              startedAt: now,
            })
            .where(eq(userProgress.id, existingProgress.id));

          logger.info("Challenge status updated to in_progress", {
            userId,
            challengeId: challengeData.id,
            challengeTitle: challengeData.title,
          });

          // Track challenge started event in PostHog
          await trackChallengeStartedServer(
            userId,
            challengeData.id,
            challengeSlug,
            challengeData.title,
          );
        }

        return {
          status: "in_progress" as const,
          startedAt: existingProgress.startedAt,
        };
      }

      // Create new progress record
      await ctx.db.insert(userProgress).values({
        id: nanoid(),
        userId,
        challengeId: challengeData.id,
        status: "in_progress",
        startedAt: now,
      });

      logger.info("Challenge started", {
        userId,
        challengeId: challengeData.id,
        challengeTitle: challengeData.title,
      });

      // Track challenge started event in PostHog
      await trackChallengeStartedServer(
        userId,
        challengeData.id,
        challengeSlug,
        challengeData.title,
      );

      return {
        status: "in_progress" as const,
        startedAt: now,
      };
    }),

  // Submit challenge with validation result from CLI
  submitChallenge: privateProcedure
    .input(
      z.object({
        challengeSlug: z.string(),
        validated: z.boolean(),
        staticValidation: z.boolean().optional(),
        dynamicValidation: z.boolean().optional(),
        payload: z.any().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const {
        challengeSlug,
        validated,
        staticValidation,
        dynamicValidation,
        payload,
      } = input;

      return Sentry.startSpan(
        {
          op: "challenge.submit",
          name: "Submit Challenge",
        },
        async (span) => {
          span.setAttribute("userId", userId);
          span.setAttribute("challengeSlug", challengeSlug);
          span.setAttribute("validated", validated);

          // Find challenge by slug
          const [challengeData] = await ctx.db
            .select({
              id: challenge.id,
              title: challenge.title,
              difficulty: challenge.difficulty,
            })
            .from(challenge)
            .where(eq(challenge.slug, challengeSlug))
            .limit(1);

          if (!challengeData) {
            logger.warn("Challenge not found", { challengeSlug, userId });
            throw new Error("Challenge not found");
          }

          span.setAttribute("challengeId", challengeData.id);

          // Check if already completed
          const [existingProgress] = await ctx.db
            .select({
              id: userProgress.id,
              status: userProgress.status,
              completedAt: userProgress.completedAt,
            })
            .from(userProgress)
            .where(
              and(
                eq(userProgress.userId, userId),
                eq(userProgress.challengeId, challengeData.id),
              ),
            )
            .limit(1);

          if (existingProgress?.status === "completed") {
            logger.warn("Challenge already completed", {
              userId,
              challengeId: challengeData.id,
              completedAt: existingProgress.completedAt,
            });
            throw new Error("Challenge already completed");
          }

          // Verify payload integrity when validation is claimed as successful
          if (validated) {
            // Require payload to be present
            if (!payload) {
              logger.warn("Validation claimed but no payload provided", {
                userId,
                challengeId: challengeData.id,
              });
              throw new Error("Payload required for successful validation");
            }

            // Verify staticValidation matches payload
            if (staticValidation && payload.staticValidations) {
              const hasStaticChecks = Object.keys(
                payload.staticValidations,
              ).some(
                (key) =>
                  Array.isArray(payload.staticValidations[key]) &&
                  payload.staticValidations[key].length > 0,
              );
              if (!hasStaticChecks) {
                logger.warn(
                  "Static validation claimed but no static checks in payload",
                  { userId, challengeId: challengeData.id },
                );
                throw new Error("Invalid static validation payload");
              }
            }

            // Verify dynamicValidation matches payload
            if (dynamicValidation && payload.dynamicValidations) {
              const hasDynamicChecks = Object.keys(
                payload.dynamicValidations,
              ).some(
                (key) =>
                  Array.isArray(payload.dynamicValidations[key]) &&
                  payload.dynamicValidations[key].length > 0,
              );
              if (!hasDynamicChecks) {
                logger.warn(
                  "Dynamic validation claimed but no dynamic checks in payload",
                  { userId, challengeId: challengeData.id },
                );
                throw new Error("Invalid dynamic validation payload");
              }
            }

            // Verify both validations are successful when validated=true
            // For challenges without dynamic validations, only static validation is required
            const hasDynamicValidations =
              payload.dynamicValidations &&
              Object.keys(payload.dynamicValidations).length > 0;

            if (
              !staticValidation ||
              (hasDynamicValidations && !dynamicValidation)
            ) {
              logger.warn(
                "Validation claimed as successful but required validations are false",
                {
                  userId,
                  challengeId: challengeData.id,
                  staticValidation,
                  dynamicValidation,
                  hasDynamicValidations,
                },
              );
              throw new Error(
                hasDynamicValidations
                  ? "Both static and dynamic validation must pass for successful submission"
                  : "Static validation must pass for successful submission",
              );
            }
          }

          // Always store the submission (even if validation failed)
          if (
            staticValidation !== undefined ||
            dynamicValidation !== undefined ||
            payload !== undefined
          ) {
            await ctx.db.insert(userSubmission).values({
              id: nanoid(),
              userId,
              challengeId: challengeData.id,
              staticValidation: staticValidation ?? false,
              dynamicValidation: dynamicValidation ?? false,
              payload: payload ?? {},
            });
          }

          // If validation failed, return error (but submission is already saved)
          if (!validated) {
            logger.info("Challenge validation failed", {
              userId,
              challengeId: challengeData.id,
              staticValidation,
              dynamicValidation,
            });

            // Track validation failure in PostHog
            await trackChallengeValidationFailedServer(
              userId,
              challengeData.id,
              challengeSlug,
              staticValidation ?? false,
              dynamicValidation ?? false,
            );

            return {
              success: false,
              message: "Validation failed",
            };
          }

          // Validation passed - use existing completeChallenge logic
          // Calculate XP based on difficulty
          const baseXp = XP_REWARDS[challengeData.difficulty];

          // Check if this is the user's first challenge by looking at transaction history
          // This prevents farming first-challenge bonus through reset cycles
          const [existingFirstChallengeBonus] = await ctx.db
            .select({ id: userXpTransaction.id })
            .from(userXpTransaction)
            .where(
              and(
                eq(userXpTransaction.userId, userId),
                eq(userXpTransaction.action, "first_challenge"),
              ),
            )
            .limit(1);

          const isFirstChallenge = !existingFirstChallengeBonus;
          const firstChallengeBonusXp = isFirstChallenge
            ? FIRST_CHALLENGE_BONUS
            : 0;

          // Calculate streak bonus (BEFORE marking challenge as completed)
          const streakInfo = await calculateStreakForCompletion(ctx.db, userId);
          const streakBonusXp = streakInfo?.streakBonus?.bonus ?? 0;

          const totalXp = baseXp + firstChallengeBonusXp + streakBonusXp;

          span.setAttribute("baseXp", baseXp);
          span.setAttribute("firstChallengeBonusXp", firstChallengeBonusXp);
          span.setAttribute("streakBonusXp", streakBonusXp);
          span.setAttribute("streak", streakInfo?.streak ?? 0);
          span.setAttribute("totalXp", totalXp);
          span.setAttribute("isFirstChallenge", isFirstChallenge);

          // Track if we hit the daily completion limit (for streak bonus)
          let hitDailyLimit = false;

          try {
            // IDEMPOTENCY CHECK: Attempt to insert idempotency key
            // This will fail with unique constraint if already processed
            const idempotencyId = nanoid();
            try {
              await ctx.db.insert(challengeCompletionIdempotency).values({
                id: idempotencyId,
                userId,
                challengeId: challengeData.id,
              });
              // Success - this is a new completion, proceed with XP award
            } catch (idempotencyError) {
              // Idempotency key already exists - challenge was already processed
              if (
                idempotencyError instanceof Error &&
                "code" in idempotencyError &&
                idempotencyError.code === "23505"
              ) {
                logger.info(
                  "Challenge already processed (idempotency check) in submitChallenge",
                  {
                    userId,
                    challengeId: challengeData.id,
                  },
                );

                // Get current user XP for response
                const [currentXp] = await ctx.db
                  .select({ totalXp: userXp.totalXp })
                  .from(userXp)
                  .where(eq(userXp.userId, userId));

                // Get all XP transactions for this challenge with action breakdown
                const transactions = await ctx.db
                  .select({
                    xpAmount: userXpTransaction.xpAmount,
                    action: userXpTransaction.action,
                  })
                  .from(userXpTransaction)
                  .where(
                    and(
                      eq(userXpTransaction.userId, userId),
                      eq(userXpTransaction.challengeId, challengeData.id),
                    ),
                  );

                // Calculate bonuses from actual transaction history
                const cachedFirstChallengeBonusXp =
                  transactions.find((t) => t.action === "first_challenge")
                    ?.xpAmount ?? 0;
                const cachedStreakBonusXp =
                  transactions.find((t) => t.action === "daily_streak")
                    ?.xpAmount ?? 0;
                const totalXpAwarded = transactions.reduce(
                  (sum, t) => sum + t.xpAmount,
                  0,
                );

                // Get streak information for accurate response
                const currentStreak = await getCurrentStreak(ctx.db, userId);

                const rank = calculateRank(currentXp?.totalXp ?? 0);

                return {
                  success: true,
                  xpAwarded: totalXpAwarded,
                  totalXp: currentXp?.totalXp ?? 0,
                  rank,
                  rankUp: false,
                  firstChallenge: cachedFirstChallengeBonusXp > 0,
                  streak: currentStreak,
                  streakBonusXp: cachedStreakBonusXp,
                  cached: true, // Indicate this is a cached response
                };
              }
              // Re-throw if not an idempotency error
              throw idempotencyError;
            }

            // Update or create user progress
            // Wrap in try-catch to handle unique constraint violations
            // (one completion per user per day constraint for streak tracking)
            try {
              if (existingProgress) {
                await ctx.db
                  .update(userProgress)
                  .set({
                    status: "completed",
                    completedAt: new Date(),
                    updatedAt: new Date(),
                  })
                  .where(eq(userProgress.id, existingProgress.id));
              } else {
                await ctx.db.insert(userProgress).values({
                  id: nanoid(),
                  userId,
                  challengeId: challengeData.id,
                  status: "completed",
                  completedAt: new Date(),
                });
              }
            } catch (dbError) {
              // Check if this is a unique constraint violation (PostgreSQL error code 23505)
              // This means the user already completed another challenge today
              if (
                dbError instanceof Error &&
                "code" in dbError &&
                dbError.code === "23505"
              ) {
                logger.info(
                  "Unique constraint violation - already completed a challenge today, no streak bonus",
                  {
                    userId,
                    challengeId: challengeData.id,
                    constraintError: dbError.message,
                  },
                );

                hitDailyLimit = true;
                // Fall through to still award base XP and mark challenge
                // Set dailyLimitReached=true to preserve completedAt timestamp
                // This allows date-based queries to work while excluding from streak bonuses
                if (existingProgress) {
                  await ctx.db
                    .update(userProgress)
                    .set({
                      status: "completed",
                      completedAt: new Date(),
                      dailyLimitReached: true,
                      updatedAt: new Date(),
                    })
                    .where(eq(userProgress.id, existingProgress.id));
                } else {
                  await ctx.db.insert(userProgress).values({
                    id: nanoid(),
                    userId,
                    challengeId: challengeData.id,
                    status: "completed",
                    completedAt: new Date(),
                    dailyLimitReached: true,
                  });
                }
              } else {
                // Re-throw if it's not a unique constraint violation
                throw dbError;
              }
            }

            // Submission details were already stored before validation check

            // Adjust XP if we hit the daily limit (no streak bonus)
            const actualStreakBonusXp = hitDailyLimit ? 0 : streakBonusXp;
            const actualTotalXp =
              baseXp + firstChallengeBonusXp + actualStreakBonusXp;

            // Check if user has XP record
            const [existingXp] = await ctx.db
              .select()
              .from(userXp)
              .where(eq(userXp.userId, userId));

            const oldXp = existingXp?.totalXp ?? 0;
            const newXp = oldXp + actualTotalXp;
            const oldRank = calculateRank(oldXp);
            const newRank = calculateRank(newXp);

            if (existingXp) {
              // Update existing XP
              await ctx.db
                .update(userXp)
                .set({
                  totalXp: newXp,
                  updatedAt: new Date(),
                })
                .where(eq(userXp.userId, userId));
            } else {
              // Create new XP record
              await ctx.db.insert(userXp).values({
                userId,
                totalXp: actualTotalXp,
              });
            }

            // Record base XP transaction
            // Uses retry logic with exponential backoff for resilience
            await insertXpTransactionWithRetry(
              ctx.db,
              {
                userId,
                action: "challenge_completed",
                xpAmount: baseXp,
                challengeId: challengeData.id,
                description: `Completed ${challengeData.difficulty} challenge`,
              },
              {
                operation: "challenge.submit",
                userId,
                challengeId: challengeData.id,
                inconsistencyType: "xp_transaction_log_failed",
                additionalData: {
                  difficulty: challengeData.difficulty,
                  awarded: actualTotalXp,
                  newTotal: newXp,
                },
              },
            );

            // Record first challenge bonus XP transaction if applicable
            if (isFirstChallenge) {
              await insertXpTransactionWithRetry(
                ctx.db,
                {
                  userId,
                  action: "first_challenge",
                  xpAmount: firstChallengeBonusXp,
                  challengeId: challengeData.id,
                  description: "First challenge bonus",
                },
                {
                  operation: "challenge.submit",
                  userId,
                  challengeId: challengeData.id,
                  inconsistencyType: "first_challenge_transaction_log_failed",
                  additionalData: { bonusAmount: firstChallengeBonusXp },
                },
              );

              logger.info("First challenge completed", {
                userId,
                challengeId: challengeData.id,
                totalXp,
                baseXp,
                firstChallengeBonusXp,
              });
            }

            // Record streak bonus XP transaction if applicable and not hit daily limit
            if (streakInfo?.streakBonus && !hitDailyLimit) {
              await insertXpTransactionWithRetry(
                ctx.db,
                {
                  userId,
                  action: "daily_streak",
                  xpAmount: actualStreakBonusXp,
                  challengeId: challengeData.id,
                  description: streakInfo.streakBonus.label,
                },
                {
                  operation: "challenge.submit",
                  userId,
                  challengeId: challengeData.id,
                  inconsistencyType: "streak_transaction_log_failed",
                  additionalData: {
                    bonusAmount: actualStreakBonusXp,
                    streak: streakInfo.streak,
                  },
                },
              );

              logger.info("Streak bonus awarded", {
                userId,
                challengeId: challengeData.id,
                streak: streakInfo.streak,
                streakBonusXp: actualStreakBonusXp,
                streakLabel: streakInfo.streakBonus.label,
              });
            }

            // Log if we hit the daily limit
            if (hitDailyLimit) {
              logger.info("Daily completion limit reached - no streak bonus", {
                userId,
                challengeId: challengeData.id,
              });
            }

            // Log rank upgrade
            if (oldRank !== newRank) {
              logger.info("User rank upgraded", {
                userId,
                oldRank,
                newRank,
                oldXp,
                newXp,
                challengeId: challengeData.id,
              });
            }

            logger.info("Challenge completed successfully", {
              userId,
              challengeId: challengeData.id,
              difficulty: challengeData.difficulty,
              xpAwarded: actualTotalXp,
              isFirstChallenge,
              streak: hitDailyLimit ? 0 : (streakInfo?.streak ?? 0),
              streakBonusXp: actualStreakBonusXp,
              hitDailyLimit,
            });

            // Track challenge completed event in PostHog
            await trackChallengeCompletedServer(
              userId,
              challengeData.id,
              challengeSlug,
              challengeData.difficulty,
              actualTotalXp,
              isFirstChallenge,
            );

            return {
              success: true,
              xpAwarded: actualTotalXp,
              totalXp: newXp,
              rank: newRank,
              rankUp: oldRank !== newRank,
              firstChallenge: isFirstChallenge,
              streak: hitDailyLimit ? 0 : (streakInfo?.streak ?? 0),
              streakBonusXp: actualStreakBonusXp,
            };
          } catch (error) {
            logger.error("Failed to complete challenge", {
              userId,
              challengeId: challengeData.id,
              error: error instanceof Error ? error.message : String(error),
            });
            Sentry.captureException(error, {
              tags: { operation: "challenge.submit" },
              contexts: {
                challenge: {
                  id: challengeData.id,
                  difficulty: challengeData.difficulty,
                },
                user: {
                  id: userId,
                },
              },
            });
            throw error;
          }
        },
      );
    }),

  // Reset challenge progress for CLI
  resetChallenge: privateProcedure
    .input(
      z.object({
        challengeSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { challengeSlug } = input;

      return Sentry.startSpan(
        {
          op: "challenge.reset",
          name: "Reset Challenge Progress",
        },
        async (span) => {
          span.setAttribute("userId", userId);
          span.setAttribute("challengeSlug", challengeSlug);

          // Find challenge by slug
          const [challengeData] = await ctx.db
            .select({
              id: challenge.id,
              title: challenge.title,
            })
            .from(challenge)
            .where(eq(challenge.slug, challengeSlug))
            .limit(1);

          if (!challengeData) {
            logger.warn("Challenge not found", { challengeSlug, userId });
            throw new Error("Challenge not found");
          }

          span.setAttribute("challengeId", challengeData.id);

          try {
            // RESET PHILOSOPHY:
            // Reset allows retrying a challenge for learning purposes
            // All XP (base + bonuses) and transaction history are PRESERVED
            // Idempotency key prevents re-earning XP on subsequent completions
            // Only userProgress is deleted to allow UI/state to show as "not completed"

            // Delete user progress (allows retrying in UI)
            await ctx.db
              .delete(userProgress)
              .where(
                and(
                  eq(userProgress.userId, userId),
                  eq(userProgress.challengeId, challengeData.id),
                ),
              );

            // DO NOT delete XP transactions - they are historical facts
            // DO NOT delete idempotency key - prevents re-earning XP
            // User can retry the challenge but won't gain XP again

            logger.info(
              "Challenge progress reset (all XP and history preserved)",
              {
                userId,
                challengeId: challengeData.id,
                challengeTitle: challengeData.title,
                note: "User can retry but will not re-earn XP",
              },
            );

            return {
              success: true,
              message: "Challenge progress reset successfully",
            };
          } catch (error) {
            logger.error("Failed to reset challenge progress", {
              userId,
              challengeId: challengeData.id,
              error: error instanceof Error ? error.message : String(error),
            });
            Sentry.captureException(error, {
              tags: { operation: "challenge.reset" },
              contexts: {
                challenge: {
                  id: challengeData.id,
                },
                user: {
                  id: userId,
                },
              },
            });
            throw error;
          }
        },
      );
    }),

  /**
   * Get all submissions for a challenge by the current user
   */
  getSubmissions: privateProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Get challenge ID from slug
      const [challengeData] = await ctx.db
        .select({ id: challenge.id })
        .from(challenge)
        .where(eq(challenge.slug, input.slug))
        .limit(1);

      if (!challengeData) {
        throw new Error("Challenge not found");
      }

      // Get all submissions for this challenge by this user, ordered by most recent first
      const submissions = await ctx.db
        .select()
        .from(userSubmission)
        .where(
          and(
            eq(userSubmission.userId, ctx.user.id),
            eq(userSubmission.challengeId, challengeData.id),
          ),
        )
        .orderBy(desc(userSubmission.timestamp));

      return {
        submissions,
      };
    }),
});

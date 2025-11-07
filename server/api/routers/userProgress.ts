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
 * Calculate current streak and check if this is the first challenge completed today
 * Returns null if a challenge was already completed today, otherwise returns streak info
 */
async function calculateStreakForCompletion(
  database: typeof db,
  userId: string,
): Promise<{
  streak: number;
  streakBonus: { bonus: number; label: string } | null;
} | null> {
  const streakResult = await database
    .select({
      completedAt: userProgress.completedAt,
    })
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        eq(userProgress.status, "completed"),
        sql`${userProgress.completedAt} IS NOT NULL`,
      ),
    )
    .orderBy(sql`${userProgress.completedAt} DESC`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if user already completed a challenge today
  const completedDates = new Set(
    streakResult
      .map((r) => {
        if (!r.completedAt) return null;
        const date = new Date(r.completedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .filter((d): d is number => d !== null),
  );

  if (completedDates.has(today.getTime())) {
    // Already completed a challenge today, no streak bonus
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

    const streakResult = await ctx.db
      .select({
        completedAt: userProgress.completedAt,
      })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.status, "completed"),
          sql`${userProgress.completedAt} IS NOT NULL`,
        ),
      )
      .orderBy(sql`${userProgress.completedAt} DESC`);

    let streak = 0;
    if (streakResult.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentDate = new Date(today);
      const completedDates = new Set(
        streakResult
          .map((r) => {
            if (!r.completedAt) return null;
            const date = new Date(r.completedAt);
            date.setHours(0, 0, 0, 0);
            return date.getTime();
          })
          .filter((d): d is number => d !== null),
      );

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        completedDates.has(today.getTime()) ||
        completedDates.has(yesterday.getTime())
      ) {
        if (!completedDates.has(today.getTime())) {
          currentDate = yesterday;
        }

        while (completedDates.has(currentDate.getTime())) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }
      }
    }

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

          // Check if this is the user's first challenge
          const [completedCount] = await ctx.db
            .select({ count: count() })
            .from(userProgress)
            .where(
              and(
                eq(userProgress.userId, userId),
                eq(userProgress.status, "completed"),
              ),
            );

          const isFirstChallenge = (completedCount?.count ?? 0) === 0;
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

          try {
            // Note: Neon serverless driver does not support transactions
            // We execute operations in optimal order to minimize inconsistency risk

            // Update or create user progress FIRST
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

            // Check if user has XP record
            const [existingXp] = await ctx.db
              .select()
              .from(userXp)
              .where(eq(userXp.userId, userId));

            const oldXp = existingXp?.totalXp ?? 0;
            const newXp = oldXp + totalXp;
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
                totalXp,
              });
            }

            // Record base XP transaction (for history/audit trail)
            await ctx.db.insert(userXpTransaction).values({
              userId,
              action: "challenge_completed",
              xpAmount: baseXp,
              challengeId,
              description: `Completed ${challengeData.difficulty} challenge`,
            });

            // Record first challenge bonus XP transaction if applicable
            if (isFirstChallenge) {
              await ctx.db.insert(userXpTransaction).values({
                userId,
                action: "first_challenge",
                xpAmount: firstChallengeBonusXp,
                challengeId,
                description: "First challenge bonus",
              });

              logger.info("First challenge completed", {
                userId,
                challengeId,
                totalXp,
                baseXp,
                firstChallengeBonusXp,
              });
            }

            // Record streak bonus XP transaction if applicable
            if (streakInfo?.streakBonus) {
              await ctx.db.insert(userXpTransaction).values({
                userId,
                action: "daily_streak",
                xpAmount: streakBonusXp,
                challengeId,
                description: streakInfo.streakBonus.label,
              });

              logger.info("Streak bonus awarded", {
                userId,
                challengeId,
                streak: streakInfo.streak,
                streakBonusXp,
                streakLabel: streakInfo.streakBonus.label,
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
              xpAwarded: totalXp,
              isFirstChallenge,
              streak: streakInfo?.streak ?? 0,
              streakBonusXp,
            });

            return {
              success: true,
              xpAwarded: totalXp,
              baseXp,
              firstChallengeBonusXp,
              streakBonusXp,
              streak: streakInfo?.streak ?? 0,
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

          // Check if this is the user's first challenge
          const [completedCount] = await ctx.db
            .select({ count: count() })
            .from(userProgress)
            .where(
              and(
                eq(userProgress.userId, userId),
                eq(userProgress.status, "completed"),
              ),
            );

          const isFirstChallenge = (completedCount?.count ?? 0) === 0;
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

          try {
            // Update or create user progress
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

            // Submission details were already stored before validation check

            // Check if user has XP record
            const [existingXp] = await ctx.db
              .select()
              .from(userXp)
              .where(eq(userXp.userId, userId));

            const oldXp = existingXp?.totalXp ?? 0;
            const newXp = oldXp + totalXp;
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
                totalXp,
              });
            }

            // Record base XP transaction
            await ctx.db.insert(userXpTransaction).values({
              userId,
              action: "challenge_completed",
              xpAmount: baseXp,
              challengeId: challengeData.id,
              description: `Completed ${challengeData.difficulty} challenge`,
            });

            // Record first challenge bonus XP transaction if applicable
            if (isFirstChallenge) {
              await ctx.db.insert(userXpTransaction).values({
                userId,
                action: "first_challenge",
                xpAmount: firstChallengeBonusXp,
                challengeId: challengeData.id,
                description: "First challenge bonus",
              });

              logger.info("First challenge completed", {
                userId,
                challengeId: challengeData.id,
                totalXp,
                baseXp,
                firstChallengeBonusXp,
              });
            }

            // Record streak bonus XP transaction if applicable
            if (streakInfo?.streakBonus) {
              await ctx.db.insert(userXpTransaction).values({
                userId,
                action: "daily_streak",
                xpAmount: streakBonusXp,
                challengeId: challengeData.id,
                description: streakInfo.streakBonus.label,
              });

              logger.info("Streak bonus awarded", {
                userId,
                challengeId: challengeData.id,
                streak: streakInfo.streak,
                streakBonusXp,
                streakLabel: streakInfo.streakBonus.label,
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
              xpAwarded: totalXp,
              isFirstChallenge,
              streak: streakInfo?.streak ?? 0,
              streakBonusXp,
            });

            // Track challenge completed event in PostHog
            await trackChallengeCompletedServer(
              userId,
              challengeData.id,
              challengeSlug,
              challengeData.difficulty,
              totalXp,
              isFirstChallenge,
            );

            return {
              success: true,
              xpAwarded: totalXp,
              totalXp: newXp,
              rank: newRank,
              rankUp: oldRank !== newRank,
              firstChallenge: isFirstChallenge,
              streak: streakInfo?.streak ?? 0,
              streakBonusXp,
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
            // Get all XP transactions for this challenge
            const xpTransactions = await ctx.db
              .select({
                id: userXpTransaction.id,
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

            // Calculate total XP to remove
            const totalXpToRemove = xpTransactions.reduce(
              (sum, transaction) => sum + transaction.xpAmount,
              0,
            );

            span.setAttribute("xpToRemove", totalXpToRemove);
            span.setAttribute("transactionsCount", xpTransactions.length);

            // Note: Neon serverless driver does not support transactions
            // We execute operations in optimal order to minimize inconsistency risk
            if (xpTransactions.length > 0) {
              // Get current XP
              const [currentXp] = await ctx.db
                .select({ totalXp: userXp.totalXp })
                .from(userXp)
                .where(eq(userXp.userId, userId));

              if (currentXp) {
                const newTotalXp = Math.max(
                  0,
                  currentXp.totalXp - totalXpToRemove,
                );

                // Update user's total XP FIRST (most critical operation)
                await ctx.db
                  .update(userXp)
                  .set({
                    totalXp: newTotalXp,
                    updatedAt: new Date(),
                  })
                  .where(eq(userXp.userId, userId));
              }

              // Delete XP transactions related to this challenge
              await ctx.db
                .delete(userXpTransaction)
                .where(
                  and(
                    eq(userXpTransaction.userId, userId),
                    eq(userXpTransaction.challengeId, challengeData.id),
                  ),
                );
            }

            // Delete user progress
            await ctx.db
              .delete(userProgress)
              .where(
                and(
                  eq(userProgress.userId, userId),
                  eq(userProgress.challengeId, challengeData.id),
                ),
              );

            logger.info("Challenge progress reset with XP removal", {
              userId,
              challengeId: challengeData.id,
              challengeTitle: challengeData.title,
              xpRemoved: totalXpToRemove,
              transactionsDeleted: xpTransactions.length,
            });

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

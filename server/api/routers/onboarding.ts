import { and, count, eq, inArray } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import {
  trackOnboardingCompletedServer,
  trackOnboardingSkippedServer,
} from "@/lib/analytics-server";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { apikey } from "@/server/db/schema/auth";
import { userProgress } from "@/server/db/schema/challenge";
import { userOnboarding } from "@/server/db/schema/onboarding";

export const onboardingRouter = createTRPCRouter({
  /**
   * Get the current onboarding status for the authenticated user.
   * Derives some states from related tables (apikey, userProgress).
   */
  getStatus: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    // 1. Get the onboarding record (or null)
    const [onboarding] = await ctx.db
      .select()
      .from(userOnboarding)
      .where(eq(userOnboarding.userId, userId));

    // 2. Derive hasApiToken from apikey table
    const [tokenResult] = await ctx.db
      .select({ count: count() })
      .from(apikey)
      .where(eq(apikey.userId, userId));
    const hasApiToken = (tokenResult?.count ?? 0) > 0;

    // 3. Derive hasStartedChallenge from userProgress table
    const [startedResult] = await ctx.db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          inArray(userProgress.status, ["in_progress", "completed"]),
        ),
      );
    const hasStartedChallenge = (startedResult?.count ?? 0) > 0;

    // 4. Derive hasCompletedChallenge from userProgress table
    const [completedResult] = await ctx.db
      .select({ count: count() })
      .from(userProgress)
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.status, "completed"),
        ),
      );
    const hasCompletedChallenge = (completedResult?.count ?? 0) > 0;

    // 5. Calculate current step (1-7)
    let currentStep = 1; // Welcome
    if (onboarding) currentStep = 2; // CLI Install (user started onboarding)
    if (hasApiToken) currentStep = 3; // Token created
    if (onboarding?.cliAuthenticated) currentStep = 4; // CLI login done
    if (onboarding?.clusterInitialized) currentStep = 5; // Setup done
    if (hasStartedChallenge) currentStep = 6; // Challenge started
    if (hasCompletedChallenge) currentStep = 7; // Challenge completed

    return {
      steps: {
        hasApiToken,
        cliAuthenticated: onboarding?.cliAuthenticated ?? false,
        clusterInitialized: onboarding?.clusterInitialized ?? false,
        hasStartedChallenge,
        hasCompletedChallenge,
      },
      currentStep,
      isComplete: !!onboarding?.completedAt,
      isSkipped: !!onboarding?.skippedAt,
    };
  }),

  /**
   * Mark onboarding as completed.
   */
  complete: privateProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    await ctx.db
      .insert(userOnboarding)
      .values({
        userId,
        completedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userOnboarding.userId,
        set: {
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    await trackOnboardingCompletedServer(userId);

    revalidateTag(`user-${userId}-onboarding`, "max");

    return { success: true };
  }),

  /**
   * Skip the onboarding.
   */
  skip: privateProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    await ctx.db
      .insert(userOnboarding)
      .values({
        userId,
        skippedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userOnboarding.userId,
        set: {
          skippedAt: new Date(),
          updatedAt: new Date(),
        },
      });

    await trackOnboardingSkippedServer(userId);

    revalidateTag(`user-${userId}-onboarding`, "max");

    return { success: true };
  }),

  /**
   * Initialize or ensure onboarding record exists.
   * Called when user starts the onboarding wizard.
   * Uses upsert pattern to avoid race conditions.
   */
  initialize: privateProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Use upsert to avoid race condition (TOCTOU)
    const result = await ctx.db
      .insert(userOnboarding)
      .values({ userId })
      .onConflictDoNothing({ target: userOnboarding.userId })
      .returning({ id: userOnboarding.id });

    const isNew = result.length > 0;

    return { success: true, isNew };
  }),

  /**
   * Update CLI authentication status.
   * Called by CLI tracking endpoints.
   */
  updateCliAuthenticated: privateProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    await ctx.db
      .insert(userOnboarding)
      .values({
        userId,
        cliAuthenticated: true,
      })
      .onConflictDoUpdate({
        target: userOnboarding.userId,
        set: {
          cliAuthenticated: true,
          updatedAt: new Date(),
        },
      });

    revalidateTag(`user-${userId}-onboarding`, "max");

    return { success: true };
  }),

  /**
   * Update cluster initialized status.
   * Called by CLI tracking endpoints.
   */
  updateClusterInitialized: privateProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    await ctx.db
      .insert(userOnboarding)
      .values({
        userId,
        clusterInitialized: true,
      })
      .onConflictDoUpdate({
        target: userOnboarding.userId,
        set: {
          clusterInitialized: true,
          updatedAt: new Date(),
        },
      });

    revalidateTag(`user-${userId}-onboarding`, "max");

    return { success: true };
  }),
});

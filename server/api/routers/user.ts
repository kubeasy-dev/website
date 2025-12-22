import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { userProgress, userXp, userXpTransaction } from "@/server/db/schema";
import { user } from "@/server/db/schema/auth";

const { logger } = Sentry;

export const userRouter = createTRPCRouter({
  /**
   * Update user's name (first name and last name)
   */
  updateName: privateProcedure
    .input(
      z.object({
        firstName: z.string().min(1, "First name is required").max(100),
        lastName: z.string().max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const fullName = input.lastName
        ? `${input.firstName} ${input.lastName}`
        : input.firstName;

      try {
        await ctx.db
          .update(user)
          .set({
            name: fullName,
          })
          .where(eq(user.id, userId));

        // Invalidate user-related caches
        revalidateTag(`user-${userId}-profile`, "max");

        logger.info("User name updated", {
          userId,
          firstName: input.firstName,
          hasLastName: !!input.lastName,
        });

        return { success: true, name: fullName };
      } catch (error) {
        logger.error("Failed to update user name", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "user.updateName" },
          contexts: {
            user: {
              id: userId,
            },
          },
        });
        throw error;
      }
    }),

  /**
   * Reset all user progress - DANGER ZONE
   * Deletes all completed challenges, XP, and transactions
   */
  resetProgress: privateProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    return Sentry.startSpan(
      {
        op: "user.resetProgress",
        name: "Reset User Progress",
      },
      async (span) => {
        span.setAttribute("userId", userId);

        try {
          // Get current stats before reset for logging
          const [xpData] = await ctx.db
            .select({ totalXp: userXp.totalXp })
            .from(userXp)
            .where(eq(userXp.userId, userId))
            .limit(1);

          const completedChallenges = await ctx.db
            .select()
            .from(userProgress)
            .where(eq(userProgress.userId, userId));

          const completedCount = completedChallenges.length;
          const currentXp = xpData?.totalXp ?? 0;

          // Delete all user progress (neon-http doesn't support transactions)
          await ctx.db
            .delete(userProgress)
            .where(eq(userProgress.userId, userId));

          // Delete all XP transactions
          await ctx.db
            .delete(userXpTransaction)
            .where(eq(userXpTransaction.userId, userId));

          // Delete user XP record
          await ctx.db.delete(userXp).where(eq(userXp.userId, userId));

          // Invalidate all user-related caches
          revalidateTag(`user-${userId}-stats`, "max");
          revalidateTag(`user-${userId}-progress`, "max");
          revalidateTag(`user-${userId}-xp`, "max");
          revalidateTag(`user-${userId}-streak`, "max");

          logger.info("User progress reset", {
            userId,
            completedChallengesDeleted: completedCount,
            xpDeleted: currentXp,
          });

          span.setAttribute("completedChallengesDeleted", completedCount);
          span.setAttribute("xpDeleted", currentXp);

          return {
            success: true,
            deletedChallenges: completedCount,
            deletedXp: currentXp,
          };
        } catch (error) {
          logger.error("Failed to reset user progress", {
            userId,
            error: error instanceof Error ? error.message : String(error),
          });
          Sentry.captureException(error, {
            tags: { operation: "user.resetProgress" },
            contexts: {
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
});

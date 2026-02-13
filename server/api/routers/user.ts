import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { captureServerException } from "@/lib/analytics-server";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { userProgress, userXp, userXpTransaction } from "@/server/db/schema";
import { user } from "@/server/db/schema/auth";

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

        return { success: true, name: fullName };
      } catch (error) {
        captureServerException(error, userId, {
          operation: "user.updateName",
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

    try {
      // Delete all user progress (neon-http doesn't support transactions)
      await ctx.db.delete(userProgress).where(eq(userProgress.userId, userId));

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

      return {
        success: true,
      };
    } catch (error) {
      captureServerException(error, userId, {
        operation: "user.resetProgress",
      });
      throw error;
    }
  }),
});

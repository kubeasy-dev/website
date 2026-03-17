import { all } from "better-all";
import { desc, eq, sql } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  privateProcedure,
} from "@/server/api/trpc";
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

      await ctx.db
        .update(user)
        .set({
          name: fullName,
        })
        .where(eq(user.id, userId));

      // Invalidate user-related caches
      revalidateTag(`user-${userId}-profile`, "max");

      return { success: true, name: fullName };
    }),

  adminStats: adminProcedure.query(async ({ ctx }) => {
    const [stats] = await ctx.db
      .select({
        total: sql<number>`CAST(COUNT(*) AS INTEGER)`,
        active: sql<number>`CAST(COUNT(CASE WHEN ${user.banned} IS NOT TRUE THEN 1 END) AS INTEGER)`,
        banned: sql<number>`CAST(COUNT(CASE WHEN ${user.banned} = true THEN 1 END) AS INTEGER)`,
        admins: sql<number>`CAST(COUNT(CASE WHEN ${user.role} = 'admin' THEN 1 END) AS INTEGER)`,
      })
      .from(user);

    return {
      total: stats?.total ?? 0,
      active: stats?.active ?? 0,
      banned: stats?.banned ?? 0,
      admins: stats?.admins ?? 0,
    };
  }),

  adminList: adminProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const [countResult, users] = await Promise.all([
        ctx.db
          .select({ total: sql<number>`CAST(COUNT(*) AS INTEGER)` })
          .from(user),
        ctx.db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            banned: user.banned,
            banReason: user.banReason,
            createdAt: user.createdAt,
            completedChallenges: sql<number>`CAST(COUNT(DISTINCT CASE WHEN ${userProgress.status} = 'completed' THEN ${userProgress.challengeId} END) AS INTEGER)`,
            totalXp: sql<number>`CAST(COALESCE(MAX(${userXp.totalXp}), 0) AS INTEGER)`,
          })
          .from(user)
          .leftJoin(userProgress, eq(user.id, userProgress.userId))
          .leftJoin(userXp, eq(user.id, userXp.userId))
          .groupBy(user.id)
          .orderBy(desc(user.createdAt))
          .limit(input.limit)
          .offset(input.offset),
      ]);

      return { users, total: countResult[0]?.total ?? 0 };
    }),

  banUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new Error("You cannot ban yourself");
      }
      await ctx.db
        .update(user)
        .set({ banned: true, banReason: input.reason ?? null })
        .where(eq(user.id, input.userId));
      revalidateTag(`user-${input.userId}-profile`, "max");
      return { success: true };
    }),

  unbanUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(user)
        .set({ banned: false, banReason: null, banExpires: null })
        .where(eq(user.id, input.userId));
      revalidateTag(`user-${input.userId}-profile`, "max");
      return { success: true };
    }),

  setRole: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "user"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id) {
        throw new Error("You cannot change your own role");
      }
      await ctx.db
        .update(user)
        .set({ role: input.role === "user" ? null : input.role })
        .where(eq(user.id, input.userId));
      revalidateTag(`user-${input.userId}-profile`, "max");
      return { success: true };
    }),

  /**
   * Reset all user progress - DANGER ZONE
   * Deletes all completed challenges, XP, and transactions
   */
  resetProgress: privateProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Delete all user progress, XP transactions, and XP record in parallel
    // (neon-http doesn't support transactions, but these are independent + idempotent)
    const { deletedProgress, deletedTransactions } = await all({
      async deletedProgress() {
        return ctx.db
          .delete(userProgress)
          .where(eq(userProgress.userId, userId))
          .returning();
      },
      async deletedTransactions() {
        return ctx.db
          .delete(userXpTransaction)
          .where(eq(userXpTransaction.userId, userId))
          .returning();
      },
      async _xpRecord() {
        return ctx.db.delete(userXp).where(eq(userXp.userId, userId));
      },
    });

    const deletedXp = deletedTransactions.reduce(
      (sum, t) => sum + t.xpAmount,
      0,
    );

    // Invalidate all user-related caches
    revalidateTag(`user-${userId}-stats`, "max");
    revalidateTag(`user-${userId}-progress`, "max");
    revalidateTag(`user-${userId}-xp`, "max");
    revalidateTag(`user-${userId}-streak`, "max");

    return {
      success: true,
      deletedChallenges: deletedProgress.length,
      deletedXp,
    };
  }),
});

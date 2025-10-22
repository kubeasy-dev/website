import { desc, eq } from "drizzle-orm";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { challenge, userXpTransaction } from "@/server/db/schema";

export const xpTransactionRouter = createTRPCRouter({
  // Get recent XP gains for the authenticated user
  getRecentGains: privateProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

    const recentGains = await ctx.db
      .select({
        id: userXpTransaction.id,
        action: userXpTransaction.action,
        xpAmount: userXpTransaction.xpAmount,
        description: userXpTransaction.description,
        createdAt: userXpTransaction.createdAt,
        // Challenge details (may be null if transaction not related to a challenge)
        challengeId: challenge.id,
        challengeTitle: challenge.title,
        challengeSlug: challenge.slug,
        challengeDifficulty: challenge.difficulty,
      })
      .from(userXpTransaction)
      .leftJoin(challenge, eq(userXpTransaction.challengeId, challenge.id))
      .where(eq(userXpTransaction.userId, userId))
      .orderBy(desc(userXpTransaction.createdAt))
      .limit(5);

    return recentGains;
  }),
});

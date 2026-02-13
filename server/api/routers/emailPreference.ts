import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { env } from "@/env";
import { captureServerException } from "@/lib/analytics-server";
import { getContactSubscriptions, updateContactTopics } from "@/lib/resend";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { user } from "@/server/db/schema/auth";
import { emailTopic } from "@/server/db/schema/email";

export const emailPreferenceRouter = createTRPCRouter({
  /**
   * List all email topics with user's subscription status
   * Subscription status is fetched from Resend (source of truth)
   */
  listTopics: publicProcedure.query(async ({ ctx }) => {
    const topics = await ctx.db
      .select({
        id: emailTopic.id,
        resendTopicId: emailTopic.resendTopicId,
        name: emailTopic.name,
        description: emailTopic.description,
        defaultOptIn: emailTopic.defaultOptIn,
      })
      .from(emailTopic);

    // If not authenticated, return default status
    if (!ctx.user) {
      return topics.map((topic) => ({
        ...topic,
        subscribed: topic.defaultOptIn,
      }));
    }

    // Get user's Resend contact ID
    const [userData] = await ctx.db
      .select({ resendContactId: user.resendContactId })
      .from(user)
      .where(eq(user.id, ctx.user.id))
      .limit(1);

    // If no Resend contact, return default status
    if (!userData?.resendContactId || !env.RESEND_API_KEY) {
      return topics.map((topic) => ({
        ...topic,
        subscribed: topic.defaultOptIn,
      }));
    }

    try {
      // Fetch subscription status from Resend
      const subscriptions = await getContactSubscriptions(
        userData.resendContactId,
      );
      const subMap = new Map(
        subscriptions.map((s) => [s.topicId, s.subscribed]),
      );

      return topics.map((topic) => ({
        ...topic,
        subscribed: subMap.get(topic.resendTopicId) ?? topic.defaultOptIn,
      }));
    } catch (error) {
      captureServerException(error, ctx.user.id, {
        operation: "emailPreference.listTopics",
        contactId: userData.resendContactId,
      });
      // Graceful degradation - return default status
      return topics.map((topic) => ({
        ...topic,
        subscribed: topic.defaultOptIn,
      }));
    }
  }),

  /**
   * Update user's subscription status for a specific topic
   * Updates directly in Resend (source of truth)
   */
  updateSubscription: privateProcedure
    .input(
      z.object({
        topicId: z.number().int(),
        subscribed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get topic and validate
      const [topic] = await ctx.db
        .select()
        .from(emailTopic)
        .where(eq(emailTopic.id, input.topicId))
        .limit(1);

      if (!topic) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email topic not found",
        });
      }

      // Get user's Resend contact ID
      const [userData] = await ctx.db
        .select({ resendContactId: user.resendContactId })
        .from(user)
        .where(eq(user.id, ctx.user.id))
        .limit(1);

      if (!userData?.resendContactId) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "No Resend contact found for user",
        });
      }

      try {
        // Update subscription directly in Resend
        await updateContactTopics({
          contactIdOrEmail: userData.resendContactId,
          topics: [
            {
              id: topic.resendTopicId,
              subscription: input.subscribed ? "opt_in" : "opt_out",
            },
          ],
        });

        return { success: true };
      } catch (error) {
        captureServerException(error, ctx.user.id, {
          operation: "emailPreference.updateSubscription",
          topicId: input.topicId,
          topicName: topic.name,
        });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update email subscription",
        });
      }
    }),
});

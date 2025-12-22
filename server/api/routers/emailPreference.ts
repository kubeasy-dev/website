import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { env } from "@/env";
import { updateContactSubscription } from "@/lib/resend";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { emailCategory, userEmailPreference } from "@/server/db/schema/email";

const { logger } = Sentry;

export const emailPreferenceRouter = createTRPCRouter({
  /**
   * List all email categories with user's subscription status
   * Public procedure that returns default status if user is not authenticated
   */
  listCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db
      .select({
        id: emailCategory.id,
        name: emailCategory.name,
        description: emailCategory.description,
        forceSubscription: emailCategory.forceSubscription,
      })
      .from(emailCategory);

    if (!ctx.user) {
      // Return categories without user preferences if not authenticated
      return categories.map((cat) => ({
        ...cat,
        subscribed: cat.forceSubscription,
      }));
    }

    // Get user preferences
    const userPrefs = await ctx.db
      .select({
        categoryId: userEmailPreference.categoryId,
        subscribed: userEmailPreference.subscribed,
      })
      .from(userEmailPreference)
      .where(eq(userEmailPreference.userId, ctx.user.id));

    const prefsMap = new Map(
      userPrefs.map((pref) => [pref.categoryId, pref.subscribed]),
    );

    return categories.map((cat) => ({
      ...cat,
      subscribed: prefsMap.get(cat.id) ?? cat.forceSubscription,
    }));
  }),

  /**
   * Update user's subscription status for a specific email category
   */
  updateSubscription: privateProcedure
    .input(
      z.object({
        categoryId: z.number().int(),
        subscribed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if category exists
      const [category] = await ctx.db
        .select()
        .from(emailCategory)
        .where(eq(emailCategory.id, input.categoryId))
        .limit(1);

      if (!category) {
        logger.warn("Email category not found", {
          userId: ctx.user.id,
          categoryId: input.categoryId,
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Email category not found",
        });
      }

      // Cannot unsubscribe from forced categories (transactional emails)
      if (category.forceSubscription && !input.subscribed) {
        logger.warn("Attempted to unsubscribe from transactional emails", {
          userId: ctx.user.id,
          categoryId: input.categoryId,
          categoryName: category.name,
        });
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot unsubscribe from transactional emails",
        });
      }

      // Get user's current preference to retrieve contactId
      const [existingPref] = await ctx.db
        .select()
        .from(userEmailPreference)
        .where(
          and(
            eq(userEmailPreference.userId, ctx.user.id),
            eq(userEmailPreference.categoryId, input.categoryId),
          ),
        )
        .limit(1);

      const wasSubscribed =
        existingPref?.subscribed ?? category.forceSubscription;

      try {
        // Upsert user preference
        const [updatedPref] = await ctx.db
          .insert(userEmailPreference)
          .values({
            userId: ctx.user.id,
            categoryId: input.categoryId,
            subscribed: input.subscribed,
            updatedAt: new Date(),
            contactId: existingPref?.contactId || null,
          })
          .onConflictDoUpdate({
            target: [
              userEmailPreference.userId,
              userEmailPreference.categoryId,
            ],
            set: {
              subscribed: input.subscribed,
              updatedAt: new Date(),
            },
          })
          .returning();

        // Sync with Resend if we have a contactId and audienceId
        if (
          updatedPref?.contactId &&
          category.audienceId &&
          env.RESEND_API_KEY
        ) {
          try {
            await updateContactSubscription({
              contactId: updatedPref.contactId,
              audienceId: category.audienceId,
              subscribed: input.subscribed,
            });

            logger.info("Email preference updated and synced with Resend", {
              userId: ctx.user.id,
              categoryId: input.categoryId,
              categoryName: category.name,
              subscribed: input.subscribed,
              previouslySubscribed: wasSubscribed,
              contactId: updatedPref.contactId,
            });
          } catch (resendError) {
            logger.error("Failed to sync email preference with Resend", {
              userId: ctx.user.id,
              categoryId: input.categoryId,
              categoryName: category.name,
              contactId: updatedPref.contactId,
              audienceId: category.audienceId,
              error:
                resendError instanceof Error
                  ? resendError.message
                  : String(resendError),
            });
            Sentry.captureException(resendError, {
              tags: { operation: "emailPreference.resendSync" },
              contexts: {
                user: {
                  id: ctx.user.id,
                },
                emailCategory: {
                  id: input.categoryId,
                  name: category.name,
                },
              },
            });
            // Don't throw - the database update was successful
            // The sync can be retried later
          }
        } else {
          logger.info("Email preference updated", {
            userId: ctx.user.id,
            categoryId: input.categoryId,
            categoryName: category.name,
            subscribed: input.subscribed,
            previouslySubscribed: wasSubscribed,
          });
        }

        // Invalidate email preferences cache
        revalidateTag(`user-${ctx.user.id}-email-prefs`, "max");

        return { success: true };
      } catch (error) {
        logger.error("Failed to update email preference", {
          userId: ctx.user.id,
          categoryId: input.categoryId,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "emailPreference.update" },
          contexts: {
            user: {
              id: ctx.user.id,
            },
          },
        });
        throw error;
      }
    }),
});

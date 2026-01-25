import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { trackDemoConvertedServer } from "@/lib/analytics-server";
import {
  type DemoConversionResult,
  getDemoSession,
  isValidDemoToken,
} from "@/lib/demo-session";
import { isRedisConfigured } from "@/lib/redis";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { demoConversion } from "@/server/db/schema";

const { logger } = Sentry;

export const demoRouter = createTRPCRouter({
  /**
   * Link a demo token to the current authenticated user
   * This is called after signup to track demo conversions
   */
  linkDemoConversion: privateProcedure
    .input(
      z.object({
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }): Promise<DemoConversionResult> => {
      const { token } = input;
      const userId = ctx.user.id;

      // Validate token format
      if (!isValidDemoToken(token)) {
        return {
          success: false,
          wasCompleted: false,
          message: "Invalid token format",
        };
      }

      // Check if Redis is configured
      if (!isRedisConfigured) {
        logger.warn("Demo conversion link failed: Redis not configured");
        return {
          success: false,
          wasCompleted: false,
          message: "Demo mode not available",
        };
      }

      try {
        // Get demo session from Redis to check if it was completed
        const session = await getDemoSession(token);
        const wasCompleted = session?.completedAt !== undefined;

        // Update the PostgreSQL record to link the conversion
        const result = await ctx.db
          .update(demoConversion)
          .set({
            convertedAt: new Date(),
            convertedUserId: userId,
          })
          .where(eq(demoConversion.id, token))
          .returning({ id: demoConversion.id });

        if (result.length === 0) {
          // Token not found in DB - might have been created but not persisted
          // Try to create the record
          try {
            await ctx.db.insert(demoConversion).values({
              id: token,
              createdAt: session?.createdAt
                ? new Date(session.createdAt)
                : new Date(),
              completedAt: session?.completedAt
                ? new Date(session.completedAt)
                : null,
              convertedAt: new Date(),
              convertedUserId: userId,
              utmSource: session?.utmSource,
              utmMedium: session?.utmMedium,
              utmCampaign: session?.utmCampaign,
            });
          } catch {
            // Ignore if already exists
          }
        }

        logger.info("Demo conversion linked", {
          token,
          userId,
          wasCompleted,
        });

        // Track conversion in PostHog
        await trackDemoConvertedServer(token, userId, wasCompleted);

        return {
          success: true,
          wasCompleted,
          message: wasCompleted
            ? "Demo conversion linked (completed demo)"
            : "Demo conversion linked (incomplete demo)",
        };
      } catch (error) {
        logger.error("Demo conversion link failed", {
          token,
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "demo.linkConversion" },
          contexts: { demo: { token, userId } },
        });

        return {
          success: false,
          wasCompleted: false,
          message: "Failed to link demo conversion",
        };
      }
    }),
});

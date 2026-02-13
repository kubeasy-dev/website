import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import {
  captureServerException,
  trackApiTokenCreatedServer,
} from "@/lib/analytics-server";
import { auth } from "@/lib/auth";
import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { apikey } from "@/server/db/schema/auth";

export const apiKeyRouter = createTRPCRouter({
  /**
   * Create a new API key
   * Returns the full key ONLY on creation (this is the only time it will be shown)
   */
  create: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required").max(100, "Name too long"),
        expiresInDays: z.number().int().positive().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Convert expiresInDays to expiresIn (seconds)
      const expiresIn = input.expiresInDays
        ? input.expiresInDays * 24 * 60 * 60
        : undefined;

      try {
        // Use Better Auth's createApiKey to ensure proper hashing
        const result = await auth.api.createApiKey({
          body: {
            name: input.name,
            expiresIn,
            prefix: "kubeasy",
            userId: ctx.user.id,
          },
        });

        // Track API token creation in PostHog
        await trackApiTokenCreatedServer(ctx.user.id);

        // IMPORTANT: Return the full key only on creation
        // Better Auth returns the full key in the response
        return {
          id: result.id,
          name: result.name,
          start: result.start,
          enabled: result.enabled,
          createdAt: result.createdAt,
          expiresAt: result.expiresAt,
          fullKey: result.key, // This is the ONLY time the full key is returned
        };
      } catch (error) {
        captureServerException(error, ctx.user.id, {
          operation: "apiKey.create",
        });
        throw error;
      }
    }),

  /**
   * Revoke (soft delete) an API key
   */
  revoke: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the key belongs to the user
      const [existingKey] = await ctx.db
        .select()
        .from(apikey)
        .where(and(eq(apikey.id, input.id), eq(apikey.userId, ctx.user.id)))
        .limit(1);

      if (!existingKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      try {
        // Soft delete by setting enabled to false
        await ctx.db
          .update(apikey)
          .set({
            enabled: false,
            updatedAt: new Date(),
          })
          .where(eq(apikey.id, input.id));

        return { success: true };
      } catch (error) {
        captureServerException(error, ctx.user.id, {
          operation: "apiKey.revoke",
          keyId: input.id,
        });
        throw error;
      }
    }),

  /**
   * Permanently delete an API key
   */
  delete: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the key belongs to the user
      const [existingKey] = await ctx.db
        .select()
        .from(apikey)
        .where(and(eq(apikey.id, input.id), eq(apikey.userId, ctx.user.id)))
        .limit(1);

      if (!existingKey) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "API key not found",
        });
      }

      try {
        await ctx.db.delete(apikey).where(eq(apikey.id, input.id));

        return { success: true };
      } catch (error) {
        captureServerException(error, ctx.user.id, {
          operation: "apiKey.delete",
          keyId: input.id,
        });
        throw error;
      }
    }),
});

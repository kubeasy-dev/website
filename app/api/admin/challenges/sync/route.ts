import * as Sentry from "@sentry/nextjs";
import type { User } from "better-auth";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateApiRequest } from "@/lib/api-auth";
import db from "@/server/db";
import {
  challenge,
  challengeObjective,
  challengeTheme,
  challengeType,
} from "@/server/db/schema";

// User type with admin plugin fields
interface UserWithRole extends User {
  role?: string | null;
}

const { logger } = Sentry;

// Schema for a single objective in a challenge
const objectiveSyncSchema = z.object({
  objectiveKey: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1), // Required - all CRDs must have kubeasy.dev/description annotation
  category: z.enum([
    "status",
    "log",
    "event",
    "metrics",
    "rbac",
    "connectivity",
  ]),
  displayOrder: z.number().int().default(0),
});

// Schema for a single challenge in the sync request
const challengeSyncSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  theme: z.string().min(1),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.string().min(1).default("fix"),
  estimatedTime: z.number().int().positive(),
  initialSituation: z.string().min(1),
  objective: z.string().min(1),
  ofTheWeek: z.boolean().default(false),
  starterFriendly: z.boolean().default(false),
  objectives: z.array(objectiveSyncSchema).default([]),
});

// Schema for the sync request body
const syncRequestSchema = z.object({
  challenges: z.array(challengeSyncSchema),
});

// Type for objectives from sync schema
type ObjectiveSync = z.infer<typeof objectiveSyncSchema>;

/**
 * Syncs objectives for a challenge.
 * Strategy: delete all existing objectives and insert new ones.
 * This ensures we always have the correct state from the source of truth (CRDs).
 */
async function syncChallengeObjectives(
  challengeId: number,
  objectives: ObjectiveSync[],
): Promise<void> {
  // Delete all existing objectives for this challenge
  await db
    .delete(challengeObjective)
    .where(eq(challengeObjective.challengeId, challengeId));

  // Insert new objectives
  if (objectives.length > 0) {
    await db.insert(challengeObjective).values(
      objectives.map((obj) => ({
        challengeId,
        objectiveKey: obj.objectiveKey,
        title: obj.title,
        description: obj.description,
        category: obj.category,
        displayOrder: obj.displayOrder,
      })),
    );
  }
}

/**
 * POST /api/admin/challenges/sync
 * Synchronizes challenges from the request body:
 * - Creates challenges that don't exist in DB
 * - Updates challenges that exist but have different data
 * - Deletes challenges that exist in DB but not in the request body
 *
 * Authentication: Requires admin user session
 *
 * Request body:
 * {
 *   challenges: [
 *     {
 *       slug: string,
 *       title: string,
 *       description: string,
 *       theme: string,
 *       difficulty: "easy" | "medium" | "hard",
 *       estimatedTime: number,
 *       initialSituation: string,
 *       objective: string,
 *       ofTheWeek: boolean
 *     }
 *   ]
 * }
 *
 * Response:
 * {
 *   success: true,
 *   created: number,
 *   updated: number,
 *   deleted: number,
 *   details: {
 *     created: string[],
 *     updated: string[],
 *     deleted: string[]
 *   }
 * }
 */
export async function POST(request: Request) {
  return Sentry.startSpan(
    { op: "http.server", name: "POST /api/admin/challenges/sync" },
    async (span) => {
      try {
        // Authenticate using API token (same as CLI routes)
        const authResult = await authenticateApiRequest(request);

        if (!authResult.success || !authResult.user) {
          logger.warn("Unauthorized sync attempt", {
            error: authResult.error,
          });
          return NextResponse.json(
            { error: authResult.error || "Unauthorized" },
            { status: 401 },
          );
        }

        // Check if user is admin (role field added by admin plugin)
        const userRole = (authResult.user as UserWithRole).role;
        if (userRole !== "admin") {
          logger.warn("Forbidden sync attempt - user is not admin", {
            userId: authResult.user.id,
            userRole,
          });
          return NextResponse.json(
            { error: "Forbidden - Admin access only" },
            { status: 403 },
          );
        }

        span.setAttribute("userId", authResult.user.id);

        // Parse and validate request body
        const body = await request.json();
        const validationResult = syncRequestSchema.safeParse(body);

        if (!validationResult.success) {
          logger.warn("Invalid sync request body", {
            errors: validationResult.error.issues,
          });
          return NextResponse.json(
            {
              error: "Invalid request body",
              details: validationResult.error.issues,
            },
            { status: 400 },
          );
        }

        const { challenges: incomingChallenges } = validationResult.data;

        span.setAttribute("incomingChallengesCount", incomingChallenges.length);

        logger.info("Starting challenge sync", {
          incomingCount: incomingChallenges.length,
          userId: authResult.user.id,
        });

        // Validate that all themes exist
        const uniqueThemes = [
          ...new Set(incomingChallenges.map((c) => c.theme)),
        ];
        const existingThemes = await db
          .select({ slug: challengeTheme.slug })
          .from(challengeTheme);
        const existingThemeSlugs = new Set(existingThemes.map((t) => t.slug));

        const missingThemes = uniqueThemes.filter(
          (theme) => !existingThemeSlugs.has(theme),
        );

        if (missingThemes.length > 0) {
          logger.warn("Sync failed - missing themes", {
            missingThemes,
          });
          return NextResponse.json(
            {
              error: "Invalid themes",
              details: `The following themes do not exist: ${missingThemes.join(", ")}`,
            },
            { status: 400 },
          );
        }

        // Validate that all types exist
        const uniqueTypes = [
          ...new Set(incomingChallenges.map((c) => c.type)),
        ];
        const existingTypes = await db
          .select({ slug: challengeType.slug })
          .from(challengeType);
        const existingTypeSlugs = new Set(existingTypes.map((t) => t.slug));

        const missingTypes = uniqueTypes.filter(
          (type) => !existingTypeSlugs.has(type),
        );

        if (missingTypes.length > 0) {
          logger.warn("Sync failed - missing types", {
            missingTypes,
          });
          return NextResponse.json(
            {
              error: "Invalid types",
              details: `The following types do not exist: ${missingTypes.join(", ")}`,
            },
            { status: 400 },
          );
        }

        // Get all existing challenges from DB
        const existingChallenges = await db.select().from(challenge);

        const existingChallengeMap = new Map(
          existingChallenges.map((c) => [c.slug, c]),
        );
        const incomingChallengeMap = new Map(
          incomingChallenges.map((c) => [c.slug, c]),
        );

        const created: string[] = [];
        const updated: string[] = [];
        const deleted: string[] = [];

        // Process incoming challenges (create or update)
        for (const incomingChallenge of incomingChallenges) {
          const existing = existingChallengeMap.get(incomingChallenge.slug);

          if (!existing) {
            // Create new challenge
            const [insertedChallenge] = await db
              .insert(challenge)
              .values({
                slug: incomingChallenge.slug,
                title: incomingChallenge.title,
                description: incomingChallenge.description,
                theme: incomingChallenge.theme,
                difficulty: incomingChallenge.difficulty,
                typeSlug: incomingChallenge.type,
                estimatedTime: incomingChallenge.estimatedTime,
                initialSituation: incomingChallenge.initialSituation,
                objective: incomingChallenge.objective,
                ofTheWeek: incomingChallenge.ofTheWeek,
                starterFriendly: incomingChallenge.starterFriendly,
              })
              .returning({ id: challenge.id });

            // Sync objectives for the new challenge
            await syncChallengeObjectives(
              insertedChallenge.id,
              incomingChallenge.objectives,
            );

            created.push(incomingChallenge.slug);
            logger.info("Created challenge", {
              slug: incomingChallenge.slug,
              objectivesCount: incomingChallenge.objectives.length,
            });
          } else {
            // Check if update is needed for challenge metadata
            const needsUpdate =
              existing.title !== incomingChallenge.title ||
              existing.description !== incomingChallenge.description ||
              existing.theme !== incomingChallenge.theme ||
              existing.difficulty !== incomingChallenge.difficulty ||
              existing.typeSlug !== incomingChallenge.type ||
              existing.estimatedTime !== incomingChallenge.estimatedTime ||
              existing.initialSituation !==
                incomingChallenge.initialSituation ||
              existing.objective !== incomingChallenge.objective ||
              existing.ofTheWeek !== incomingChallenge.ofTheWeek ||
              existing.starterFriendly !== incomingChallenge.starterFriendly;

            if (needsUpdate) {
              await db
                .update(challenge)
                .set({
                  title: incomingChallenge.title,
                  description: incomingChallenge.description,
                  theme: incomingChallenge.theme,
                  difficulty: incomingChallenge.difficulty,
                  typeSlug: incomingChallenge.type,
                  estimatedTime: incomingChallenge.estimatedTime,
                  initialSituation: incomingChallenge.initialSituation,
                  objective: incomingChallenge.objective,
                  ofTheWeek: incomingChallenge.ofTheWeek,
                  starterFriendly: incomingChallenge.starterFriendly,
                })
                .where(eq(challenge.slug, incomingChallenge.slug));
              updated.push(incomingChallenge.slug);
              logger.info("Updated challenge", {
                slug: incomingChallenge.slug,
              });
            }

            // Always sync objectives (even if challenge metadata unchanged)
            // This ensures objectives are always up to date from source of truth
            await syncChallengeObjectives(
              existing.id,
              incomingChallenge.objectives,
            );
          }
        }

        // Delete challenges that exist in DB but not in incoming data
        for (const existing of existingChallenges) {
          if (!incomingChallengeMap.has(existing.slug)) {
            await db.delete(challenge).where(eq(challenge.slug, existing.slug));
            deleted.push(existing.slug);
            logger.info("Deleted challenge", {
              slug: existing.slug,
            });
          }
        }

        span.setAttribute("createdCount", created.length);
        span.setAttribute("updatedCount", updated.length);
        span.setAttribute("deletedCount", deleted.length);

        logger.info("Challenge sync completed", {
          created: created.length,
          updated: updated.length,
          deleted: deleted.length,
        });

        // 🔥 CRITICAL: Invalidate cache after synchronization
        revalidateTag("challenges", "max");
        revalidateTag("themes", "max");
        revalidateTag("types", "max");

        // Invalidate specific challenges that were modified or deleted
        for (const slug of [...updated, ...deleted]) {
          revalidateTag(`challenge-${slug}`, "max");
        }

        logger.info("Cache invalidated after sync", {
          invalidatedTags: [
            "challenges",
            "themes",
            "types",
            ...updated.map((s) => `challenge-${s}`),
            ...deleted.map((s) => `challenge-${s}`),
          ],
        });

        return NextResponse.json({
          success: true,
          created: created.length,
          updated: updated.length,
          deleted: deleted.length,
          details: {
            created,
            updated,
            deleted,
          },
        });
      } catch (error) {
        logger.error("Challenge sync failed", {
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "challenge.sync" },
        });
        return NextResponse.json(
          {
            error: "Internal server error",
            details: error instanceof Error ? error.message : String(error),
          },
          { status: 500 },
        );
      }
    },
  );
}

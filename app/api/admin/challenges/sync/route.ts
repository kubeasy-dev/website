import type { User } from "better-auth";
import { eq } from "drizzle-orm";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { captureServerException } from "@/lib/analytics-server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { challengeYamlSchema } from "@/schemas/challenge";
import type { Objective } from "@/schemas/challengeObjectives";
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

// Schema for a single challenge in the sync request
const challengeSyncSchema = challengeYamlSchema.extend({
  slug: z.string().min(1).describe("Unique challenge slug"),
});

// Schema for the sync request body
const syncRequestSchema = z.object({
  challenges: z.array(challengeSyncSchema),
});

/**
 * Syncs objectives for a challenge.
 * Strategy: delete all existing objectives and insert new ones.
 * This ensures we always have the correct state from the source of truth (CRDs).
 */
async function syncChallengeObjectives(
  challengeId: number,
  objectives: Objective[],
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
        objectiveKey: obj.key,
        title: obj.title,
        description: obj.description,
        category: obj.type,
        displayOrder: obj.order,
      })),
    );
  }
}

/**
 * POST /api/admin/challenges/sync
 * Synchronizes challenges from the request body
 */
export async function POST(request: Request) {
  try {
    // Authenticate using API token (same as CLI routes)
    const authResult = await authenticateApiRequest(request);

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { error: authResult.error || "Unauthorized" },
        { status: 401 },
      );
    }

    // Check if user is admin (role field added by admin plugin)
    const userRole = (authResult.user as UserWithRole).role;
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access only" },
        { status: 403 },
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }
    const validationResult = syncRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const { challenges: incomingChallenges } = validationResult.data;

    // Validate that all themes exist
    const uniqueThemes = [...new Set(incomingChallenges.map((c) => c.theme))];
    const existingThemes = await db
      .select({ slug: challengeTheme.slug })
      .from(challengeTheme);
    const existingThemeSlugs = new Set(existingThemes.map((t) => t.slug));

    const missingThemes = uniqueThemes.filter(
      (theme) => !existingThemeSlugs.has(theme),
    );

    if (missingThemes.length > 0) {
      return NextResponse.json(
        {
          error: "Invalid themes",
          details: `The following themes do not exist: ${missingThemes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Validate that all types exist
    const uniqueTypes = [...new Set(incomingChallenges.map((c) => c.type))];
    const existingTypes = await db
      .select({ slug: challengeType.slug })
      .from(challengeType);
    const existingTypeSlugs = new Set(existingTypes.map((t) => t.slug));

    const missingTypes = uniqueTypes.filter(
      (type) => !existingTypeSlugs.has(type),
    );

    if (missingTypes.length > 0) {
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
    // Note: neon-http driver doesn't support transactions, so changes are not atomic
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
      } else {
        // Check if update is needed for challenge metadata
        const needsUpdate =
          existing.title !== incomingChallenge.title ||
          existing.description !== incomingChallenge.description ||
          existing.theme !== incomingChallenge.theme ||
          existing.difficulty !== incomingChallenge.difficulty ||
          existing.typeSlug !== incomingChallenge.type ||
          existing.estimatedTime !== incomingChallenge.estimatedTime ||
          existing.initialSituation !== incomingChallenge.initialSituation ||
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
      }
    }

    // Invalidate cache after synchronization
    revalidateTag("challenges", "max");
    revalidateTag("themes", "max");
    revalidateTag("types", "max");

    // Invalidate specific challenges that were modified or deleted
    for (const slug of [...updated, ...deleted]) {
      revalidateTag(`challenge-${slug}`, "max");
    }

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
    await captureServerException(error, undefined, {
      operation: "challenge.sync",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  captureServerException,
  trackCliSetupServer,
} from "@/lib/analytics-server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { realtime } from "@/lib/realtime";
import db from "@/server/db";
import { userOnboarding } from "@/server/db/schema/onboarding";

const trackSetupSchema = z.object({
  cliVersion: z.string(),
  os: z.string(),
  arch: z.string(),
});

/**
 * POST /api/cli/track/setup
 * Track CLI setup event for onboarding.
 * Called by CLI after successful `kubeasy init` command.
 *
 * Authentication: Requires API token in Authorization header
 * Format: Bearer <token>
 *
 * Body:
 * {
 *   cliVersion: string,
 *   os: string,
 *   arch: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   firstTime: boolean
 * }
 */
export async function POST(request: Request) {
  // Authenticate the request
  const auth = await authenticateApiRequest(request);

  if (!auth.success || !auth.user) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 },
    );
  }

  const userId = auth.user.id;

  try {
    // Parse and validate body
    const body = await request.json();
    const parsed = trackSetupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { cliVersion, os, arch } = parsed.data;

    // Check if this is the first time the user is setting up the cluster
    const [existing] = await db
      .select({ clusterInitialized: userOnboarding.clusterInitialized })
      .from(userOnboarding)
      .where(eq(userOnboarding.userId, userId));

    const firstTime = !existing?.clusterInitialized;

    // Upsert onboarding record with clusterInitialized = true
    await db
      .insert(userOnboarding)
      .values({
        userId,
        clusterInitialized: true,
      })
      .onConflictDoUpdate({
        target: userOnboarding.userId,
        set: {
          clusterInitialized: true,
          updatedAt: new Date(),
        },
      });

    // Track in PostHog
    await trackCliSetupServer(userId, { cliVersion, os, arch });

    // Publish realtime event for instant UI update
    if (realtime) {
      const channel = realtime.channel(`onboarding:${userId}`);
      await channel.emit("onboarding.stepCompleted", {
        step: "clusterInitialized" as const,
        timestamp: new Date(),
      });
    }

    return NextResponse.json({
      success: true,
      firstTime,
    });
  } catch (error) {
    await captureServerException(error, userId, {
      operation: "cli.track.setup",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

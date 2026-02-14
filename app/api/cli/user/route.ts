import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  captureServerException,
  trackCliLoginServer,
} from "@/lib/analytics-server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { realtime } from "@/lib/realtime";
import db from "@/server/db";
import { userOnboarding } from "@/server/db/schema/onboarding";

const cliMetadataSchema = z.object({
  cliVersion: z.string(),
  os: z.string(),
  arch: z.string(),
});

/**
 * Helper to parse user name into first/last name
 */
function parseUserName(fullName: string | null) {
  const name = fullName || "";
  const nameParts = name.trim().split(" ");
  return {
    firstName: nameParts[0] || "",
    lastName: nameParts.length > 1 ? nameParts.slice(1).join(" ") : null,
  };
}

/**
 * @deprecated Use POST /api/cli/user instead which also tracks CLI login.
 *
 * GET /api/cli/user
 * Returns the authenticated user's first name and last name
 *
 * Authentication: Requires API token in Authorization header
 * Format: Bearer <token>
 *
 * Response:
 * {
 *   firstName: string,
 *   lastName?: string
 * }
 */
export async function GET(request: Request) {
  const auth = await authenticateApiRequest(request);

  if (!auth.success || !auth.user) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 },
    );
  }

  const { firstName, lastName } = parseUserName(auth.user.name);

  return NextResponse.json(
    { firstName, lastName },
    {
      headers: {
        Deprecation: "true",
        Link: '</api/cli/user>; rel="successor-version"',
      },
    },
  );
}

/**
 * POST /api/cli/user
 * Returns user info AND tracks CLI login for onboarding.
 * Called by CLI after successful `kubeasy login` command.
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
 *   firstName: string,
 *   lastName?: string,
 *   firstLogin: boolean
 * }
 */
export async function POST(request: Request) {
  const auth = await authenticateApiRequest(request);

  if (!auth.success || !auth.user) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 },
    );
  }

  const userId = auth.user.id;

  // Parse JSON body with dedicated error handling
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON body" },
      { status: 400 },
    );
  }

  try {
    // Validate body schema
    const parsed = cliMetadataSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: parsed.error.format() },
        { status: 400 },
      );
    }

    const { cliVersion, os, arch } = parsed.data;

    // Atomically determine firstLogin and set cliAuthenticated = true
    // Step 1: Try to update existing record where cliAuthenticated = false
    const updateResult = await db
      .update(userOnboarding)
      .set({ cliAuthenticated: true, updatedAt: new Date() })
      .where(
        and(
          eq(userOnboarding.userId, userId),
          eq(userOnboarding.cliAuthenticated, false),
        ),
      )
      .returning({ userId: userOnboarding.userId });

    let firstLogin: boolean;

    if (updateResult.length > 0) {
      // Updated from false to true - this is first login
      firstLogin = true;
    } else {
      // Either record doesn't exist, or cliAuthenticated was already true
      // Try to insert new record (will do nothing if exists)
      const insertResult = await db
        .insert(userOnboarding)
        .values({ userId, cliAuthenticated: true })
        .onConflictDoNothing({ target: userOnboarding.userId })
        .returning({ userId: userOnboarding.userId });

      // If insert succeeded, this is a new user's first login
      firstLogin = insertResult.length > 0;
    }

    // Track in PostHog
    await trackCliLoginServer(userId, { cliVersion, os, arch });

    // Publish realtime event for instant UI update
    if (realtime) {
      const channel = realtime.channel(`onboarding:${userId}`);
      await channel.emit("onboarding.stepCompleted", {
        step: "cliAuthenticated" as const,
        timestamp: new Date(),
      });
    }

    // Parse user name
    const { firstName, lastName } = parseUserName(auth.user.name);

    return NextResponse.json({
      firstName,
      lastName,
      firstLogin,
    });
  } catch (error) {
    await captureServerException(error, userId, {
      operation: "cli.user.login",
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

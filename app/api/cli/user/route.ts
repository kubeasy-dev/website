import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { trackCliLoginServer } from "@/lib/analytics-server";
import { authenticateApiRequest } from "@/lib/api-auth";
import { realtime } from "@/lib/realtime";
import db from "@/server/db";
import { userOnboarding } from "@/server/db/schema/onboarding";

const { logger } = Sentry;

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

  return NextResponse.json({
    firstName,
    lastName,
  });
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
  return Sentry.startSpan(
    { op: "cli.user.login", name: "CLI User Login" },
    async (span) => {
      const auth = await authenticateApiRequest(request);

      if (!auth.success || !auth.user) {
        return NextResponse.json(
          { error: auth.error || "Unauthorized" },
          { status: 401 },
        );
      }

      const userId = auth.user.id;
      span.setAttribute("userId", userId);

      try {
        // Parse and validate body
        const body = await request.json();
        const parsed = cliMetadataSchema.safeParse(body);

        if (!parsed.success) {
          return NextResponse.json(
            { error: "Invalid request body", details: parsed.error.format() },
            { status: 400 },
          );
        }

        const { cliVersion, os, arch } = parsed.data;
        span.setAttribute("cliVersion", cliVersion);
        span.setAttribute("os", os);
        span.setAttribute("arch", arch);

        // Check if this is the first time the user is logging in via CLI
        const [existing] = await db
          .select({ cliAuthenticated: userOnboarding.cliAuthenticated })
          .from(userOnboarding)
          .where(eq(userOnboarding.userId, userId));

        const firstLogin = !existing?.cliAuthenticated;

        // Upsert onboarding record with cliAuthenticated = true
        await db
          .insert(userOnboarding)
          .values({
            userId,
            cliAuthenticated: true,
          })
          .onConflictDoUpdate({
            target: userOnboarding.userId,
            set: {
              cliAuthenticated: true,
              updatedAt: new Date(),
            },
          });

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

        logger.info("CLI login tracked", {
          userId,
          cliVersion,
          os,
          arch,
          firstLogin,
        });

        // Parse user name
        const { firstName, lastName } = parseUserName(auth.user.name);

        return NextResponse.json({
          firstName,
          lastName,
          firstLogin,
        });
      } catch (error) {
        logger.error("Failed to track CLI login", {
          userId,
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "cli.user.login" },
          contexts: { user: { id: userId } },
        });

        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    },
  );
}

import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { authenticateApiRequest, createApiCaller } from "@/lib/api-auth";
import type { ObjectiveResult } from "@/types/cli-api";

const { logger } = Sentry;

/**
 * POST /api/cli/challenge/[slug]/submit
 * Submits a challenge with validation results from Kubernetes CRDs
 *
 * Authentication: Requires API token in Authorization header
 * Format: Bearer <token>
 *
 * Request body:
 * {
 *   results: ObjectiveResult[] // Raw results from validation CRDs
 * }
 *
 * Response (success):
 * {
 *   success: true,
 *   xpAwarded: number,
 *   totalXp: number,
 *   rank: string,
 *   rankUp?: boolean,
 *   firstChallenge?: boolean
 * }
 *
 * Response (failure):
 * {
 *   success: false,
 *   message: string
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  // Authenticate the request
  const auth = await authenticateApiRequest(request);

  if (!auth.success || !auth.user || !auth.session) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    // Parse request body
    const body = await request.json();

    const results = body.results as ObjectiveResult[] | undefined;

    // Validate request
    if (!Array.isArray(results)) {
      return NextResponse.json(
        {
          error:
            "Invalid request body. Expected { results: ObjectiveResult[] }",
        },
        { status: 400 },
      );
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "results array cannot be empty" },
        { status: 400 },
      );
    }

    const allPassed = results.every((r) => r.passed);
    logger.info("Challenge submission received", {
      slug,
      allPassed,
      resultsCount: results.length,
      userId: auth.user.id,
    });

    // Create tRPC caller with authenticated context
    const trpc = createApiCaller(auth.user, auth.session);

    // Call the userProgress.submitChallenge procedure
    const result = await trpc.userProgress.submitChallenge({
      challengeSlug: slug,
      results,
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error("Challenge submission failed", {
      slug,
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error, {
      tags: { operation: "cli.challenge.submit" },
      contexts: { challenge: { slug } },
    });
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Challenge not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (message === "Challenge already completed") {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}

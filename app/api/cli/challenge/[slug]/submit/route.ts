import { NextResponse } from "next/server";
import { captureServerException } from "@/lib/analytics-server";
import { authenticateApiRequest, createApiCaller } from "@/lib/api-auth";
import type { ObjectiveResult } from "@/types/cli-api";

/**
 * POST /api/cli/challenge/[slug]/submit
 * Submits a challenge with validation results from Kubernetes CRDs
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

    // Create tRPC caller with authenticated context
    const trpc = createApiCaller(auth.user, auth.session);

    // Call the userProgress.submitChallenge procedure
    const result = await trpc.userProgress.submitChallenge({
      challengeSlug: slug,
      results,
    });

    return NextResponse.json(result);
  } catch (error) {
    captureServerException(error, auth.user.id, {
      operation: "cli.challenge.submit",
      slug,
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

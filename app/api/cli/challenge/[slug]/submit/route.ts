import { NextResponse } from "next/server";
import { captureServerException } from "@/lib/analytics-server";
import { authenticateApiRequest, createApiCaller } from "@/lib/api-auth";
import { challengeSubmitRequestSchema } from "@/schemas/cli-api";

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
    // Parse and validate request body
    const body = await request.json();
    const parsed = challengeSubmitRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error:
            "Invalid request body. Expected { results: ObjectiveResult[] }",
          details: parsed.error.message,
        },
        { status: 400 },
      );
    }

    const { results } = parsed.data;

    // Create tRPC caller with authenticated context
    const trpc = createApiCaller(auth.user, auth.session);

    // Call the userProgress.submitChallenge procedure
    const result = await trpc.userProgress.submitChallenge({
      challengeSlug: slug,
      results,
    });

    return NextResponse.json(result);
  } catch (error) {
    await captureServerException(error, auth.user.id, {
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
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

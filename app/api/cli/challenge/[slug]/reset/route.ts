import { NextResponse } from "next/server";
import { authenticateApiRequest, createApiCaller } from "@/lib/api-auth";

/**
 * POST /api/cli/challenge/[slug]/reset
 * Resets the progress of a challenge for the authenticated user
 *
 * Authentication: Requires API token in Authorization header
 * Format: Bearer <token>
 *
 * Response:
 * {
 *   success: boolean,
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
    // Create tRPC caller with authenticated context
    const trpc = createApiCaller(auth.user, auth.session);

    // Call the userProgress.resetChallenge procedure
    const result = await trpc.userProgress.resetChallenge({
      challengeSlug: slug,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "Challenge not found") {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}

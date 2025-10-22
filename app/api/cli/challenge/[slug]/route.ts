import { NextResponse } from "next/server";
import { authenticateApiRequest, createApiCaller } from "@/lib/api-auth";

/**
 * GET /api/cli/challenge/[slug]
 * Returns the details of a challenge
 *
 * Authentication: Requires API token in Authorization header
 * Format: Bearer <token>
 *
 * Response:
 * {
 *   id: string,
 *   title: string,
 *   slug: string,
 *   description: string,
 *   difficulty: string,
 *   theme: string,
 *   initialSituation: string,
 *   objective: string
 * }
 */
export async function GET(
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

    // Call the challenge.getBySlug procedure
    const result = await trpc.challenge.getBySlug({
      slug,
    });

    if (!result.challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 },
      );
    }

    // Return challenge details in the format expected by the CLI
    return NextResponse.json({
      id: result.challenge.id,
      title: result.challenge.title,
      slug: result.challenge.slug,
      description: result.challenge.description,
      difficulty: result.challenge.difficulty,
      theme: result.challenge.themeSlug,
      initial_situation: result.challenge.initialSituation,
      objective: result.challenge.objective,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Internal server error", details: message },
      { status: 500 },
    );
  }
}

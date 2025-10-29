import { NextResponse } from "next/server";
import { authenticateApiRequest, createApiCaller } from "@/lib/api-auth";

/**
 * POST /api/cli/challenge/[slug]/submit
 * Submits a challenge with validation result from Kubernetes operator
 *
 * Authentication: Requires API token in Authorization header
 * Format: Bearer <token>
 *
 * Request body:
 * {
 *   validated: boolean // Result from Kubernetes operator validation (required)
 *   static_validation?: boolean // Static validation result (optional)
 *   dynamic_validation?: boolean // Dynamic validation result (optional)
 *   payload?: any // Additional validation details (optional)
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
    const {
      validated,
      static_validation: staticValidation,
      dynamic_validation: dynamicValidation,
      payload,
    } = body;

    // Debug logging
    console.log("[SUBMIT DEBUG]", {
      slug,
      validated,
      staticValidation,
      dynamicValidation,
      hasPayload: !!payload,
      payloadKeys: payload ? Object.keys(payload) : [],
      userId: auth.user.id,
    });

    if (typeof validated !== "boolean") {
      return NextResponse.json(
        {
          error:
            "Invalid request body. Expected { validated: boolean, static_validation?: boolean, dynamic_validation?: boolean, payload?: any }",
        },
        { status: 400 },
      );
    }

    // Create tRPC caller with authenticated context
    const trpc = createApiCaller(auth.user, auth.session);

    // Call the userProgress.submitChallenge procedure
    const result = await trpc.userProgress.submitChallenge({
      challengeSlug: slug,
      validated,
      staticValidation,
      dynamicValidation,
      payload,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SUBMIT ERROR]", {
      slug,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
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

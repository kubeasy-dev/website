import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/api-auth";

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
  // Authenticate the request
  const auth = await authenticateApiRequest(request);

  if (!auth.success || !auth.user) {
    return NextResponse.json(
      { error: auth.error || "Unauthorized" },
      { status: 401 },
    );
  }

  // Parse the user's name
  const fullName = auth.user.name || "";
  const nameParts = fullName.trim().split(" ");

  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : null;

  return NextResponse.json({
    firstName,
    lastName,
  });
}

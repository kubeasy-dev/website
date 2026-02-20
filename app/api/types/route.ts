import { NextResponse } from "next/server";
import { captureServerException } from "@/lib/analytics-server";
import { getTypes } from "@/server/db/queries";

/**
 * GET /api/cli/types
 * Returns all available challenge types.
 * Public endpoint — no authentication required.
 */
export async function GET() {
  try {
    const types = await getTypes();

    return NextResponse.json({
      types: types.map((t) => ({
        slug: t.slug,
        name: t.name,
        description: t.description,
        logo: t.logo,
      })),
    });
  } catch (error) {
    await captureServerException(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

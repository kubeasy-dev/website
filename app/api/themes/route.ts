import { NextResponse } from "next/server";
import { captureServerException } from "@/lib/analytics-server";
import { getThemes } from "@/server/db/queries";

/**
 * GET /api/cli/themes
 * Returns all available challenge themes.
 * Public endpoint — no authentication required.
 */
export async function GET() {
  try {
    const themes = await getThemes();

    return NextResponse.json({
      themes: themes.map((t) => ({
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

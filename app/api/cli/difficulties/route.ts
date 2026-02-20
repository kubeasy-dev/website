import { NextResponse } from "next/server";
import { challengeDifficultyEnum } from "@/server/db/schema/challenge";

/**
 * GET /api/cli/difficulties
 * Returns all available difficulty levels.
 * Public endpoint — no authentication required.
 */
export async function GET() {
  return NextResponse.json({
    difficulties: challengeDifficultyEnum.enumValues,
  });
}

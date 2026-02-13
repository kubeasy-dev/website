import { NextResponse } from "next/server";
import { captureServerException } from "@/lib/analytics-server";
import { isRedisConfigured } from "@/lib/redis";
import {
  createDemoSession,
  getDemoSession,
  isValidDemoToken,
} from "@/server/demo-session";

/**
 * POST /api/demo/session
 * Creates a new demo session (stored in Redis, tracked in PostHog)
 */
export async function POST() {
  if (!isRedisConfigured) {
    return NextResponse.json(
      { error: "Demo mode not available" },
      { status: 503 },
    );
  }

  try {
    const session = await createDemoSession();

    if (!session) {
      return NextResponse.json(
        { error: "Failed to create demo session" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      token: session.token,
    });
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "demo.session.create",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/demo/session?token=xxx
 * Gets the status of a demo session
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  if (!isValidDemoToken(token)) {
    return NextResponse.json(
      { error: "Invalid token format" },
      { status: 400 },
    );
  }

  if (!isRedisConfigured) {
    return NextResponse.json(
      { error: "Demo mode not available" },
      { status: 503 },
    );
  }

  try {
    const session = await getDemoSession(token);

    if (!session) {
      return NextResponse.json({
        valid: false,
      });
    }

    return NextResponse.json({
      valid: true,
      completedAt: session.completedAt,
    });
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "demo.session.status",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

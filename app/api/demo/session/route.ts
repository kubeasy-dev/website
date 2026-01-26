import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { trackDemoCreatedServer } from "@/lib/analytics-server";
import {
  createDemoSession,
  getDemoSession,
  isValidDemoToken,
} from "@/lib/demo-session";
import { isRedisConfigured } from "@/lib/redis";

const { logger } = Sentry;

/**
 * POST /api/demo/session
 * Creates a new demo session (stored in Redis, tracked in PostHog)
 */
export async function POST() {
  if (!isRedisConfigured) {
    logger.warn("Demo session creation failed: Redis not configured");
    return NextResponse.json(
      { error: "Demo mode not available" },
      { status: 503 },
    );
  }

  try {
    const session = await createDemoSession();

    if (!session) {
      logger.error("Failed to create demo session");
      return NextResponse.json(
        { error: "Failed to create demo session" },
        { status: 500 },
      );
    }

    logger.info("Demo session created", { token: session.token });
    await trackDemoCreatedServer(session.token);

    return NextResponse.json({
      token: session.token,
      createdAt: session.createdAt,
    });
  } catch (error) {
    logger.error("Demo session creation error", {
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error, {
      tags: { operation: "demo.session.create" },
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
 *
 * Response:
 * {
 *   valid: boolean;
 *   createdAt?: number;
 *   completedAt?: number;
 * }
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
      createdAt: session.createdAt,
      completedAt: session.completedAt,
    });
  } catch (error) {
    logger.error("Demo session status error", {
      token,
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error, {
      tags: { operation: "demo.session.status" },
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

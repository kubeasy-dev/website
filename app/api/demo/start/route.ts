import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";
import { getDemoSession, isValidDemoToken } from "@/lib/demo-session";
import { isRealtimeConfigured, realtime } from "@/lib/realtime";
import { isRedisConfigured } from "@/lib/redis";

const { logger } = Sentry;

/**
 * POST /api/demo/start
 * Called by the CLI when `kubeasy demo start` completes successfully
 *
 * Request body:
 * {
 *   token: string;
 * }
 *
 * Response:
 * {
 *   success: boolean;
 * }
 */
export async function POST(request: Request) {
  if (!isRedisConfigured) {
    return NextResponse.json(
      { error: "Demo mode not available" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const { token } = body as { token?: string };

    // Validate token
    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    if (!isValidDemoToken(token)) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 },
      );
    }

    // Verify demo session exists
    const session = await getDemoSession(token);
    if (!session) {
      return NextResponse.json(
        { error: "Invalid or expired demo token" },
        { status: 401 },
      );
    }

    logger.info("Demo started", { token });

    // Broadcast demo.started event via Upstash Realtime
    if (isRealtimeConfigured && realtime) {
      const channel = realtime.channel(`demo:${token}`);
      await channel.emit("demo.started", {
        timestamp: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Demo start error", {
      error: error instanceof Error ? error.message : String(error),
    });
    Sentry.captureException(error, {
      tags: { operation: "demo.start" },
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

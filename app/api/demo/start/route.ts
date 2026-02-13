import { NextResponse } from "next/server";
import { captureServerException } from "@/lib/analytics-server";
import { isRealtimeConfigured, realtime } from "@/lib/realtime";
import { isRedisConfigured } from "@/lib/redis";
import { getDemoSession, isValidDemoToken } from "@/server/demo-session";

/**
 * POST /api/demo/start
 * Called by the CLI when `kubeasy demo start` completes successfully
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

    // Broadcast demo.started event via Upstash Realtime
    if (isRealtimeConfigured && realtime) {
      const channel = realtime.channel(`demo:${token}`);
      await channel.emit("demo.started", {
        timestamp: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "demo.start",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

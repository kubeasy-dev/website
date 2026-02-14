import { NextResponse } from "next/server";
import { captureServerException } from "@/lib/analytics-server";
import { isRealtimeConfigured, realtime } from "@/lib/realtime";
import { isRedisConfigured } from "@/lib/redis";
import {
  getDemoSession,
  isValidDemoToken,
  markDemoCompleted,
} from "@/server/demo-session";
import type { ObjectiveResult } from "@/types/cli-api";

/**
 * Demo challenge objectives (hardcoded - no DB lookup)
 * The demo challenge is simple: create an nginx pod in the demo namespace
 */
const DEMO_OBJECTIVES = [
  {
    objectiveKey: "nginx-running",
    title: "Pod nginx is Running",
    description: "The nginx pod must be running in the demo namespace",
    category: "status" as const,
  },
];

/**
 * POST /api/demo/submit
 * Submits demo validation results
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
    const { token, results } = body as {
      token?: string;
      results?: ObjectiveResult[];
    };

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

    // Validate results
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Results array required" },
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

    // Validate that all expected objectives are present
    const expectedKeys = new Set(DEMO_OBJECTIVES.map((o) => o.objectiveKey));
    const submittedKeys = new Set(results.map((r) => r.objectiveKey));

    // Check for missing objectives
    const missingKeys = [...expectedKeys].filter(
      (key) => !submittedKeys.has(key),
    );
    if (missingKeys.length > 0) {
      return NextResponse.json(
        { error: `Missing required objectives: ${missingKeys.join(", ")}` },
        { status: 400 },
      );
    }

    // Check for unknown objectives
    const unknownKeys = [...submittedKeys].filter(
      (key) => !expectedKeys.has(key),
    );
    if (unknownKeys.length > 0) {
      return NextResponse.json(
        { error: `Unknown objectives submitted: ${unknownKeys.join(", ")}` },
        { status: 400 },
      );
    }

    // Determine if all objectives passed
    const validated = results.every((r) => r.passed);

    // Broadcast validation updates via Upstash Realtime
    if (isRealtimeConfigured && realtime) {
      const channel = realtime.channel(`demo:${token}`);
      for (const result of results) {
        await channel.emit("validation.update", {
          objectiveKey: result.objectiveKey,
          passed: result.passed,
          timestamp: new Date(),
        });
      }
    }

    // Mark demo as completed if validation passed
    if (validated) {
      await markDemoCompleted(token);
    }

    return NextResponse.json({
      success: validated,
      message: validated
        ? "Congratulations! You completed the demo challenge."
        : "Validation failed. Make sure the nginx pod is running in the demo namespace.",
    });
  } catch (error) {
    await captureServerException(error, undefined, {
      operation: "demo.submit",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

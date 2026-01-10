import { handle } from "@upstash/realtime";
import { NextResponse } from "next/server";
import { isRealtimeConfigured, realtime } from "@/lib/realtime";

/**
 * Realtime SSE endpoint for challenge validation updates
 *
 * This route handles Server-Sent Events (SSE) connections for real-time
 * validation updates using Upstash Realtime.
 *
 * Route: GET /api/realtime
 */
export const GET =
  isRealtimeConfigured && realtime
    ? handle({ realtime })
    : (_request: Request) =>
        NextResponse.json(
          { error: "Realtime not configured" },
          { status: 503 },
        );

/**
 * Maximum duration for SSE connections (5 minutes)
 * SSE connections are long-lived by design, so we need a higher timeout
 * than the default 60s Vercel serverless function timeout.
 * Requires Vercel Pro or Enterprise plan for durations > 60s.
 */
export const maxDuration = 300;

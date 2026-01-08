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

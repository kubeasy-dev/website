import { handle } from "@upstash/realtime";
import { realtime } from "@/lib/realtime";

/**
 * Realtime SSE endpoint for challenge validation updates
 *
 * This route handles Server-Sent Events (SSE) connections for real-time
 * validation updates using Upstash Realtime.
 *
 * Route: GET /api/realtime
 */
export const GET = handle({ realtime });

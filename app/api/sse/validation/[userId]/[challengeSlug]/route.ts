import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

/**
 * Server-Sent Events (SSE) endpoint for real-time validation updates
 *
 * This route subscribes to Redis Pub/Sub for a specific user+challenge
 * and streams validation events to the client using SSE.
 *
 * Route: /api/sse/validation/[userId]/[challengeSlug]
 *
 * Usage:
 * const eventSource = new EventSource('/api/sse/validation/user123/my-challenge');
 * eventSource.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   // { objectiveKey: string, passed: boolean, timestamp: string }
 * };
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; challengeSlug: string }> },
) {
  const { userId, challengeSlug } = await params;
  const channel = `validation:${userId}:${challengeSlug}`;

  // Create SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      // Initialize Redis client
      const redis = Redis.fromEnv();

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected" })}\n\n`),
      );

      // Subscribe to Redis channel
      // Note: Upstash Redis HTTP API doesn't support BLPOP (blocking operations)
      // We use a polling approach with LPOP on a list instead
      const listKey = `events:${channel}`;

      // Poll for events (Upstash limitation: no native SUBSCRIBE or BLPOP over HTTP)
      const pollInterval = setInterval(async () => {
        try {
          // LPOP to get and remove the oldest event from the list
          const payload = await redis.lpop<string>(listKey);

          if (payload) {
            controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
          }
        } catch (error) {
          console.error("Error polling Redis:", error);
        }
      }, 1000);

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        clearInterval(pollInterval);
        controller.close();
      });

      // Keep-alive ping every 30 seconds
      const keepAliveInterval = setInterval(() => {
        controller.enqueue(encoder.encode(`: keep-alive\n\n`));
      }, 30000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAliveInterval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

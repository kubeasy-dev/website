"use client";

import { createRealtime } from "@upstash/realtime/client";
import type { RealtimeEvents } from "./realtime";

/**
 * Typed useRealtime hook for client components
 *
 * Usage:
 * ```tsx
 * const { status } = useRealtime({
 *   channels: [`${userId}:${challengeSlug}`],
 *   events: ["validation.update"],
 *   onData({ data }) {
 *     // Handle validation update
 *   }
 * })
 * ```
 */
export const { useRealtime } = createRealtime<RealtimeEvents>();

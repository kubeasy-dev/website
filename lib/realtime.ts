import { type InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { z } from "zod";
import { redis } from "./redis";

/**
 * Realtime event schema for challenge validation updates
 *
 * Events:
 * - validation.update: Emitted when a challenge objective is validated
 */
const schema = {
  validation: {
    update: z.object({
      objectiveKey: z.string(),
      passed: z.boolean(),
      timestamp: z.date(),
    }),
  },
};

// Realtime requires Redis - only create if Redis is configured
export const realtime = redis ? new Realtime({ schema, redis }) : null;
export type RealtimeEvents =
  typeof realtime extends Realtime<infer T>
    ? InferRealtimeEvents<Realtime<T>>
    : never;

/**
 * Check if realtime is available
 */
export const isRealtimeConfigured = realtime !== null;

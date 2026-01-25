import { type InferRealtimeEvents, Realtime } from "@upstash/realtime";
import { z } from "zod";
import { redis } from "./redis";

/**
 * Realtime event schema for challenge validation updates
 *
 * Events:
 * - validation.update: Emitted when a challenge objective is validated
 * - demo.started: Emitted when CLI starts the demo (kubeasy demo start)
 * - demo.pod_created: Emitted when the pod is detected (future use)
 */
const schema = {
  validation: {
    update: z.object({
      objectiveKey: z.string(),
      passed: z.boolean(),
      timestamp: z.date(),
    }),
  },
  demo: {
    started: z.object({
      timestamp: z.date(),
    }),
    pod_created: z.object({
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

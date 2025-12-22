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

export const realtime = new Realtime({ schema, redis });
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>;

import "zod-openapi";
import { z } from "zod";

// ---------- Shared ----------

export const errorResponseSchema = z
  .object({
    error: z.string(),
    details: z.string().optional(),
  })
  .meta({ description: "Standard error response" });

export const cliMetadataSchema = z
  .object({
    cliVersion: z.string(),
    os: z.string(),
    arch: z.string(),
  })
  .meta({ description: "CLI metadata sent with tracking requests" });

export const slugParamSchema = z.object({
  slug: z
    .string()
    .meta({ description: "Challenge slug", example: "pod-evicted" }),
});

// ---------- User ----------

export const userResponseSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string().nullable(),
  })
  .meta({ description: "User profile information" });

export const userLoginResponseSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string().nullable(),
    firstLogin: z.boolean(),
  })
  .meta({ description: "User login response with first-login flag" });

// ---------- Challenge ----------

export const challengeResponseSchema = z
  .object({
    id: z.number().int(),
    title: z.string(),
    slug: z.string(),
    description: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
    theme: z.string(),
    initial_situation: z.string(),
    objective: z.string(),
  })
  .meta({ description: "Challenge details" });

export const challengeStartResponseSchema = z
  .object({
    status: z.enum(["in_progress", "completed"]),
    startedAt: z.string().meta({ description: "ISO 8601 date string" }),
    message: z.string().optional(),
  })
  .meta({ description: "Challenge start response" });

export const challengeStatusResponseSchema = z
  .object({
    status: z.enum(["not_started", "in_progress", "completed"]),
    startedAt: z
      .string()
      .optional()
      .meta({ description: "ISO 8601 date string" }),
    completedAt: z
      .string()
      .optional()
      .meta({ description: "ISO 8601 date string" }),
  })
  .meta({ description: "Challenge progress status" });

// ---------- Submit ----------

export const objectiveCategorySchema = z.enum([
  "status",
  "log",
  "event",
  "metrics",
  "rbac",
  "connectivity",
]);

export const objectiveResultSchema = z
  .object({
    objectiveKey: z
      .string()
      .meta({ description: "Validation key (e.g. pod-ready-check)" }),
    passed: z.boolean(),
    message: z.string().optional(),
  })
  .meta({ description: "Result from a single validation" });

export const objectiveSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    passed: z.boolean(),
    category: objectiveCategorySchema,
    message: z.string().optional(),
  })
  .meta({ description: "Enriched objective with metadata" });

export const challengeSubmitRequestSchema = z
  .object({
    results: z.array(objectiveResultSchema).min(1),
  })
  .meta({ description: "Challenge submission payload" });

export const challengeSubmitSuccessResponseSchema = z
  .object({
    success: z.literal(true),
    xpAwarded: z.number(),
    totalXp: z.number(),
    rank: z.string(),
    rankUp: z.boolean().optional(),
    firstChallenge: z.boolean().optional(),
  })
  .meta({ description: "Successful challenge submission" });

export const challengeSubmitFailureResponseSchema = z
  .object({
    success: z.literal(false),
    message: z.string(),
  })
  .meta({ description: "Failed challenge submission" });

export const challengeSubmitResponseSchema = z
  .union([
    challengeSubmitSuccessResponseSchema,
    challengeSubmitFailureResponseSchema,
  ])
  .meta({ description: "Challenge submission response" });

// ---------- Reset ----------

export const challengeResetResponseSchema = z
  .object({
    success: z.boolean(),
    message: z.string(),
  })
  .meta({ description: "Challenge reset response" });

// ---------- Track Setup ----------

export const trackSetupResponseSchema = z
  .object({
    success: z.boolean(),
    firstTime: z.boolean(),
  })
  .meta({ description: "Track setup response" });

// ⚠️ AUTO-GENERATED - DO NOT EDIT
// Source: github.com/kubeasy-dev/kubeasy-cli/pkg/validation
// Run: go run hack/generate-schema/main.go > path/to/challengeObjectives.ts

import { z } from "zod";

export const TargetSchema = z.object({
  kind: z.string(),
  name: z.string().optional(),
  labelSelector: z.record(z.string(), z.string()).optional(),
})
export type Target = z.infer<typeof TargetSchema>

export const StatusConditionSchema = z.object({
  type: z.string(),
  status: z.string(),
})
export type StatusCondition = z.infer<typeof StatusConditionSchema>

export const StatusSpecSchema = z.object({
  target: TargetSchema,
  conditions: StatusConditionSchema.array().nullable(),
})
export type StatusSpec = z.infer<typeof StatusSpecSchema>

export const LogSpecSchema = z.object({
  target: TargetSchema,
  container: z.string().optional(),
  expectedStrings: z.string().array().nullable(),
  sinceSeconds: z.number().optional(),
})
export type LogSpec = z.infer<typeof LogSpecSchema>

export const EventSpecSchema = z.object({
  target: TargetSchema,
  forbiddenReasons: z.string().array().nullable(),
  sinceSeconds: z.number().optional(),
})
export type EventSpec = z.infer<typeof EventSpecSchema>

export const MetricCheckSchema = z.object({
  field: z.string(),
  operator: z.string(),
  value: z.number(),
})
export type MetricCheck = z.infer<typeof MetricCheckSchema>

export const MetricsSpecSchema = z.object({
  target: TargetSchema,
  checks: MetricCheckSchema.array().nullable(),
})
export type MetricsSpec = z.infer<typeof MetricsSpecSchema>

export const SourcePodSchema = z.object({
  name: z.string().optional(),
  labelSelector: z.record(z.string(), z.string()).optional(),
})
export type SourcePod = z.infer<typeof SourcePodSchema>

export const ConnectivityCheckSchema = z.object({
  url: z.string(),
  expectedStatusCode: z.number(),
  timeoutSeconds: z.number().optional(),
})
export type ConnectivityCheck = z.infer<typeof ConnectivityCheckSchema>

export const ConnectivitySpecSchema = z.object({
  sourcePod: SourcePodSchema,
  targets: ConnectivityCheckSchema.array().nullable(),
})
export type ConnectivitySpec = z.infer<typeof ConnectivitySpecSchema>

export const ObjectiveTypeSchema = z.enum([
  "status",
  "log",
  "event",
  "metrics",
  "connectivity",
]);
export type ObjectiveType = z.infer<typeof ObjectiveTypeSchema>;

export const ObjectiveSpecSchema = z.union([
  StatusSpecSchema,
  LogSpecSchema,
  EventSpecSchema,
  MetricsSpecSchema,
  ConnectivitySpecSchema,
]);
export type ObjectiveSpec = z.infer<typeof ObjectiveSpecSchema>;

export const ObjectiveSchema = z.object({
  key: z.string(),
  title: z.string(),
  description: z.string(),
  order: z.number().int(),
  type: ObjectiveTypeSchema,
  spec: ObjectiveSpecSchema,
});
export type Objective = z.infer<typeof ObjectiveSchema>;

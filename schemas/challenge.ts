import { z } from "zod";
import { ObjectiveSchema } from "./challengeObjectives";

const semanticVersionSchema = z
  .string()
  .regex(
    /^(\d+\.)?(\d+\.)?(\*|\d+)$/,
    "Invalid semantic version format (e.g., 1.0.0)",
  );

// Schema du fichier challenge.yaml
export const challengeYamlSchema = z.object({
  title: z.string().min(1).describe("Challenge title"),
  description: z
    .string()
    .min(1)
    .describe("Brief description of symptoms (NOT the cause)"),
  minRequiredVersion: semanticVersionSchema
    .describe("Minimum required version of the CLI")
    .default("2.0.0"),
  theme: z
    .string()
    .min(1)
    .describe("Category slug (networking, storage, etc.)"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z
    .string()
    .default("fix")
    .describe("Challenge type (fix, build, migrate)"),
  estimatedTime: z
    .number()
    .int()
    .positive()
    .describe("Estimated time in minutes"),
  initialSituation: z.string().min(1).describe("What user finds when starting"),
  objectives: z
    .array(ObjectiveSchema)
    .default([])
    .describe("List of objectives to validate"),
});

export type ChallengeYaml = z.infer<typeof challengeYamlSchema>;

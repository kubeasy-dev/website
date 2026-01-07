import { z } from "zod";
import { ObjectiveSchema } from "./challengeObjectives";

// Schema du fichier challenge.yaml
export const challengeYamlSchema = z.object({
  title: z.string().min(1).describe("Challenge title"),
  description: z
    .string()
    .min(1)
    .describe("Brief description of symptoms (NOT the cause)"),
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
  objective: z.string().min(1).describe("What needs to be achieved (NOT how)"),
  ofTheWeek: z.boolean().default(false),
  starterFriendly: z.boolean().default(false),
  objectives: z
    .array(ObjectiveSchema)
    .default([])
    .describe("List of objectives to validate"),
});

export type ChallengeYaml = z.infer<typeof challengeYamlSchema>;

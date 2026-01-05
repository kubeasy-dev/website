import { z } from "zod";
import { challengeDifficultyEnum } from "@/server/db/schema";

const challengeDifficulties = challengeDifficultyEnum.enumValues;

export type ChallengeDifficulty = (typeof challengeDifficulties)[number];
export type ChallengeType = string;

export const challengeFiltersSchema = z.object({
  difficulty: z.enum(challengeDifficulties).optional(),
  type: z.string().optional(),
  theme: z.string().optional(),
  showCompleted: z.boolean().default(true).optional(),
  search: z.string().optional(),
});

export type ChallengeFilters = z.infer<typeof challengeFiltersSchema>;

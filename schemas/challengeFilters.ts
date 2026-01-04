import { z } from "zod";
import { challengeDifficultyEnum, challengeTypeEnum } from "@/server/db/schema";

const challengeDifficulties = challengeDifficultyEnum.enumValues;
const challengeTypes = challengeTypeEnum.enumValues;

export type ChallengeDifficulty = (typeof challengeDifficulties)[number];
export type ChallengeType = (typeof challengeTypes)[number];

export const challengeFiltersSchema = z.object({
  difficulty: z.enum(challengeDifficulties).optional(),
  type: z.enum(challengeTypes).optional(),
  theme: z.string().optional(),
  showCompleted: z.boolean().default(true).optional(),
  search: z.string().optional(),
});

export type ChallengeFilters = z.infer<typeof challengeFiltersSchema>;

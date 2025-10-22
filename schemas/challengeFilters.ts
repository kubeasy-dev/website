import { z } from "zod";
import {
  challengeDifficultyEnum,
  challengeStatusEnum,
} from "@/server/db/schema";

export const challengeDifficulties = challengeDifficultyEnum.enumValues;

export type ChallengeDifficulty = (typeof challengeDifficulties)[number];

export const challengeFiltersSchema = z.object({
  difficulty: z.enum(challengeDifficulties).optional(),
  theme: z.string().optional(),
  showCompleted: z.boolean().default(true).optional(),
  search: z.string().optional(),
});

export type ChallengeFilters = z.infer<typeof challengeFiltersSchema>;

export const progressStatuses = challengeStatusEnum.enumValues;

export type ChallengeStatus = (typeof progressStatuses)[number];

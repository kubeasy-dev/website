import { Database } from "@/lib/database.types";

export type Challenge = Database["public"]["Tables"]["challenges"]["Row"]

export type ChallengeExtended = Challenge & {
  achieved: boolean
}

export type ChallengesFilters = {
  searchTerm?: string;
  showAchieved?: boolean;
  difficulty?: DifficultyLevel;
};

export type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"]

export type UserStats = Database["public"]["Tables"]["user_stats"]["Row"]

export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"]
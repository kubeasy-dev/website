import { Database } from "@/lib/database.types";

export type ChallengesFilters = {
  searchTerm?: string;
  showAchieved?: boolean;
  difficulty?: DifficultyLevel;
};

export type TableName = keyof Database["public"]["Tables"];

export type Challenge = Database["public"]["Tables"]["challenges"]["Row"];

export type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];

export type UserStats = Database["public"]["Tables"]["user_stats"]["Row"];

export type UserProgress = Database["public"]["Tables"]["user_progress"]["Row"];

export type UserProgressStatus = Database["public"]["Enums"]["challenge_status"];

export type ChallengeProgress = Database["public"]["Views"]["challenge_progress"]["Row"];

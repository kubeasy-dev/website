import { Database } from "@/lib/database.types";

export type MakeAllRequiredExcept<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]-?: NonNullable<T[P]>;
} & {
  [P in K]: T[P];
};

type Tables = Database["public"]["Tables"];
type Enums = Database["public"]["Enums"];

export type TableName = keyof Tables;
type TableRow<T extends TableName> = Tables[T]["Row"];

type Views = Database["public"]["Views"];
type ViewRow<T extends keyof Views> = Views[T]["Row"];

export type Challenge = TableRow<"challenges">;

export type Theme = TableRow<"themes">;

export type UserProgress = TableRow<"user_progress">;

export type ApiToken = TableRow<"api_tokens">;

export type ChallengeProgress = ViewRow<"challenge_progress">;

export type UserProgressStatus = Enums["challenge_status"];

export type DifficultyLevel = Enums["difficulty_level"];

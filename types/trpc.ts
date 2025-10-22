import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";

/**
 * Type inference helpers for tRPC router
 * These types ensure type safety across the application when working with tRPC data
 */
type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

// ============================================
// CHALLENGE TYPES
// ============================================

/**
 * Single challenge from the list
 */
export type Challenge =
  RouterOutputs["challenge"]["list"]["challenges"][number];

/**
 * Challenge list response
 */
export type ChallengeListResponse = RouterOutputs["challenge"]["list"];

/**
 * Challenge detail response
 */
export type ChallengeDetail =
  RouterOutputs["challenge"]["getBySlug"]["challenge"];

/**
 * Challenge filters input
 */
export type ChallengeFilters = RouterInputs["challenge"]["list"];

/**
 * Challenge difficulty levels
 */
export type ChallengeDifficulty = Challenge["difficulty"];

/**
 * Challenge status for a user
 */
export type ChallengeStatus = Challenge["userStatus"];

// ============================================
// THEME TYPES
// ============================================

/**
 * Single theme from the list
 */
export type Theme = RouterOutputs["theme"]["list"][number];

/**
 * Theme detail response
 */
export type ThemeDetail = RouterOutputs["theme"]["get"];

// ============================================
// USER PROGRESS TYPES
// ============================================

/**
 * Completion percentage response (standard mode)
 */
export type CompletionPercentage =
  RouterOutputs["userProgress"]["getCompletionPercentage"];

/**
 * Completion percentage response (split by theme mode)
 */
export type CompletionPercentageByTheme = Extract<
  RouterOutputs["userProgress"]["getCompletionPercentage"],
  { byTheme: unknown }
>;

/**
 * Single theme completion stats
 */
export type ThemeCompletion = CompletionPercentageByTheme["byTheme"][number];

/**
 * User XP and rank response
 */
export type UserXpAndRank = RouterOutputs["userProgress"]["getXpAndRank"];

/**
 * User rank name
 */
export type UserRank = UserXpAndRank["rank"];

/**
 * User streak response
 */
export type UserStreak = RouterOutputs["userProgress"]["getStreak"];

/**
 * Complete challenge input
 */
export type CompleteChallengeInput =
  RouterInputs["userProgress"]["completeChallenge"];

/**
 * Complete challenge response
 */
export type CompleteChallengeResponse =
  RouterOutputs["userProgress"]["completeChallenge"];

// ============================================
// XP TRANSACTION TYPES
// ============================================

/**
 * Single XP transaction
 */
export type XpTransaction =
  RouterOutputs["xpTransaction"]["getRecentGains"][number];

/**
 * XP action types
 */
export type XpAction = XpTransaction["action"];

// ============================================
// INPUT TYPES (for forms and mutations)
// ============================================

export type { RouterInputs, RouterOutputs };

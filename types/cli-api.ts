/**
 * CLI API Response Types
 * These types define the structure of API responses for the kubeasy CLI.
 * Use these as reference when implementing API calls in the Go CLI.
 */

/**
 * GET /api/cli/user
 * Returns the authenticated user's profile information
 */
export interface UserResponse {
  firstName: string;
  lastName?: string;
}

/**
 * GET /api/cli/challenge/[slug]
 * Returns the details of a specific challenge
 */
export interface ChallengeResponse {
  id: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  theme: string;
  initial_situation: string;
  objective: string;
}

/**
 * GET /api/cli/challenge/[slug]/status
 * Returns the user's progress status for a specific challenge
 */
export interface ChallengeStatusResponse {
  status: "not_started" | "in_progress" | "completed";
  startedAt?: string; // ISO 8601 date string
  completedAt?: string; // ISO 8601 date string
}

/**
 * POST /api/cli/challenge/[slug]/start
 * Starts a challenge for the user
 */
export type ChallengeStartRequest = {};

export interface ChallengeStartResponse {
  status: "in_progress" | "completed";
  startedAt: string; // ISO 8601 date string
  message?: string;
}

/**
 * POST /api/cli/challenge/[slug]/submit
 * Submits a challenge with validation results
 */
export interface ChallengeSubmitRequest {
  validated: boolean; // Overall validation result (required)
  static_validation?: boolean; // Static validation result (optional)
  dynamic_validation?: boolean; // Dynamic validation result (optional)
  payload?: unknown; // Additional validation details (optional)
}

export interface ChallengeSubmitSuccessResponse {
  success: true;
  xpAwarded: number;
  totalXp: number;
  rank: string;
  rankUp?: boolean;
  firstChallenge?: boolean;
}

export interface ChallengeSubmitFailureResponse {
  success: false;
  message: string;
}

export type ChallengeSubmitResponse =
  | ChallengeSubmitSuccessResponse
  | ChallengeSubmitFailureResponse;

/**
 * POST /api/cli/challenge/[slug]/reset
 * Resets the user's progress for a specific challenge
 */
export type ChallengeResetRequest = {};

export interface ChallengeResetResponse {
  success: boolean;
  message: string;
}

/**
 * Error Response
 * Standard error response format for all CLI API endpoints
 */
export interface ErrorResponse {
  error: string;
  details?: string;
}

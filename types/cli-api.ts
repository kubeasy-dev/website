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
export type ChallengeStartRequest = Record<string, never>;

export interface ChallengeStartResponse {
  status: "in_progress" | "completed";
  startedAt: string; // ISO 8601 date string
  message?: string;
}

/**
 * Objective Categories
 * Each category maps to a validation CRD type in the operator
 */
export type ObjectiveCategory =
  | "status" // StatusValidation - Pod Ready, Deployment Available, etc.
  | "log" // LogValidation - Container logs contain expected strings
  | "event" // EventValidation - No forbidden events (OOM, BackOff, etc.)
  | "metrics" // MetricsValidation - Restart count, replicas, etc.
  | "rbac" // RBACValidation - ServiceAccount permissions
  | "connectivity"; // ConnectivityValidation - Network reachability

/**
 * ObjectiveResult
 * Result from a single validation CRD (sent by CLI)
 */
export interface ObjectiveResult {
  objectiveKey: string; // CRD metadata.name (e.g., "pod-ready-check")
  passed: boolean; // CRD status.allPassed
  message?: string; // CRD status message or error
}

/**
 * Objective
 * Full objective with metadata (used by frontend, enriched from DB)
 */
export interface Objective {
  id: string; // objectiveKey
  name: string; // title from challengeObjective table
  description?: string; // description from challengeObjective table
  passed: boolean; // Validation result
  category: ObjectiveCategory; // category from challengeObjective table
  message?: string; // Result message
}

/**
 * POST /api/cli/challenge/[slug]/submit
 * Submits a challenge with validation results from CRDs
 */
export interface ChallengeSubmitRequest {
  results: ObjectiveResult[]; // Raw results from validation CRDs
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
export type ChallengeResetRequest = Record<string, never>;

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

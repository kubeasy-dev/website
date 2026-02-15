import type { z } from "zod";
import type {
  challengeResetResponseSchema,
  challengeResponseSchema,
  challengeStartResponseSchema,
  challengeStatusResponseSchema,
  challengeSubmitFailureResponseSchema,
  challengeSubmitRequestSchema,
  challengeSubmitResponseSchema,
  challengeSubmitSuccessResponseSchema,
  errorResponseSchema,
  objectiveCategorySchema,
  objectiveResultSchema,
  objectiveSchema,
  userLoginResponseSchema,
  userResponseSchema,
} from "@/schemas/cli-api";

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserLoginResponse = z.infer<typeof userLoginResponseSchema>;

export type ChallengeResponse = z.infer<typeof challengeResponseSchema>;
export type ChallengeStartResponse = z.infer<
  typeof challengeStartResponseSchema
>;
export type ChallengeStatusResponse = z.infer<
  typeof challengeStatusResponseSchema
>;

export type ObjectiveCategory = z.infer<typeof objectiveCategorySchema>;
export type ObjectiveResult = z.infer<typeof objectiveResultSchema>;
export type Objective = z.infer<typeof objectiveSchema>;

export type ChallengeSubmitRequest = z.infer<
  typeof challengeSubmitRequestSchema
>;
export type ChallengeSubmitSuccessResponse = z.infer<
  typeof challengeSubmitSuccessResponseSchema
>;
export type ChallengeSubmitFailureResponse = z.infer<
  typeof challengeSubmitFailureResponseSchema
>;
export type ChallengeSubmitResponse = z.infer<
  typeof challengeSubmitResponseSchema
>;

export type ChallengeResetResponse = z.infer<
  typeof challengeResetResponseSchema
>;

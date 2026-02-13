/**
 * Resend email template IDs
 *
 * Templates are managed in Resend dashboard.
 * Each template has predefined variables that must be passed when sending.
 */
export const EMAIL_TEMPLATES = {
  /**
   * Onboarding reminder: CLI not installed (sent J+1)
   * Variables: firstName, dashboardUrl
   */
  onboardingCliReminder: "REPLACE_WITH_TEMPLATE_ID",

  /**
   * Onboarding reminder: Challenge not started (sent J+3)
   * Variables: firstName, challengeUrl
   */
  onboardingChallengeReminder: "REPLACE_WITH_TEMPLATE_ID",

  /**
   * Onboarding reminder: Challenge not completed (sent J+7)
   * Variables: firstName, challengeUrl
   */
  onboardingCompletionReminder: "REPLACE_WITH_TEMPLATE_ID",
} as const;

export type EmailTemplateId =
  (typeof EMAIL_TEMPLATES)[keyof typeof EMAIL_TEMPLATES];

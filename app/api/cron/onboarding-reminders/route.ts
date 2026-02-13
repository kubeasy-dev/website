import * as Sentry from "@sentry/nextjs";
import { and, eq, isNull, lt, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/env";
import {
  sendOnboardingChallengeReminderEmail,
  sendOnboardingCliReminderEmail,
  sendOnboardingCompletionReminderEmail,
} from "@/lib/resend";
import db from "@/server/db";
import { user } from "@/server/db/schema/auth";
import { userProgress } from "@/server/db/schema/challenge";
import { userOnboarding } from "@/server/db/schema/onboarding";

const { logger } = Sentry;

/**
 * GET /api/cron/onboarding-reminders
 *
 * Cron job to send onboarding reminder emails.
 * Should be called daily via Vercel Cron.
 *
 * Sends:
 * - Day 1: CLI reminder (user signed up but no CLI auth)
 * - Day 3: Challenge reminder (CLI auth but no challenge started)
 * - Day 7: Completion reminder (challenge started but not completed)
 *
 * Protected by CRON_SECRET to prevent unauthorized access.
 */
export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Sentry.startSpan(
    { op: "cron.onboarding-reminders", name: "Onboarding Reminder Emails" },
    async (span) => {
      const results = {
        cliReminders: { sent: 0, errors: 0 },
        challengeReminders: { sent: 0, errors: 0 },
        completionReminders: { sent: 0, errors: 0 },
      };

      try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Day 1: Users who signed up ~24h ago but haven't authenticated CLI
        const cliReminderUsers = await db
          .select({
            id: user.id,
            email: user.email,
            name: user.name,
          })
          .from(user)
          .leftJoin(userOnboarding, eq(user.id, userOnboarding.userId))
          .where(
            and(
              // Created between 24-48 hours ago
              lt(user.createdAt, oneDayAgo),
              sql`${user.createdAt} > ${new Date(oneDayAgo.getTime() - 24 * 60 * 60 * 1000)}`,
              // No CLI authentication
              sql`(${userOnboarding.cliAuthenticated} IS NULL OR ${userOnboarding.cliAuthenticated} = false)`,
              // Not completed or skipped onboarding
              isNull(userOnboarding.completedAt),
              isNull(userOnboarding.skippedAt),
            ),
          );

        for (const u of cliReminderUsers) {
          try {
            const firstName = u.name?.split(" ")[0] || "there";
            await sendOnboardingCliReminderEmail({
              to: u.email,
              firstName,
              userId: u.id,
            });
            results.cliReminders.sent++;
          } catch (error) {
            results.cliReminders.errors++;
            logger.error("Failed to send CLI reminder email", {
              userId: u.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        // Day 3: Users who authenticated CLI ~3 days ago but haven't started a challenge
        const challengeReminderUsers = await db
          .select({
            id: user.id,
            email: user.email,
            name: user.name,
          })
          .from(user)
          .innerJoin(userOnboarding, eq(user.id, userOnboarding.userId))
          .leftJoin(userProgress, eq(user.id, userProgress.userId))
          .where(
            and(
              // CLI authenticated
              eq(userOnboarding.cliAuthenticated, true),
              // Updated (CLI auth) between 3-4 days ago
              lt(userOnboarding.updatedAt, threeDaysAgo),
              sql`${userOnboarding.updatedAt} > ${new Date(threeDaysAgo.getTime() - 24 * 60 * 60 * 1000)}`,
              // No challenge progress
              isNull(userProgress.id),
              // Not completed or skipped onboarding
              isNull(userOnboarding.completedAt),
              isNull(userOnboarding.skippedAt),
            ),
          );

        for (const u of challengeReminderUsers) {
          try {
            const firstName = u.name?.split(" ")[0] || "there";
            await sendOnboardingChallengeReminderEmail({
              to: u.email,
              firstName,
              userId: u.id,
            });
            results.challengeReminders.sent++;
          } catch (error) {
            results.challengeReminders.errors++;
            logger.error("Failed to send challenge reminder email", {
              userId: u.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        // Day 7: Users who started a challenge ~7 days ago but haven't completed
        const completionReminderUsers = await db
          .select({
            id: user.id,
            email: user.email,
            name: user.name,
          })
          .from(user)
          .innerJoin(userOnboarding, eq(user.id, userOnboarding.userId))
          .innerJoin(userProgress, eq(user.id, userProgress.userId))
          .where(
            and(
              // Challenge started but not completed
              eq(userProgress.status, "in_progress"),
              // Started between 7-8 days ago
              lt(userProgress.startedAt, sevenDaysAgo),
              sql`${userProgress.startedAt} > ${new Date(sevenDaysAgo.getTime() - 24 * 60 * 60 * 1000)}`,
              // Not completed or skipped onboarding
              isNull(userOnboarding.completedAt),
              isNull(userOnboarding.skippedAt),
            ),
          );

        for (const u of completionReminderUsers) {
          try {
            const firstName = u.name?.split(" ")[0] || "there";
            await sendOnboardingCompletionReminderEmail({
              to: u.email,
              firstName,
              userId: u.id,
            });
            results.completionReminders.sent++;
          } catch (error) {
            results.completionReminders.errors++;
            logger.error("Failed to send completion reminder email", {
              userId: u.id,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        span.setAttribute("cliRemindersSent", results.cliReminders.sent);
        span.setAttribute(
          "challengeRemindersSent",
          results.challengeReminders.sent,
        );
        span.setAttribute(
          "completionRemindersSent",
          results.completionReminders.sent,
        );

        logger.info("Onboarding reminder cron completed", results);

        return NextResponse.json({
          success: true,
          results,
        });
      } catch (error) {
        logger.error("Onboarding reminder cron failed", {
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "cron.onboarding-reminders" },
        });

        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500 },
        );
      }
    },
  );
}

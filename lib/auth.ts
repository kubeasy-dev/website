import * as Sentry from "@sentry/nextjs";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, oAuthProxy } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { trackUserSignupServer } from "@/lib/analytics-server";
import db from "@/server/db";
import * as schema from "@/server/db/schema/auth";
import { emailCategory, userEmailPreference } from "@/server/db/schema/email";
import { createResendContact } from "./resend";

const { logger } = Sentry;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: schema,
  }),
  plugins: [
    apiKey({
      rateLimit: {
        enabled: false,
      },
    }),
    admin(),
    oAuthProxy(),
  ],
  socialProviders: {
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/github`,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      redirectURI: `${env.BETTER_AUTH_URL}/api/auth/callback/microsoft`,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Initialize email preferences for new user
          logger.info("User account created", {
            userId: user.id,
            email: user.email,
            hasName: !!user.name,
          });

          try {
            // Get all email categories
            const categories = await db.select().from(emailCategory);

            // Split name into first and last name
            const [firstName, lastName] = user.name?.split(" ") || ["", ""];

            // Create contact in Resend for the first category with an audienceId
            let resendContactId: string | null = null;

            if (env.RESEND_API_KEY) {
              // Find the first category with an audienceId (usually marketing)
              const categoryWithAudience = categories.find(
                (cat) => cat.audienceId,
              );

              if (categoryWithAudience?.audienceId) {
                try {
                  const { contactId } = await createResendContact({
                    email: user.email,
                    firstName: firstName || undefined,
                    lastName: lastName || undefined,
                    userId: user.id,
                    audienceId: categoryWithAudience.audienceId,
                    unsubscribed: !categoryWithAudience.forceSubscription, // Unsubscribed if not forced
                  });
                  resendContactId = contactId;

                  logger.info("Resend contact created", {
                    userId: user.id,
                    contactId,
                    audienceId: categoryWithAudience.audienceId,
                    categoryName: categoryWithAudience.name,
                  });
                } catch (resendError) {
                  logger.error("Failed to create Resend contact", {
                    userId: user.id,
                    error:
                      resendError instanceof Error
                        ? resendError.message
                        : String(resendError),
                  });
                  Sentry.captureException(resendError, {
                    tags: { operation: "resend.createContact" },
                    contexts: {
                      user: {
                        id: user.id,
                        email: user.email,
                      },
                    },
                  });
                  // Continue without Resend contact - preferences will still be created
                }
              }
            }

            // Create preferences for all categories
            // Force subscription for transactional emails, unsubscribed for marketing
            const prefsToInsert = categories.map((cat) => ({
              userId: user.id,
              categoryId: cat.id,
              subscribed: cat.forceSubscription,
              updatedAt: new Date(),
              contactId: resendContactId, // Store Resend contact ID (same for all)
            }));

            await db.insert(userEmailPreference).values(prefsToInsert);

            logger.info("Email preferences initialized", {
              userId: user.id,
              categoriesCount: categories.length,
              hasResendContact: !!resendContactId,
            });
          } catch (error) {
            logger.error("Failed to initialize email preferences", {
              userId: user.id,
              error: error instanceof Error ? error.message : String(error),
            });
            Sentry.captureException(error, {
              tags: { operation: "auth.initializeEmailPreferences" },
              contexts: {
                user: {
                  id: user.id,
                  email: user.email,
                },
              },
            });
            // Don't throw the error to avoid blocking user creation
            // Email preferences can be initialized later if needed
          }

          // Track user signup in PostHog
          try {
            // Get the provider from the account table (should be created at the same time)
            const [account] = await db
              .select()
              .from(schema.account)
              .where(eq(schema.account.userId, user.id))
              .limit(1);

            if (account?.providerId) {
              const provider = account.providerId as
                | "github"
                | "google"
                | "microsoft";
              await trackUserSignupServer(user.id, provider, user.email);

              logger.info("User signup tracked in PostHog", {
                userId: user.id,
                provider: account.providerId,
              });
            }
          } catch (error) {
            logger.error("Failed to track user signup in PostHog", {
              userId: user.id,
              error: error instanceof Error ? error.message : String(error),
            });
            // Don't throw the error to avoid blocking user creation
          }
        },
      },
    },
  },
});

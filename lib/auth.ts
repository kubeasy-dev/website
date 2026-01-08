import * as Sentry from "@sentry/nextjs";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, oAuthProxy } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import { trackUserSignupServer } from "@/lib/analytics-server";
import { redis } from "@/lib/redis";
import db from "@/server/db";
import * as schema from "@/server/db/schema/auth";
import { emailCategory, userEmailPreference } from "@/server/db/schema/email";
import { createResendContact } from "./resend";

const { logger } = Sentry;

const socialProviders = {
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
};

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://localhost:3000",
    "https://kubeasy.dev",
    "https://*.vercel.app", // Allow all Vercel preview deployments
  ],
  database: drizzleAdapter(db, {
    provider: "pg", // or "mysql", "sqlite"
    schema: schema,
  }),
  // Redis as secondary storage for session caching and revocation
  // This allows stateless session validation via cookie while maintaining
  // the ability to revoke sessions through Redis
  secondaryStorage: {
    get: async (key) => {
      const value = await redis.get<string>(key);
      return value;
    },
    set: async (key, value, ttl) => {
      if (ttl) {
        await redis.set(key, value, { ex: ttl });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
  },
  // Session configuration with cookie caching for performance
  // - Cookie validates session without DB query
  // - Redis refreshes cookie cache when it expires
  // - Sessions can be revoked via Redis
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes - short-lived for quick revocation
      strategy: "jwe", // Encrypted tokens for security
    },
  },
  plugins: [
    apiKey({
      rateLimit: {
        // Rate limiting disabled because Better Auth's built-in rate limiting only works
        // with Better Auth's built-in endpoints (/api-key/verify), not when calling
        // auth.api.verifyApiKey() programmatically in custom API routes.
        //
        // Tested behavior:
        // - No rate limit headers are returned (x-ratelimit-limit, x-ratelimit-remaining)
        // - No rate limiting is enforced even when enabled
        //
        // Alternative solution would be to use enableSessionForAPIKeys + auth.api.getSession()
        // or implement custom rate limiting middleware.
        enabled: false,
      },
    }),
    admin(),
    oAuthProxy(),
  ],
  socialProviders: {
    ...socialProviders,
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

          // Note: PostHog user_signup tracking moved to account.create.after hook
          // because the account record (with providerId) doesn't exist yet at this point
        },
      },
    },
    account: {
      create: {
        after: async (account) => {
          // Track user signup in PostHog
          // This hook runs AFTER the account is created, so we have access to providerId
          try {
            // Check if this is the user's first account (new signup vs linking additional provider)
            const existingAccounts = await db
              .select({ id: schema.account.id })
              .from(schema.account)
              .where(eq(schema.account.userId, account.userId));

            // Only track signup for first account (the one just created)
            if (existingAccounts.length > 1) {
              logger.info(
                "Skipping signup tracking - user linking additional provider",
                {
                  userId: account.userId,
                  provider: account.providerId,
                  accountCount: existingAccounts.length,
                },
              );
              return;
            }

            const provider = account.providerId as keyof typeof socialProviders;

            // Get user email for tracking
            const [user] = await db
              .select({ email: schema.user.email })
              .from(schema.user)
              .where(eq(schema.user.id, account.userId))
              .limit(1);

            await trackUserSignupServer(account.userId, provider, user?.email);

            logger.info("User signup tracked in PostHog", {
              userId: account.userId,
              provider: account.providerId,
            });
          } catch (error) {
            logger.error("Failed to track user signup in PostHog", {
              userId: account.userId,
              error: error instanceof Error ? error.message : String(error),
            });
            Sentry.captureException(error, {
              tags: { operation: "posthog.trackUserSignup" },
              contexts: {
                account: {
                  userId: account.userId,
                  providerId: account.providerId,
                },
              },
            });
            // Don't throw the error to avoid blocking account creation
          }
        },
      },
    },
  },
});

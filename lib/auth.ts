import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, oAuthProxy } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { env } from "@/env";
import {
  captureServerException,
  trackUserSignupServer,
} from "@/lib/analytics-server";
import { isRedisConfigured, redis } from "@/lib/redis";
import db from "@/server/db";
import * as schema from "@/server/db/schema/auth";
import { createResendContact } from "./resend";

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
  user: {
    additionalFields: {
      resendContactId: {
        type: "string",
        required: false,
        input: false, // Not set by user, only by server
      },
    },
  },
  // Redis as secondary storage for session caching and revocation (optional)
  // This allows stateless session validation via cookie while maintaining
  // the ability to revoke sessions through Redis
  // Falls back to database-only sessions if Redis is not configured
  ...(isRedisConfigured &&
    redis && {
      secondaryStorage: {
        get: async (key: string): Promise<string | null> => {
          // Safety check - should never be null due to outer condition
          if (!redis) return null;
          try {
            const value = await redis.get<string>(key);
            return value;
          } catch (error) {
            await captureServerException(error, undefined, {
              operation: "redis.secondaryStorage.get",
              key,
            });
            // Return null on error - Better Auth will fall back to database
            return null;
          }
        },
        set: async (
          key: string,
          value: string,
          ttl?: number,
        ): Promise<void> => {
          // Safety check - should never be null due to outer condition
          if (!redis) return;
          try {
            if (ttl) {
              await redis.set(key, value, { ex: ttl });
            } else {
              await redis.set(key, value);
            }
          } catch (error) {
            await captureServerException(error, undefined, {
              operation: "redis.secondaryStorage.set",
              key,
              ttl,
            });
            // Don't throw - Better Auth will continue without caching
          }
        },
        delete: async (key: string): Promise<void> => {
          // Safety check - should never be null due to outer condition
          if (!redis) return;
          try {
            await redis.del(key);
          } catch (error) {
            await captureServerException(error, undefined, {
              operation: "redis.secondaryStorage.delete",
              key,
            });
            // Don't throw - session will expire naturally
          }
        },
      },
    }),
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
          // Create Resend contact for new user
          // Topic subscriptions are managed by Resend (opt_in by default)

          if (!env.RESEND_API_KEY) {
            return;
          }

          try {
            const [firstName, lastName] = user.name?.split(" ") || ["", ""];

            const { contactId } = await createResendContact({
              email: user.email,
              firstName: firstName || undefined,
              lastName: lastName || undefined,
              userId: user.id,
            });

            // Store Resend contact ID on user record
            await db
              .update(schema.user)
              .set({ resendContactId: contactId })
              .where(eq(schema.user.id, user.id));
          } catch (error) {
            await captureServerException(error, user.id, {
              operation: "resend.createContact",
            });
            // Don't throw - graceful degradation, user can still use the app
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
          } catch (error) {
            await captureServerException(error, account.userId, {
              operation: "posthog.trackUserSignup",
              providerId: account.providerId,
            });
            // Don't throw the error to avoid blocking account creation
          }
        },
      },
    },
  },
});

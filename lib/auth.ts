import { all } from "better-all";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, apiKey, oAuthProxy } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { env } from "@/env";
import {
  captureServerException,
  trackUserSignupServer,
} from "@/lib/analytics-server";
import db from "@/server/db";
import * as schema from "@/server/db/schema/auth";
import { createResendContact } from "./resend";

const socialProviders = {
  github: {
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    redirectURI: "https://kubeasy.dev/api/auth/callback/github",
  },
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectURI: "https://kubeasy.dev/api/auth/callback/google",
  },
  microsoft: {
    clientId: env.MICROSOFT_CLIENT_ID,
    clientSecret: env.MICROSOFT_CLIENT_SECRET,
    redirectURI: "https://kubeasy.dev/api/auth/callback/microsoft",
  },
};

export const auth = betterAuth({
  baseURL:
    process.env.VERCEL_ENV === "production"
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000",
  trustedOrigins: [
    "http://localhost:3000",
    "https://kubeasy.dev",
    "https://website-*-kubeasy.vercel.app",
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
    ...(process.env.VERCEL
      ? [oAuthProxy({ productionURL: "https://kubeasy.dev" })]
      : []),
  ],
  account: {
    encryptOAuthTokens: true,
    //cache the account in the cookie
    storeAccountCookie: true,
    //to update scopes
    updateAccountOnSignIn: true,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7,
    },
  },
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

export const getServerSession = cache(async () => {
  try {
    const { session, account } = await all({
      async session() {
        const session = await auth.api.getSession({
          headers: await headers(),
        });
        return session;
      },
      async account() {
        const accessToken = await auth.api.getAccessToken({
          headers: await headers(),
          body: { providerId: "github" },
        });
        return accessToken;
      },
    });
    if (!session || !account?.accessToken) {
      return null;
    }
    return {
      user: session.user,
      session,
    };
  } catch {
    return null;
  }
});

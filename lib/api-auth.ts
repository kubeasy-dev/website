import * as Sentry from "@sentry/nextjs";
import type { Session, User } from "better-auth/types";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import db from "@/server/db";
import { user as userTable } from "@/server/db/schema/auth";

const { logger } = Sentry;

export interface ApiAuthResult {
  success: boolean;
  user?: User & { banned: boolean };
  session?: Session;
  error?: string;
}

/**
 * Authenticate a request using an API token from the Authorization header
 * Expected format: "Bearer <token>"
 */
export async function authenticateApiRequest(
  request: Request,
): Promise<ApiAuthResult> {
  return Sentry.startSpan(
    { op: "auth.api", name: "Authenticate API Request" },
    async (span) => {
      // Extract token from Authorization header
      const authHeader = request.headers.get("Authorization");

      if (!authHeader) {
        logger.warn("API request missing Authorization header");
        return {
          success: false,
          error: "Missing Authorization header",
        };
      }

      if (!authHeader.startsWith("Bearer ")) {
        logger.warn("API request with invalid Authorization format");
        return {
          success: false,
          error: "Invalid Authorization format. Expected: Bearer <token>",
        };
      }

      const token = authHeader.substring(7); // Remove "Bearer " prefix

      if (!token) {
        logger.warn("API request with empty token");
        return {
          success: false,
          error: "Empty token",
        };
      }

      span.setAttribute("tokenPrefix", token.substring(0, 8));

      try {
        logger.info("Attempting to verify API key with Better Auth", {
          tokenPrefix: token.substring(0, 20),
          tokenLength: token.length,
        });

        // Verify the API key using Better Auth
        const verifyResult = await auth.api.verifyApiKey({
          body: {
            key: token,
          },
        });

        logger.info("Better Auth verifyApiKey response", {
          valid: verifyResult.valid,
          hasKey: !!verifyResult.key,
          error: verifyResult.error?.message,
        });

        if (!verifyResult.valid || !verifyResult.key) {
          logger.warn("API request with invalid token", {
            error: verifyResult.error?.message || "Unknown error",
            code: verifyResult.error?.code,
          });
          return {
            success: false,
            error: verifyResult.error?.message || "Invalid or expired token",
          };
        }

        // Get user from database
        const userId = verifyResult.key.userId;
        const [userResult] = await db
          .select()
          .from(userTable)
          .where(eq(userTable.id, userId))
          .limit(1);

        if (!userResult) {
          logger.error("User not found for valid API key", { userId });
          return {
            success: false,
            error: "User not found",
          };
        }

        // Ensure banned field is always present (default to false if null)
        const user = {
          ...userResult,
          banned: userResult.banned ?? false,
        };

        logger.info("API request authenticated successfully", {
          userId: user.id,
        });

        span.setAttribute("userId", user.id);

        // Create a mock session object for tRPC context
        // Session expiry: 30 days for better security (previously 365 days)
        const mockSession: Session = {
          id: `api-key-${verifyResult.key.id}`,
          userId: user.id,
          expiresAt:
            verifyResult.key.expiresAt ||
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          token: token,
          createdAt: verifyResult.key.createdAt,
          updatedAt: verifyResult.key.updatedAt,
          ipAddress: null,
          userAgent: null,
        };

        return {
          success: true,
          user,
          session: mockSession,
        };
      } catch (error) {
        logger.error("API authentication error", {
          error: error instanceof Error ? error.message : String(error),
        });
        Sentry.captureException(error, {
          tags: { operation: "api.auth" },
        });
        return {
          success: false,
          error: "Authentication failed",
        };
      }
    },
  );
}

/**
 * Create a tRPC caller with API authentication context
 */
export function createApiCaller(
  user: User & { banned: boolean },
  session: Session,
) {
  const createCaller = createCallerFactory(appRouter);
  return createCaller({
    db,
    user,
    session,
  });
}

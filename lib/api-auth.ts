import type { Session, User } from "better-auth/types";
import { eq } from "drizzle-orm";
import { captureServerException } from "@/lib/analytics-server";
import { auth } from "@/lib/auth";
import { appRouter } from "@/server/api/root";
import { createCallerFactory } from "@/server/api/trpc";
import db from "@/server/db";
import { user as userTable } from "@/server/db/schema/auth";

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
  // Extract token from Authorization header
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return {
      success: false,
      error: "Missing Authorization header",
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      success: false,
      error: "Invalid Authorization format. Expected: Bearer <token>",
    };
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix

  if (!token) {
    return {
      success: false,
      error: "Empty token",
    };
  }

  try {
    // Verify the API key using Better Auth
    const verifyResult = await auth.api.verifyApiKey({
      body: {
        key: token,
      },
    });

    if (!verifyResult.valid || !verifyResult.key) {
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

    // Security check: Reject banned users
    if (user.banned) {
      return {
        success: false,
        error: "Account has been banned",
      };
    }

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
    await captureServerException(error, undefined, {
      operation: "api.auth",
    });
    return {
      success: false,
      error: "Authentication failed",
    };
  }
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

/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import * as Sentry from "@sentry/node";
import { initTRPC, TRPCError } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@/lib/auth";
import db from "@/server/db";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = cache(async (opts?: { headers: Headers }) => {
  let session = null;
  if (opts?.headers) {
    session = await auth.api.getSession({
      headers: opts.headers,
    });
  }

  return {
    db,
    ...session,
  };
});

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const _timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  const duration = end - start;

  // Log all requests in development
  if (t._config.isDev) {
    console.log(`[TRPC] ${path} took ${duration}ms to execute`);
  }

  // In production, only log slow queries (>1000ms) to Sentry
  if (!t._config.isDev && duration > 1000) {
    const { logger } = Sentry;
    logger.warn("Slow tRPC query detected", {
      path,
      duration,
      threshold: 1000,
    });
  }

  return result;
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure
  //.use(timingMiddleware)
  .use(sentryMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
const enforceUserIsAuthed = t.middleware(async ({ ctx, next, path }) => {
  if (!ctx.user || !ctx.session) {
    // Log unauthorized access attempts
    const { logger } = Sentry;
    logger.warn("Unauthorized access attempt", {
      path,
      hasUser: !!ctx.user,
      hasSession: !!ctx.session,
    });
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable to downstream procedures
      ...ctx,
      user: ctx.user,
      session: ctx.session,
    },
  });
});

const enforceUserIsAdmin = t.middleware(async ({ ctx, next, path }) => {
  if (!ctx.user?.role || ctx.user.role !== "admin") {
    // Log unauthorized access attempts
    const { logger } = Sentry;
    logger.warn("Unauthorized admin access attempt", {
      path,
      userId: ctx.user?.id || null,
      userRole: ctx.user?.role || null,
    });
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access only" });
  }
  return next();
});

export const privateProcedure = publicProcedure.use(enforceUserIsAuthed);
export const adminProcedure = privateProcedure.use(enforceUserIsAdmin);

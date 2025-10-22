# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kubeasy is a Next.js 15 application for learning Kubernetes through interactive challenges. It's built with:
- **Next.js 15** (React 19) with App Router
- **TypeScript** for type safety
- **Drizzle ORM** with PostgreSQL (Neon serverless)
- **Better Auth** for authentication with social providers (GitHub, Google, Microsoft)
- **tRPC** for type-safe API endpoints
- **Tailwind CSS 4** for styling
- **shadcn/ui** components (Radix UI primitives)
- **Biome** for linting and formatting
- **Husky + lint-staged** for pre-commit hooks

## Development Commands

```bash
# Install dependencies (using pnpm)
pnpm install

# Run development server (http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Code quality
pnpm check              # Check code with Biome
pnpm check:write        # Check and auto-fix with Biome
pnpm check:unsafe       # Check and auto-fix with unsafe fixes

# Database migrations
pnpm db:generate        # Generate migration files
pnpm db:migrate         # Run migrations
pnpm db:push            # Push schema changes directly to DB
pnpm db:studio          # Open Drizzle Studio to view database
```

## Architecture

### API Layer: tRPC

The application uses **tRPC** for type-safe client-server communication:

- **Server setup**: `server/api/trpc.ts` configures tRPC with context and middleware
- **Router definition**: `server/api/root.ts` exports the main `appRouter`
- **Routers**: Individual routers in `server/api/routers/`
  - `challenge.ts`: Challenge-related queries and mutations
  - `theme.ts`: Theme management
  - `userProgress.ts`: User progress tracking
  - `xpTransaction.ts`: XP transaction history
- **API endpoint**: `app/api/trpc/[trpc]/route.ts` handles all tRPC requests
- **Client setup**: `trpc/client.tsx` provides `TRPCReactProvider` and `useTRPC` hook
- **Server setup**: `trpc/server.tsx` provides server-side utilities (`trpc`, `getQueryClient`, `HydrateClient`)
- **Type exports**: `types/trpc.ts` exports all tRPC types for use throughout the app

#### Adding a New tRPC Router

```typescript
// server/api/routers/myRouter.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";

export const myRouter = createTRPCRouter({
  // Public query
  getPublicData: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.select().from(myTable).where(eq(myTable.id, input.id));
    }),

  // Protected mutation (requires auth)
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(myTable).values({
        name: input.name,
        userId: ctx.session.userId,
      });
    }),
});

// server/api/root.ts
import { myRouter } from "./routers/myRouter";

export const appRouter = createTRPCRouter({
  // ... other routers
  myRouter,
});
```

#### Using tRPC in Components

```typescript
// Client component
"use client";
import { useTRPC } from "@/trpc/client";

export function MyComponent() {
  const { data, isLoading } = useTRPC.challenge.list.useQuery({
    difficulty: "beginner",
  });

  const createMutation = useTRPC.challenge.create.useMutation();

  return <div>{/* ... */}</div>;
}

// Server component
import { trpc } from "@/trpc/server";

export async function MyServerComponent() {
  const { challenges } = await trpc.challenge.list.query({
    difficulty: "beginner",
  });

  return <div>{/* ... */}</div>;
}
```

### Authentication: Better Auth

Authentication is handled by **Better Auth** (not NextAuth):

- **Server config**: `lib/auth.ts` configures Better Auth with Drizzle adapter
- **Client config**: `lib/auth-client.ts` provides `authClient` and helper functions
- **API routes**: `app/api/auth/[...all]/route.ts` handles auth endpoints
- **Database schema**: `server/db/schema/auth.ts` contains user, session, account, verification, and apikey tables
- **Social providers**: GitHub, Google, and Microsoft configured (requires env vars)

### Database Layer

- **Connection**: `server/db/index.ts` creates a Neon serverless connection
- **Schemas**: Split into separate files in `server/db/schema/`:
  - `auth.ts`: User authentication tables (user, session, account, verification, apikey)
  - `challenge.ts`: Challenge system (challenge, challengeTheme, userProgress, userSubmission, xpTransaction)
  - `index.ts`: Exports all schemas
- **Config**: `drizzle.config.ts` points to `server/db/schema` directory

### Project Structure

```
app/                          # Next.js App Router
  (main)/                     # Main layout group (requires auth)
    challenges/               # Challenge listing and detail pages
    dashboard/                # User dashboard
    themes/                   # Theme listing and detail pages
    page.tsx                  # Main landing page
    layout.tsx                # Main layout with header/footer
  api/
    auth/[...all]/            # Better Auth API routes
    trpc/[trpc]/              # tRPC API handler
  login/                      # Login page
  layout.tsx                  # Root layout
components/                   # React components
  ui/                         # shadcn/ui components
    alert.tsx                 # Alert component (destructive/default)
    badge.tsx, button.tsx     # Basic UI components
    card.tsx, input.tsx       # Form components
    navigation-menu.tsx       # Navigation component
  *-section.tsx               # Landing page sections
  challenge-*.tsx             # Challenge-related components
  user-*.tsx                  # User-related components
  header.tsx, footer.tsx      # Layout components
  login-card.tsx              # Login form with social providers
lib/                          # Utilities
  auth.ts                     # Better Auth server config
  auth-client.ts              # Better Auth client config
  utils.ts                    # Utility functions (cn, etc.)
  constants.ts                # App constants
schemas/                      # Zod validation schemas
  challengeFilters.ts         # Challenge filter schemas
server/                       # Backend code
  api/
    routers/                  # tRPC routers
      challenge.ts            # Challenge operations
      theme.ts                # Theme operations
      userProgress.ts         # Progress tracking
      xpTransaction.ts        # XP transactions
    root.ts                   # Main tRPC router
    trpc.ts                   # tRPC configuration
  db/
    schema/                   # Drizzle schemas
      auth.ts                 # Auth tables
      challenge.ts            # Challenge tables
      index.ts                # Schema exports
    index.ts                  # Database connection
trpc/                         # tRPC client/server setup
  client.tsx                  # Client provider
  server.tsx                  # Server utilities
  query-client.ts             # React Query config
types/                        # TypeScript type definitions
  trpc.ts                     # tRPC type exports
public/                       # Static assets
drizzle/                      # Generated migration files
.husky/                       # Git hooks
  pre-commit                  # Pre-commit hook (lint-staged + typecheck)
```

### Environment Variables

Required environment variables (`.env`):
```bash
DATABASE_URL=                  # Neon PostgreSQL connection string
GITHUB_CLIENT_ID=              # GitHub OAuth app ID
GITHUB_CLIENT_SECRET=          # GitHub OAuth app secret
GOOGLE_CLIENT_ID=              # Google OAuth client ID
GOOGLE_CLIENT_SECRET=          # Google OAuth client secret
MICROSOFT_CLIENT_ID=           # Microsoft OAuth client ID
MICROSOFT_CLIENT_SECRET=       # Microsoft OAuth client secret
BETTER_AUTH_SECRET=            # Better Auth secret key
BETTER_AUTH_URL=               # Better Auth callback URL
```

## Code Quality & Git Hooks

### Pre-commit Hook

The project uses **Husky** with **lint-staged** to ensure code quality:

1. **Biome check** runs automatically on staged files
2. **TypeScript check** validates types across the entire project
3. Commit is blocked if there are errors

Configuration in `package.json`:
```json
"lint-staged": {
  "*.{js,jsx,ts,tsx,mjs,cjs}": [
    "biome check --write --unsafe --files-ignore-unknown=true --no-errors-on-unmatched"
  ],
  "*.{json,css}": [
    "biome check --write --files-ignore-unknown=true --no-errors-on-unmatched"
  ]
}
```

### Biome Configuration

Biome is configured to:
- Auto-format code with 2-space indentation
- Check for code quality issues
- Ignore Tailwind 4 CSS at-rules (`@custom-variant`, `@theme`, `@apply`)
- Treat some issues as warnings instead of errors (array index keys in static lists)

## Key Patterns

### Database Operations

```typescript
// In a tRPC procedure
import { challenge } from "@/server/db/schema/challenge";
import { eq } from "drizzle-orm";

export const myProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    // Access database via ctx.db
    const challenges = await ctx.db.select().from(challenge);

    const specific = await ctx.db
      .select()
      .from(challenge)
      .where(eq(challenge.id, "some-id"));

    return { challenges, specific };
  });
```

### Type-Safe Client Usage

```typescript
// Import typed exports
import type { Challenge, ChallengeDetail, UserStats } from "@/types/trpc";

// Use in components
const challenge: Challenge = data.challenges[0];
const details: ChallengeDetail = await trpc.challenge.getBySlug.query({ slug: "intro" });
```

### Authentication Check

```typescript
// Server component
import { auth } from "@/lib/auth";

export async function MyPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <div>Welcome {session.user.name}</div>;
}

// Client component
"use client";
import { useSession } from "@/lib/auth-client";

export function MyComponent() {
  const { data: session } = useSession();
  if (!session) return <LoginPrompt />;

  return <div>Welcome {session.user.name}</div>;
}
```

## Exception Catching

- Use `Sentry.captureException(error)` to capture an exception and log the error in Sentry.
- Use this in try catch blocks or areas where exceptions are expected

### Tracing Examples

- Spans should be created for meaningful actions within applications like button clicks, API calls, and function calls
- Use the `Sentry.startSpan` function to create a span
- Child spans can exist within a parent span

### Custom Span instrumentation in component actions

- The `name` and `op` properties should be meaningful for the activities in the call.
- Attach attributes based on relevant information and metrics from the request

```javascript
function TestComponent() {
  const handleTestButtonClick = () => {
    // Create a transaction/span to measure performance
    Sentry.startSpan(
      {
        op: "ui.click",
        name: "Test Button Click",
      },
      (span) => {
        const value = "some config";
        const metric = "some metric";

        // Metrics can be added to the span
        span.setAttribute("config", value);
        span.setAttribute("metric", metric);

        doSomething();
      },
    );
  };

  return (
    <button type="button" onClick={handleTestButtonClick}>
      Test Sentry
    </button>
  );
}
```

### Custom span instrumentation in API calls

- The `name` and `op` properties should be meaningful for the activities in the call.
- Attach attributes based on relevant information and metrics from the request

```javascript
async function fetchUserData(userId) {
  return Sentry.startSpan(
    {
      op: "http.client",
      name: `GET /api/users/${userId}`,
    },
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      const data = await response.json();
      return data;
    },
  );
}
```

### Logs

- Where logs are used, ensure Sentry is imported using `import * as Sentry from "@sentry/nextjs"`
- Enable logging in Sentry using `Sentry.init({ enableLogs: true })`
- Reference the logger using `const { logger } = Sentry`
- Sentry offers a consoleLoggingIntegration that can be used to log specific console error types automatically without instrumenting the individual logger calls

### Configuration

- In NextJS the client side Sentry initialization is in `instrumentation-client.ts`, the server initialization is in `sentry.server.config.ts` and the edge initialization is in `sentry.edge.config.ts`
- Initialization does not need to be repeated in other files, it only needs to happen the files mentioned above. You should use `import * as Sentry from "@sentry/nextjs"` to reference Sentry functionality

### Baseline

```javascript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",

  enableLogs: true,
});
```

### Logger Integration

```javascript
Sentry.init({
  dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
  integrations: [
    // send console.log, console.error, and console.warn calls as logs to Sentry
    Sentry.consoleLoggingIntegration({ levels: ["log", "error", "warn"] }),
  ],
});
```

### Logger Examples

`logger.fmt` is a template literal function that should be used to bring variables into the structured logs.

```javascript
logger.trace("Starting database connection", { database: "users" });
logger.debug(logger.fmt`Cache miss for user: ${userId}`);
logger.info("Updated profile", { profileId: 345 });
logger.warn("Rate limit reached for endpoint", {
  endpoint: "/api/results/",
  isEnterprise: false,
});
logger.error("Failed to process payment", {
  orderId: "order_123",
  amount: 99.99,
});
logger.fatal("Database connection pool exhausted", {
  database: "users",
  activeConnections: 100,
});
```

## Notes

- **Package manager**: Use `pnpm` (configured in `package.json`)
- **Path alias**: `@/*` maps to project root
- **Fonts**: Geist Sans and Geist Mono from `geist` package
- **Analytics**: Vercel Analytics integrated in root layout
- **Never run `pnpm build`** to test - it breaks `pnpm dev` (Next.js issue). Use `pnpm typecheck` instead
- **Commit hooks**: All commits automatically check code quality. Fix errors or use `--no-verify` to bypass (not recommended)
- **Documentation**: Use Context7 MCP server for up-to-date library documentation

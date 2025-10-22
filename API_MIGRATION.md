# CLI API Migration Guide

This document explains the migration from the deprecated `api-proxy` service to the new website-based CLI API routes.

## Overview

The `kubeasy-cli` previously connected to Supabase through the `api-proxy` service. This architecture has been replaced with direct API routes in the website Next.js application, providing better type safety, centralized authentication, and easier maintenance.

## Architecture Changes

### Before (Deprecated)
```
kubeasy-cli → api-proxy → Supabase
```

### After (Current)
```
kubeasy-cli → website API routes → tRPC → Database (via Drizzle ORM)
```

## API Endpoints

All CLI API routes are under `/api/cli/` and require Bearer token authentication.

### Authentication
- **Header**: `Authorization: Bearer <api_key>`
- API keys are generated through the website UI at `/profile`
- Keys are stored securely in the system keyring by the CLI

### Available Endpoints

#### 1. User Profile
**GET** `/api/cli/user`

Returns the authenticated user's profile information.

**Response:**
```typescript
{
  firstName: string,
  lastName: string
}
```

#### 2. Challenge Details
**GET** `/api/cli/challenge/[slug]`

Retrieves complete challenge information by slug.

**Response:**
```typescript
{
  id: string,
  title: string,
  slug: string,
  description: string,
  difficulty: "easy" | "medium" | "hard",
  theme: string,
  initial_situation: string,
  objective: string
}
```

#### 3. Challenge Status
**GET** `/api/cli/challenge/[slug]/status`

Gets the user's progress status for a specific challenge.

**Response:**
```typescript
{
  status: "not_started" | "in_progress" | "completed",
  startedAt?: string,  // ISO 8601 date
  completedAt?: string // ISO 8601 date
}
```

#### 4. Start Challenge
**POST** `/api/cli/challenge/[slug]/start`

Starts a challenge for the authenticated user.

**Response:**
```typescript
{
  status: "in_progress" | "completed",
  startedAt: string,
  message?: string
}
```

#### 5. Submit Challenge
**POST** `/api/cli/challenge/[slug]/submit`

Submits a challenge with validation results from the Kubernetes operator.

**Request Body:**
```typescript
{
  validated: boolean,              // Overall validation (required)
  static_validation?: boolean,     // Static validation result
  dynamic_validation?: boolean,    // Dynamic validation result
  payload?: any                    // Additional validation details
}
```

**Success Response:**
```typescript
{
  success: true,
  xpAwarded: number,
  totalXp: number,
  rank: string,
  rankUp?: boolean,
  firstChallenge?: boolean
}
```

**Failure Response:**
```typescript
{
  success: false,
  message: string
}
```

#### 6. Reset Challenge
**POST** `/api/cli/challenge/[slug]/reset`

Resets the user's progress for a specific challenge.

**Response:**
```typescript
{
  success: boolean,
  message: string
}
```

### Admin Endpoints

These endpoints require admin privileges (`role: "admin"`).

#### 1. Bulk Challenge Sync
**POST** `/api/admin/challenges/sync`

Synchronizes challenges in bulk - creates new challenges, updates existing ones, and deletes challenges not in the request body.

**Authentication:**
- Requires admin user session (Better Auth)
- Set session cookie in request headers

**Request Body:**
```typescript
{
  challenges: Array<{
    slug: string,
    title: string,
    description: string,
    theme: string,
    difficulty: "easy" | "medium" | "hard",
    estimatedTime: number,
    initialSituation: string,
    objective: string,
    ofTheWeek?: boolean
  }>
}
```

**Response:**
```typescript
{
  success: true,
  created: number,
  updated: number,
  deleted: number,
  details: {
    created: string[],    // Array of created challenge slugs
    updated: string[],    // Array of updated challenge slugs
    deleted: string[]     // Array of deleted challenge slugs
  }
}
```

**Error Responses:**
- `401` - Unauthorized (no session)
- `403` - Forbidden (user is not admin)
- `400` - Bad request (invalid body or missing themes)
- `500` - Internal server error

**Usage:**
This endpoint is used by the challenge repository's sync script (`challenges/.github/scripts/sync.js`) to keep the database synchronized with the challenge definitions in YAML files.

## Type Safety

### TypeScript Types (Website)
All API response types are defined in `/website/types/cli-api.ts`.

### Go Types (CLI)
Corresponding Go structs are in `/kubeasy-cli/pkg/api/types.go`.

To keep types in sync:
1. Update TypeScript types in `/website/types/cli-api.ts`
2. Run `/website/scripts/generate-go-types.ts` (optional)
3. Manually sync changes to `/kubeasy-cli/pkg/api/types.go`

## CLI Implementation

### New Client
The CLI HTTP client is implemented in `/kubeasy-cli/pkg/api/client.go` with the following key functions:

- `GetProfile()` - Fetch user profile
- `GetChallenge(slug)` - Get challenge details
- `GetChallengeStatus(slug)` - Get challenge progress
- `StartChallenge(slug)` - Start a challenge
- `SubmitChallenge(slug, req)` - Submit validation results
- `ResetChallenge(slug)` - Reset challenge progress

### Backward Compatibility
The new client provides wrapper functions to maintain compatibility with existing CLI code:
- `GetChallengeProgress(slug)` → wrapper for `GetChallengeStatus`
- `SendSubmit(slug, static, dynamic, payload)` → wrapper for `SubmitChallenge`
- `ResetChallengeProgress(slug)` → wrapper for `ResetChallenge`

## Database Schema

Relevant database tables:
- `challenge` - Challenge metadata
- `user_progress` - User progress tracking
- `user_submission` - Submission records with validation details
- `user_xp` - User XP totals
- `user_xp_transaction` - XP transaction history
- `apikey` - API keys for CLI authentication

## Error Handling

All endpoints return consistent error responses:

```typescript
{
  error: string,
  details?: string
}
```

HTTP Status Codes:
- `200` - Success
- `400` - Bad request (validation failed, already completed, etc.)
- `401` - Unauthorized (missing/invalid API key)
- `404` - Resource not found (challenge doesn't exist)
- `500` - Internal server error

## Migration Checklist

- [x] Create CLI API routes in website
- [x] Implement tRPC procedures for all operations
- [x] Create HTTP client in CLI (`client.go`)
- [x] Generate TypeScript and Go types
- [x] Update all CLI commands to use new endpoints
- [x] Deprecate `api-proxy` service
- [x] Test compilation and functionality

## Testing

To test the migration locally:

1. **Start the website**:
   ```bash
   cd website
   pnpm dev
   ```

2. **Update CLI constants** (if needed):
   ```go
   // pkg/constants/const.go
   var WebsiteURL = "http://localhost:3000" // for local testing
   ```

3. **Build and test CLI**:
   ```bash
   cd kubeasy-cli
   go build -o kubeasy-cli
   ./kubeasy-cli login
   ./kubeasy-cli challenge start <slug>
   ```

## Future Improvements

- [ ] Add rate limiting to CLI endpoints
- [ ] Implement API key rotation
- [ ] Add detailed logging and monitoring
- [ ] Create automated tests for all endpoints
- [ ] Add API versioning support

## Support

For issues or questions about the API migration:
- Check website logs in Sentry
- Review tRPC router implementations in `/website/server/api/routers/`
- Consult authentication middleware in `/website/lib/api-auth.ts`

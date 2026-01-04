/**
 * Direct database queries for static/cached pages
 * These queries use Next.js 16 'use cache' directive with cache tags
 * for granular cache invalidation
 */

import { asc, desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import db from "@/server/db";
import { challenge, challengeTheme } from "@/server/db/schema";

/**
 * Get all challenges
 * Returns basic challenge info without user-specific data
 * Cached with 'public' profile (1 hour revalidation)
 */
export async function getChallenges() {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges");

  const challenges = await db
    .select({
      id: challenge.id,
      slug: challenge.slug,
      title: challenge.title,
      description: challenge.description,
      theme: challengeTheme.name,
      themeSlug: challenge.theme,
      difficulty: challenge.difficulty,
      type: challenge.type,
      estimatedTime: challenge.estimatedTime,
      initialSituation: challenge.initialSituation,
      objective: challenge.objective,
      ofTheWeek: challenge.ofTheWeek,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    })
    .from(challenge)
    .innerJoin(challengeTheme, eq(challenge.theme, challengeTheme.slug));

  return {
    challenges,
    count: challenges.length,
  };
}

/**
 * Get a single challenge by slug
 * Cached with 'public' profile and specific challenge tag
 */
export async function getChallengeBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges", `challenge-${slug}`);

  const [challengeItem] = await db
    .select({
      id: challenge.id,
      slug: challenge.slug,
      title: challenge.title,
      description: challenge.description,
      theme: challengeTheme.name,
      themeSlug: challenge.theme,
      difficulty: challenge.difficulty,
      type: challenge.type,
      estimatedTime: challenge.estimatedTime,
      initialSituation: challenge.initialSituation,
      objective: challenge.objective,
      ofTheWeek: challenge.ofTheWeek,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    })
    .from(challenge)
    .innerJoin(challengeTheme, eq(challenge.theme, challengeTheme.slug))
    .where(eq(challenge.slug, slug))
    .limit(1);

  return challengeItem ?? null;
}

/**
 * Get all themes
 * Cached with 'public' profile
 */
export async function getThemes() {
  "use cache";
  cacheLife("hours");
  cacheTag("themes");

  const themes = await db
    .select()
    .from(challengeTheme)
    .orderBy(asc(challengeTheme.name));

  return themes;
}

/**
 * Get a single theme by slug
 * Cached with 'public' profile and specific theme tag
 */
export async function getThemeBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("themes", `theme-${slug}`);

  const [theme] = await db
    .select()
    .from(challengeTheme)
    .where(eq(challengeTheme.slug, slug))
    .limit(1);

  return theme ?? null;
}

/**
 * Get challenge count for a specific theme
 * Efficient count query without fetching all challenge data
 * Cached with 'public' profile
 */
export async function getChallengeCountByTheme(themeSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges", `theme-${themeSlug}`);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(challenge)
    .where(eq(challenge.theme, themeSlug));

  return result[0]?.count ?? 0;
}

/**
 * Get challenge count for a specific type
 * Efficient count query without fetching all challenge data
 * Cached with 'public' profile
 */
export async function getChallengeCountByType(
  typeSlug: "build" | "fix" | "migrate",
) {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges", `type-${typeSlug}`);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(challenge)
    .where(eq(challenge.type, typeSlug));

  return result[0]?.count ?? 0;
}

/**
 * Get all challenge types with their counts
 * Returns static type definitions with challenge counts
 * Cached with 'public' profile
 */
export async function getChallengeTypes() {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges", "types");

  // Static type definitions
  const typeDefinitions = [
    {
      slug: "fix" as const,
      name: "Fix",
      description:
        "Diagnose and resolve issues in broken Kubernetes deployments. Debug pods, fix configurations, and restore cluster health.",
      logo: "Wrench",
    },
    {
      slug: "build" as const,
      name: "Build",
      description:
        "Create Kubernetes resources from scratch. Deploy applications, configure services, and set up infrastructure.",
      logo: "Hammer",
    },
    {
      slug: "migrate" as const,
      name: "Migrate",
      description:
        "Transform and upgrade existing deployments. Convert configurations, update APIs, and modernize workloads.",
      logo: "ArrowRightLeft",
    },
  ];

  // Get counts for each type
  const counts = await db
    .select({
      type: challenge.type,
      count: sql<number>`count(*)`,
    })
    .from(challenge)
    .groupBy(challenge.type);

  const countMap = new Map(counts.map((c) => [c.type, c.count]));

  return typeDefinitions.map((type) => ({
    ...type,
    challengeCount: countMap.get(type.slug) ?? 0,
  }));
}

/**
 * Get a single challenge type by slug
 * Returns type definition with challenge count
 * Cached with 'public' profile
 */
export async function getChallengeTypeBySlug(
  slug: "build" | "fix" | "migrate",
) {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges", `type-${slug}`);

  const typeDefinitions: Record<
    "build" | "fix" | "migrate",
    { name: string; description: string; logo: string }
  > = {
    fix: {
      name: "Fix",
      description:
        "Diagnose and resolve issues in broken Kubernetes deployments. Debug pods, fix configurations, and restore cluster health.",
      logo: "Wrench",
    },
    build: {
      name: "Build",
      description:
        "Create Kubernetes resources from scratch. Deploy applications, configure services, and set up infrastructure.",
      logo: "Hammer",
    },
    migrate: {
      name: "Migrate",
      description:
        "Transform and upgrade existing deployments. Convert configurations, update APIs, and modernize workloads.",
      logo: "ArrowRightLeft",
    },
  };

  const typeInfo = typeDefinitions[slug];
  if (!typeInfo) {
    return null;
  }

  return {
    slug,
    ...typeInfo,
  };
}

/**
 * Get starter-friendly challenges
 * Returns challenges marked as beginner-friendly, ordered by difficulty and creation date
 * Cached with 'public' profile
 */
export async function getStarterChallenges(limit = 5) {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges", "starter-challenges");

  const challenges = await db
    .select({
      id: challenge.id,
      slug: challenge.slug,
      title: challenge.title,
      description: challenge.description,
      theme: challengeTheme.name,
      themeSlug: challenge.theme,
      difficulty: challenge.difficulty,
      estimatedTime: challenge.estimatedTime,
      starterFriendly: challenge.starterFriendly,
      initialSituation: challenge.initialSituation,
      objective: challenge.objective,
    })
    .from(challenge)
    .innerJoin(challengeTheme, eq(challenge.theme, challengeTheme.slug))
    .where(eq(challenge.starterFriendly, true))
    .orderBy(
      // Order by difficulty: easy first, then medium, then hard
      sql`CASE ${challenge.difficulty} WHEN 'easy' THEN 1 WHEN 'medium' THEN 2 WHEN 'hard' THEN 3 END`,
      desc(challenge.createdAt),
    )
    .limit(limit);

  return challenges;
}

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
  cacheLife("public");
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
  cacheLife("public");
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
  cacheLife("public");
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
  cacheLife("public");
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
  cacheLife("public");
  cacheTag("challenges", `theme-${themeSlug}`);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(challenge)
    .where(eq(challenge.theme, themeSlug));

  return result[0]?.count ?? 0;
}

/**
 * Get starter-friendly challenges
 * Returns challenges marked as beginner-friendly, ordered by difficulty and creation date
 * Cached with 'public' profile
 */
export async function getStarterChallenges(limit = 5) {
  "use cache";
  cacheLife("public");
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

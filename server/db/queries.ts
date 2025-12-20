/**
 * Direct database queries for ISR pages
 * These queries don't require request context (headers, session)
 * and can be used in static/ISR page generation
 */

import { asc, desc, eq, sql } from "drizzle-orm";
import db from "@/server/db";
import { challenge, challengeTheme } from "@/server/db/schema";

/**
 * Get all challenges
 * Returns basic challenge info without user-specific data
 */
export async function getChallenges() {
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
 */
export async function getChallengeBySlug(slug: string) {
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
 */
export async function getThemes() {
  const themes = await db
    .select()
    .from(challengeTheme)
    .orderBy(asc(challengeTheme.name));

  return themes;
}

/**
 * Get a single theme by slug
 */
export async function getThemeBySlug(slug: string) {
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
 */
export async function getChallengeCountByTheme(themeSlug: string) {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(challenge)
    .where(eq(challenge.theme, themeSlug));

  return result[0]?.count ?? 0;
}

/**
 * Get starter-friendly challenges
 * Returns challenges marked as beginner-friendly, ordered by difficulty and creation date
 */
export async function getStarterChallenges(limit = 5) {
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

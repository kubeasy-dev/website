/**
 * Direct database queries for static/cached pages
 * These queries use Next.js 16 'use cache' directive with cache tags
 * for granular cache invalidation
 */

import { asc, desc, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import {
  getAllCategories as fetchAllCategories,
  getAllCategoryNames as fetchAllCategoryNames,
  getAllPostSlugs as fetchAllPostSlugs,
  getAllPosts as fetchAllPosts,
  getPostBySlug as fetchPostBySlug,
  getPostsByCategory as fetchPostsByCategory,
  getPostWithContent as fetchPostWithContent,
  getRelatedPosts as fetchRelatedPosts,
  isNotionConfigured,
} from "@/lib/notion";
import db from "@/server/db";
import { challenge, challengeTheme, challengeType } from "@/server/db/schema";
import type {
  BlogPost,
  BlogPostWithContent,
  CategoryWithCount,
  PaginatedBlogPosts,
} from "@/types/blog";

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
      type: challengeType.name,
      typeSlug: challenge.typeSlug,
      estimatedTime: challenge.estimatedTime,
      initialSituation: challenge.initialSituation,
      objective: challenge.objective,
      ofTheWeek: challenge.ofTheWeek,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    })
    .from(challenge)
    .innerJoin(challengeTheme, eq(challenge.theme, challengeTheme.slug))
    .innerJoin(challengeType, eq(challenge.typeSlug, challengeType.slug));

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
      type: challengeType.name,
      typeSlug: challenge.typeSlug,
      estimatedTime: challenge.estimatedTime,
      initialSituation: challenge.initialSituation,
      objective: challenge.objective,
      ofTheWeek: challenge.ofTheWeek,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    })
    .from(challenge)
    .innerJoin(challengeTheme, eq(challenge.theme, challengeTheme.slug))
    .innerJoin(challengeType, eq(challenge.typeSlug, challengeType.slug))
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
export async function getChallengeCountByType(typeSlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges", `type-${typeSlug}`);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(challenge)
    .where(eq(challenge.typeSlug, typeSlug));

  return result[0]?.count ?? 0;
}

/**
 * Get all challenge types
 * Cached with 'public' profile
 */
export async function getTypes() {
  "use cache";
  cacheLife("hours");
  cacheTag("types");

  const types = await db
    .select()
    .from(challengeType)
    .orderBy(asc(challengeType.name));

  return types;
}

/**
 * Get all challenge types with their counts
 * Returns type data from database with challenge counts
 * Uses LEFT JOIN to include types with zero challenges
 * Cached with 'public' profile
 */
export async function getChallengeTypes() {
  "use cache";
  cacheLife("hours");
  cacheTag("challenges", "types");

  const types = await db
    .select({
      slug: challengeType.slug,
      name: challengeType.name,
      description: challengeType.description,
      logo: challengeType.logo,
      updatedAt: challengeType.updatedAt,
      challengeCount: sql<number>`count(${challenge.id})`.as("challenge_count"),
    })
    .from(challengeType)
    .leftJoin(challenge, eq(challengeType.slug, challenge.typeSlug))
    .groupBy(challengeType.slug)
    .orderBy(asc(challengeType.name));

  return types;
}

/**
 * Get a single challenge type by slug
 * Returns type from database
 * Cached with 'public' profile
 */
export async function getTypeBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("types", `type-${slug}`);

  const [type] = await db
    .select()
    .from(challengeType)
    .where(eq(challengeType.slug, slug))
    .limit(1);

  return type ?? null;
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

// =============================================================================
// Blog queries (Notion-powered)
// =============================================================================

const POSTS_PER_PAGE = 9;

/**
 * Get paginated blog posts
 * Cached with 'hours' profile for ISR
 */
export async function getBlogPosts(
  page = 1,
  perPage = POSTS_PER_PAGE,
): Promise<PaginatedBlogPosts> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts");

  if (!isNotionConfigured) {
    return {
      posts: [],
      totalPages: 0,
      currentPage: page,
      totalPosts: 0,
    };
  }

  const allPosts = await fetchAllPosts();
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / perPage);
  const startIndex = (page - 1) * perPage;
  const posts = allPosts.slice(startIndex, startIndex + perPage);

  return {
    posts,
    totalPages,
    currentPage: page,
    totalPosts,
  };
}

/**
 * Get a single blog post by slug
 * Cached with specific post tag for granular invalidation
 */
export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts", `blog-post-${slug}`);

  if (!isNotionConfigured) return null;

  return await fetchPostBySlug(slug);
}

/**
 * Get a blog post with all content blocks
 * Cached with specific post tag
 */
export async function getBlogPostWithContent(
  slug: string,
): Promise<BlogPostWithContent | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts", `blog-post-${slug}`);

  if (!isNotionConfigured) return null;

  return await fetchPostWithContent(slug);
}

/**
 * Get blog posts by category
 * Cached with category-specific tag
 */
export async function getBlogPostsByCategory(
  category: string,
  page = 1,
  perPage = POSTS_PER_PAGE,
): Promise<PaginatedBlogPosts> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts", `blog-category-${category}`);

  if (!isNotionConfigured) {
    return {
      posts: [],
      totalPages: 0,
      currentPage: page,
      totalPosts: 0,
    };
  }

  const allPosts = await fetchPostsByCategory(category);
  const totalPosts = allPosts.length;
  const totalPages = Math.ceil(totalPosts / perPage);
  const startIndex = (page - 1) * perPage;
  const posts = allPosts.slice(startIndex, startIndex + perPage);

  return {
    posts,
    totalPages,
    currentPage: page,
    totalPosts,
  };
}

/**
 * Get all blog categories with post counts
 * Cached for category filtering
 */
export async function getBlogCategories(): Promise<CategoryWithCount[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-categories");

  if (!isNotionConfigured) return [];

  return await fetchAllCategories();
}

/**
 * Get related blog posts for a given post
 * Based on category and tags similarity
 */
export async function getRelatedBlogPosts(
  post: BlogPost,
  limit = 3,
): Promise<BlogPost[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts", `blog-related-${post.slug}`);

  if (!isNotionConfigured) return [];

  return await fetchRelatedPosts(post, limit);
}

/**
 * Get all blog post slugs for static generation
 */
export async function getAllBlogPostSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-posts");

  if (!isNotionConfigured) return [];

  return await fetchAllPostSlugs();
}

/**
 * Get all blog category names for static generation
 */
export async function getAllBlogCategoryNames(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("blog-categories");

  if (!isNotionConfigured) return [];

  return await fetchAllCategoryNames();
}

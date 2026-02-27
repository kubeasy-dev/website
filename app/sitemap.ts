import { all } from "better-all";
import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { isNotionConfigured } from "@/lib/notion";
import {
  getAllBlogCategoryNames,
  getBlogPosts,
  getChallenges,
  getThemes,
} from "@/server/db/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Fetch all challenges, themes, and blog posts for dynamic routes
  const { challengeData, themes, blogData, blogCategories } = await all({
    async challengeData() {
      return getChallenges();
    },
    async themes() {
      return getThemes();
    },
    async blogData() {
      return isNotionConfigured
        ? getBlogPosts(1, null, 100)
        : { posts: [] as Awaited<ReturnType<typeof getBlogPosts>>["posts"] };
    },
    async blogCategories() {
      return isNotionConfigured ? getAllBlogCategoryNames() : [];
    },
  });
  const { challenges } = challengeData;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/challenges`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/themes`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/get-started`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Challenge pages
  const challengePages: MetadataRoute.Sitemap = challenges.map((challenge) => ({
    url: `${baseUrl}/challenges/${challenge.slug}`,
    lastModified: challenge.updatedAt || challenge.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Theme pages
  const themePages: MetadataRoute.Sitemap = themes.map((theme) => ({
    url: `${baseUrl}/themes/${theme.slug}`,
    lastModified: theme.updatedAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Blog pages
  const blogPages: MetadataRoute.Sitemap = [];

  if (isNotionConfigured && blogData.posts.length > 0) {
    // Individual blog posts
    for (const post of blogData.posts) {
      blogPages.push({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    // Category pages
    for (const category of blogCategories) {
      blogPages.push({
        url: `${baseUrl}/blog/category/${encodeURIComponent(category)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return [...staticPages, ...challengePages, ...themePages, ...blogPages];
}

import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getChallenges, getThemes } from "@/server/db/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.url;

  // Fetch all challenges and themes for dynamic routes
  const [{ challenges }, themes] = await Promise.all([
    getChallenges(),
    getThemes(),
  ]);

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
    lastModified: theme.updatedAt || theme.createdAt || new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...challengePages, ...themePages];
}

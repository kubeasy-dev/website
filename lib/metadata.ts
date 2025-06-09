import type { Metadata } from "next/types";

export function createMetadata(override: Metadata): Metadata {
  return {
    ...override,
    openGraph: {
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      url: new URL("/blog/rss.xml", baseUrl).toString(),
      images: "/banner.png",
      siteName: "Kubeasy",
      ...override.openGraph,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@money_is_shark",
      title: override.title ?? undefined,
      description: override.description ?? undefined,
      images: "/banner.png",
      ...override.twitter,
    },
    alternates: {
      types: {
        "application/rss+xml": [
          {
            title: "Kubeasy Blog",
            url: new URL("/blog/rss.xml", baseUrl).toString(),
          },
        ],
      },
      ...override.alternates,
    },
  };
}

export const baseUrl = process.env.NODE_ENV === "development" || !process.env.VERCEL_URL ? new URL("http://localhost:3000") : new URL(`https://${process.env.VERCEL_URL}`);

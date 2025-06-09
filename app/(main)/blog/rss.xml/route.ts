import { Feed } from "feed";
import { blog } from "@/lib/source";
import { NextResponse } from "next/server";
import { baseUrl } from "@/lib/metadata";

export const revalidate = false;

export function GET() {
  try {
    const feed = new Feed({
      title: "Kubeasy Blog",
      id: `${baseUrl}/blog`,
      link: `${baseUrl}/blog`,
      language: "en",

      image: `${baseUrl}/banner.png`,
      favicon: `${baseUrl}/icon.png`,
      copyright: "All rights reserved 2025, Kubeasy",
    });

    for (const page of blog.getPages().sort((a, b) => {
      return new Date(b.data.date).getTime() - new Date(a.data.date).getTime();
    })) {
      feed.addItem({
        id: page.url,
        title: page.data.title,
        description: page.data.description,
        link: `${baseUrl}${page.url}`,
        date: new Date(page.data.date),

        author: [
          {
            name: page.data.author,
          },
        ],
      });
    }
    return new NextResponse(feed.rss2(), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("Failed to generate RSS feed:", error);
    return new NextResponse("Failed to generate RSS feed", {
      status: 500,
    });
  }
}

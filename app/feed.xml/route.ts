import { siteConfig } from "@/config/site";
import { isNotionConfigured } from "@/lib/notion";
import { getBlogPosts } from "@/server/db/queries";

export async function GET() {
  if (!isNotionConfigured) {
    return new Response("Blog not configured", { status: 404 });
  }

  const { posts } = await getBlogPosts(1, 50); // Get latest 50 posts

  const feedItems = posts
    .map((post) => {
      const pubDate = new Date(post.publishedAt).toUTCString();
      const postUrl = `${siteConfig.url}/blog/${post.slug}`;

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <author>${post.author.name}</author>
      <category><![CDATA[${post.category.name}]]></category>
      ${post.tags.map((tag) => `<category><![CDATA[${tag}]]></category>`).join("\n      ")}
      ${post.cover ? `<enclosure url="${post.cover}" type="image/jpeg" />` : ""}
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${siteConfig.name} Blog</title>
    <link>${siteConfig.url}/blog</link>
    <description>${siteConfig.description}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteConfig.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteConfig.url}/logo.png</url>
      <title>${siteConfig.name}</title>
      <link>${siteConfig.url}</link>
    </image>
    ${feedItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

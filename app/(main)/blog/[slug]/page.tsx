import { Calendar, ChevronLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AuthorCard } from "@/components/blog/author-card";
import { BlockRenderer } from "@/components/blog/blocks";
import { RelatedPosts } from "@/components/blog/related-posts";
import { siteConfig } from "@/config/site";
import { isNotionConfigured } from "@/lib/notion";
import {
  generateMetadata as generateSEOMetadata,
  stringifyJsonLd,
} from "@/lib/seo";
import {
  getAllBlogPostSlugs,
  getBlogPostWithContent,
  getRelatedBlogPosts,
} from "@/server/db/queries";
import { TableOfContentsClient } from "./table-of-contents-client";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  if (!isNotionConfigured) return [{ slug: "_placeholder" }];
  const slugs = await getAllBlogPostSlugs();
  // Must return at least one param for cacheComponents
  if (slugs.length === 0) return [{ slug: "_placeholder" }];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostWithContent(slug);

  if (!post) {
    return generateSEOMetadata({
      title: "Article Not Found",
      noIndex: true,
    });
  }

  return generateSEOMetadata({
    title: post.title,
    description: post.description,
    image: post.cover || undefined,
    url: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    authors: [post.author.name],
    section: post.category.name,
    keywords: [
      ...post.tags,
      post.category.name.toLowerCase(),
      "kubernetes",
      "kubeasy",
    ],
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  if (!isNotionConfigured) {
    notFound();
  }

  const { slug } = await params;
  const post = await getBlogPostWithContent(slug);

  if (!post) {
    notFound();
  }

  // Fetch related posts
  const relatedPosts = await getRelatedBlogPosts(post, 3);

  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = post.blocks
    .filter((b) => b.type === "paragraph" && b.paragraph)
    .reduce((acc, b) => {
      const text =
        b.paragraph?.rich_text.map((t) => t.plain_text).join("") || "";
      return acc + text.split(/\s+/).length;
    }, 0);
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // JSON-LD structured data for blog post
  const blogPostSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: post.cover || `${siteConfig.url}${siteConfig.ogImage}`,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/blog/${post.slug}`,
    },
    articleSection: post.category.name,
    keywords: post.tags.join(", "),
    wordCount,
    timeRequired: `PT${readingTime}M`,
  };

  return (
    <>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is sanitized
        dangerouslySetInnerHTML={{ __html: stringifyJsonLd(blogPostSchema) }}
      />

      <article className="w-full overflow-x-clip">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Back link */}
          <div className="mb-6 sm:mb-8">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground transition-colors text-sm sm:text-base"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Blog
            </Link>
          </div>

          {/* Article header - Centered */}
          <header className="mb-8 sm:mb-12 text-center">
            {/* Category badge */}
            <Link
              href={`/blog/category/${encodeURIComponent(post.category.name)}`}
              className="inline-block mb-4 sm:mb-6"
            >
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary text-primary-foreground neo-border-thick font-bold shadow sm:neo-shadow text-xs sm:text-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                {post.category.name}
              </span>
            </Link>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-balance leading-tight mb-4 sm:mb-6">
              {post.title}
            </h1>

            {/* Description */}
            {post.description && (
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-6 sm:mb-8">
                {post.description}
              </p>
            )}

            {/* Meta bar */}
            <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 text-sm font-medium">
              {/* Author */}
              <div className="flex items-center gap-3">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    className="rounded-full neo-border w-8 h-8 sm:w-10 sm:h-10"
                  />
                ) : (
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-black neo-border text-sm sm:text-base">
                    {post.author.name.charAt(0)}
                  </div>
                )}
                <span className="font-bold">{post.author.name}</span>
              </div>

              <span className="hidden sm:inline text-muted-foreground">•</span>

              <div className="flex items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <time dateTime={post.publishedAt}>{formattedDate}</time>
                </div>

                <span className="text-muted-foreground">•</span>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{readingTime} min read</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-1.5 sm:gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs sm:text-sm font-bold text-muted-foreground bg-secondary neo-border px-2 sm:px-3 py-0.5 sm:py-1"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Mobile Table of Contents */}
          {post.headings.length > 0 && (
            <div className="lg:hidden mb-8">
              <TableOfContentsClient headings={post.headings} collapsible />
            </div>
          )}

          {/* Main content layout */}
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1fr_250px] items-start">
            {/* Article content */}
            <div className="prose-neo max-w-none min-w-0">
              <BlockRenderer blocks={post.blocks} />

              {/* Author bio - Neo-brutalist card */}
              <div className="mt-10">
                <h2 className="text-lg sm:text-xl font-black mb-4 sm:mb-6 flex items-center gap-2">
                  <span className="inline-block w-6 sm:w-8 h-1 bg-primary" />
                  Written by
                </h2>
                <AuthorCard author={post.author} />
              </div>

              {/* Related posts */}
              <Suspense fallback={null}>
                <RelatedPosts posts={relatedPosts} />
              </Suspense>
            </div>

            {/* Sidebar - Table of Contents (Desktop only) */}
            {post.headings.length > 0 && (
              <aside className="hidden lg:block sticky top-28">
                <TableOfContentsClient headings={post.headings} />
              </aside>
            )}
          </div>
        </div>
      </article>
    </>
  );
}

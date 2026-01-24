import { ChevronLeft, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlogCard } from "@/components/blog/blog-card";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { Button } from "@/components/ui/button";
import { isNotionConfigured } from "@/lib/notion";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import {
  getAllBlogCategoryNames,
  getBlogPostsByCategory,
} from "@/server/db/queries";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}

export async function generateStaticParams() {
  if (!isNotionConfigured) return [{ category: "_placeholder" }];
  const categories = await getAllBlogCategoryNames();
  // Must return at least one param for cacheComponents
  if (categories.length === 0) return [{ category: "_placeholder" }];
  return categories.map((category) => ({
    category: encodeURIComponent(category),
  }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const decodedCategory = decodeURIComponent(category);

  return generateSEOMetadata({
    title: `${decodedCategory} Articles`,
    description: `Browse all articles about ${decodedCategory}. Learn Kubernetes and DevOps best practices.`,
    url: `/blog/category/${category}`,
    keywords: [
      decodedCategory.toLowerCase(),
      "kubernetes",
      "kubeasy blog",
      "devops",
    ],
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  if (!isNotionConfigured) {
    notFound();
  }

  const { category } = await params;
  const { page } = await searchParams;
  const decodedCategory = decodeURIComponent(category);
  const currentPage = Math.max(1, Number(page) || 1);

  const { posts, totalPages, totalPosts } = await getBlogPostsByCategory(
    decodedCategory,
    currentPage,
  );

  // If no posts found for this category, 404
  if (totalPosts === 0) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {/* Back link */}
      <div className="mb-8">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/blog">
            <ChevronLeft className="h-4 w-4 mr-1" />
            All Articles
          </Link>
        </Button>
      </div>

      {/* Hero Section */}
      <div className="mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground neo-border-thick font-bold neo-shadow">
          <Tag className="h-4 w-4" />
          <span>{totalPosts} Articles</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-balance">
          {decodedCategory}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed font-bold">
          Explore all articles tagged with {decodedCategory}
        </p>
      </div>

      {/* Posts grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            basePath={`/blog/category/${category}`}
          />
        </div>
      )}
    </div>
  );
}

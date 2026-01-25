import { FileText } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { BlogPagination } from "@/components/blog/blog-pagination";
import { isNotionConfigured } from "@/lib/notion";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";
import { getBlogCategories, getBlogPosts } from "@/server/db/queries";
import { BlogListClient } from "./blog-list-client";

export const metadata: Metadata = generateSEOMetadata({
  title: "Blog",
  description:
    "Learn Kubernetes best practices, tips, and tutorials. Explore our blog for in-depth articles on container orchestration, DevOps, and cloud-native development.",
  url: "/blog",
  keywords: [
    "kubernetes blog",
    "k8s tutorials",
    "kubernetes tips",
    "container orchestration",
    "devops blog",
    "cloud-native",
    "kubernetes best practices",
  ],
});

interface BlogPageProps {
  searchParams: Promise<{ page?: string; category?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Check if Notion is configured
  if (!isNotionConfigured) {
    return (
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="py-24 text-center">
          <h1 className="text-4xl font-black mb-4">Blog Coming Soon</h1>
          <p className="text-muted-foreground text-lg">
            We&apos;re working on bringing you great content. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  const { page, category } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const selectedCategory = category || null;

  const [{ posts, totalPages, totalPosts }, categories] = await Promise.all([
    getBlogPosts(currentPage, selectedCategory),
    getBlogCategories(),
  ]);

  return (
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Hero Section */}
      <div className="mb-12 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-foreground neo-border-thick font-bold neo-shadow">
          <FileText className="h-4 w-4" />
          <span>{totalPosts} Articles</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-balance">
          Kubeasy Blog
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed font-bold">
          Deep dives into Kubernetes, DevOps practices, and cloud-native
          development. Learn from real-world experiences and best practices.
        </p>
      </div>

      {/* Blog list with search and filters */}
      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-96 rounded-xl neo-border-thick bg-muted animate-pulse"
              />
            ))}
          </div>
        }
      >
        <BlogListClient
          posts={posts}
          categories={categories}
          selectedCategory={selectedCategory}
          totalPosts={totalPosts}
        />
      </Suspense>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12">
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            category={selectedCategory}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { BlogList } from "@/components/blog/blog-list";
import type { BlogPost, CategoryWithCount } from "@/types/blog";

interface BlogListClientProps {
  posts: BlogPost[];
  categories: CategoryWithCount[];
  selectedCategory: string | null;
  totalPosts: number;
}

export function BlogListClient({
  posts,
  categories,
  selectedCategory,
  totalPosts,
}: BlogListClientProps) {
  return (
    <BlogList
      posts={posts}
      categories={categories}
      selectedCategory={selectedCategory}
      totalPosts={totalPosts}
      showSearch
      showFilters
    />
  );
}

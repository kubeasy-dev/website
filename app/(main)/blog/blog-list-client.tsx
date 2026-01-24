"use client";

import { BlogList } from "@/components/blog/blog-list";
import type { BlogPost, CategoryWithCount } from "@/types/blog";

interface BlogListClientProps {
  posts: BlogPost[];
  categories: CategoryWithCount[];
}

export function BlogListClient({ posts, categories }: BlogListClientProps) {
  return (
    <BlogList posts={posts} categories={categories} showSearch showFilters />
  );
}

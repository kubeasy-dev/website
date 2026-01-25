"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogPost, CategoryWithCount } from "@/types/blog";
import { BlogCard } from "./blog-card";
import { BlogSearch } from "./blog-search";

interface BlogListProps {
  posts: BlogPost[];
  categories: CategoryWithCount[];
  selectedCategory?: string | null;
  totalPosts?: number;
  showSearch?: boolean;
  showFilters?: boolean;
}

export function BlogList({
  posts,
  categories,
  selectedCategory = null,
  totalPosts,
  showSearch = true,
  showFilters = true,
}: BlogListProps) {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<BlogPost[] | null>(null);

  // Filter posts by search (category is now URL-based)
  const filteredPosts = useMemo(() => {
    return searchResults ?? posts;
  }, [posts, searchResults]);

  const handleSearchResults = useCallback((results: BlogPost[] | null) => {
    setSearchResults(results);
  }, []);

  const handleCategoryClick = useCallback(
    (category: string | null) => {
      if (category === null) {
        router.push("/blog");
      } else if (category === selectedCategory) {
        router.push("/blog");
      } else {
        router.push(`/blog?category=${encodeURIComponent(category)}`);
      }
    },
    [router, selectedCategory],
  );

  // Separate pinned posts for featured display
  const pinnedPosts = filteredPosts.filter((p) => p.isPinned);
  const regularPosts = filteredPosts.filter((p) => !p.isPinned);

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <div className="space-y-4">
        {showSearch && (
          <BlogSearch posts={posts} onSearchResults={handleSearchResults} />
        )}

        {showFilters && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedCategory === null ? "default" : "outline"}
              className="cursor-pointer neo-border hover:bg-muted transition-colors"
              onClick={() => handleCategoryClick(null)}
            >
              All ({totalPosts ?? posts.length})
            </Badge>
            {categories.map((cat) => (
              <Badge
                key={cat.name}
                variant={selectedCategory === cat.name ? "default" : "outline"}
                className={cn(
                  "cursor-pointer neo-border hover:bg-muted transition-colors",
                  selectedCategory === cat.name && "pointer-events-none",
                )}
                onClick={() => handleCategoryClick(cat.name)}
              >
                {cat.name} ({cat.count})
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results info */}
      {searchResults !== null && (
        <p className="text-sm text-muted-foreground">
          Found {filteredPosts.length} article
          {filteredPosts.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* No results */}
      {filteredPosts.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-xl font-bold">No articles found</p>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {/* Posts grid */}
      {filteredPosts.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Featured/Pinned posts */}
          {pinnedPosts.map((post, index) => (
            <BlogCard
              key={post.id}
              post={post}
              featured={index === 0 && pinnedPosts.length === 1}
            />
          ))}

          {/* Regular posts */}
          {regularPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

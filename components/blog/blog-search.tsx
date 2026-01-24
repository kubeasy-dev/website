"use client";

import Fuse from "fuse.js";
import { Search, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BlogPost } from "@/types/blog";

interface BlogSearchProps {
  posts: BlogPost[];
  onSearchResults: (results: BlogPost[] | null) => void;
  placeholder?: string;
}

export function BlogSearch({
  posts,
  onSearchResults,
  placeholder = "Search articles...",
}: BlogSearchProps) {
  const [query, setQuery] = useState("");

  // Initialize Fuse.js search
  const fuse = useMemo(() => {
    return new Fuse(posts, {
      keys: [
        { name: "title", weight: 2 },
        { name: "description", weight: 1.5 },
        { name: "tags", weight: 1 },
        { name: "category.name", weight: 1 },
        { name: "author.name", weight: 0.5 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
  }, [posts]);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (value.trim() === "") {
        onSearchResults(null);
        return;
      }

      const results = fuse.search(value);
      onSearchResults(results.map((r) => r.item));
    },
    [fuse, onSearchResults],
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    onSearchResults(null);
  }, [onSearchResults]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10 neo-border"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          onClick={clearSearch}
          className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}

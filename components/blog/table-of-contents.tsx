"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TableOfContentsItem } from "@/types/blog";

interface TableOfContentsProps {
  headings: TableOfContentsItem[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      },
    );

    // Observe all heading elements
    for (const heading of headings) {
      const element = document.getElementById(slugify(heading.text));
      if (element) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      className="neo-border-thick neo-shadow bg-secondary p-6"
      aria-label="Table of contents"
    >
      <h2 className="mb-4 text-sm font-black uppercase tracking-wider flex items-center gap-2">
        <span className="inline-block w-4 h-1 bg-primary" />
        On this page
      </h2>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => {
          const id = slugify(heading.text);
          const isActive = activeId === id;
          return (
            <li key={heading.id}>
              <a
                href={`#${id}`}
                className={cn(
                  "block py-2 px-3 font-medium transition-all",
                  heading.level === 2 && "ml-3",
                  heading.level === 3 && "ml-6",
                  isActive
                    ? "bg-primary text-primary-foreground neo-border font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background neo-border border-transparent",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

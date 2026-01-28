"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TableOfContentsItem } from "@/types/blog";

interface TableOfContentsProps {
  headings: TableOfContentsItem[];
  collapsible?: boolean;
}

export function TableOfContents({
  headings,
  collapsible = false,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpen, setIsOpen] = useState(!collapsible);

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

  const headerContent = (
    <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2">
      <span className="inline-block w-3 sm:w-4 h-1 bg-primary" />
      On this page
      {collapsible && (
        <ChevronDown
          className={cn(
            "ml-auto h-4 w-4 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      )}
    </h2>
  );

  return (
    <nav
      className="neo-border-thick shadow sm:neo-shadow bg-secondary p-4 sm:p-6"
      aria-label="Table of contents"
    >
      {collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left"
        >
          {headerContent}
        </button>
      ) : (
        <div className="mb-4">{headerContent}</div>
      )}

      {isOpen && (
        <ul
          className={cn("space-y-1 text-xs sm:text-sm", collapsible && "mt-4")}
        >
          {headings.map((heading) => {
            const id = slugify(heading.text);
            const isActive = activeId === id;
            return (
              <li key={heading.id}>
                <a
                  href={`#${id}`}
                  onClick={() => collapsible && setIsOpen(false)}
                  className={cn(
                    "block py-1.5 sm:py-2 px-2 sm:px-3 font-medium transition-all",
                    heading.level === 2 && "ml-2 sm:ml-3",
                    heading.level === 3 && "ml-4 sm:ml-6",
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
      )}
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

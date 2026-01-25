import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  category?: string | null;
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = "/blog",
  category = null,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  // Generate page numbers to display
  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (category) params.set("category", category);
    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Blog pagination"
    >
      {/* Previous button */}
      <Button
        variant="outline"
        size="icon"
        asChild={currentPage > 1}
        disabled={currentPage <= 1}
        className="neo-border"
      >
        {currentPage > 1 ? (
          <Link href={getPageUrl(currentPage - 1)} aria-label="Previous page">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
      </Button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((item, index) =>
          item === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-muted-foreground"
            >
              ...
            </span>
          ) : (
            <Button
              key={item}
              variant={currentPage === item ? "default" : "outline"}
              size="icon"
              asChild={currentPage !== item}
              className={cn(
                "neo-border",
                currentPage === item && "pointer-events-none",
              )}
            >
              {currentPage === item ? (
                <span aria-current="page">{item}</span>
              ) : (
                <Link href={getPageUrl(item)} aria-label={`Page ${item}`}>
                  {item}
                </Link>
              )}
            </Button>
          ),
        )}
      </div>

      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        asChild={currentPage < totalPages}
        disabled={currentPage >= totalPages}
        className="neo-border"
      >
        {currentPage < totalPages ? (
          <Link href={getPageUrl(currentPage + 1)} aria-label="Next page">
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </nav>
  );
}

function generatePageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const delta = 1; // Pages to show on each side of current

  // Always show first page
  pages.push(1);

  // Add ellipsis after first page if needed
  if (current - delta > 2) {
    pages.push("...");
  }

  // Add pages around current
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    pages.push(i);
  }

  // Add ellipsis before last page if needed
  if (current + delta < total - 1) {
    pages.push("...");
  }

  // Always show last page if more than 1 page
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

"use client";

import { TableOfContents } from "@/components/blog/table-of-contents";
import type { TableOfContentsItem } from "@/types/blog";

interface TableOfContentsClientProps {
  headings: TableOfContentsItem[];
}

export function TableOfContentsClient({
  headings,
}: TableOfContentsClientProps) {
  return <TableOfContents headings={headings} />;
}

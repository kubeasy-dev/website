"use client";

import { TableOfContents } from "@/components/blog/table-of-contents";
import type { TableOfContentsItem } from "@/types/blog";

interface TableOfContentsClientProps {
  headings: TableOfContentsItem[];
  collapsible?: boolean;
}

export function TableOfContentsClient({
  headings,
  collapsible = false,
}: TableOfContentsClientProps) {
  return <TableOfContents headings={headings} collapsible={collapsible} />;
}

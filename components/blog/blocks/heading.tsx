import { Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotionBlock } from "@/types/blog";
import { RichText } from "./text";

interface HeadingProps {
  block: NotionBlock;
  level: 1 | 2 | 3;
}

export function Heading({ block, level }: HeadingProps) {
  const data =
    level === 1
      ? block.heading_1
      : level === 2
        ? block.heading_2
        : block.heading_3;

  if (!data) return null;

  const text = data.rich_text.map((t) => t.plain_text).join("");
  const id = slugify(text);

  const baseClasses = "group relative scroll-mt-24";
  const headingClasses = {
    1: "text-3xl md:text-4xl font-black mt-12 mb-6 flex items-center gap-3",
    2: "text-2xl md:text-3xl font-black mt-10 mb-4 flex items-center gap-3",
    3: "text-xl md:text-2xl font-bold mt-8 mb-3 flex items-center gap-2",
  };

  const accentClasses = {
    1: "w-10 h-1.5 bg-primary",
    2: "w-6 h-1 bg-primary",
    3: "w-4 h-1 bg-muted-foreground",
  };

  const Tag = `h${level}` as const;

  return (
    <Tag id={id} className={cn(baseClasses, headingClasses[level])}>
      <span
        className={cn("inline-block flex-shrink-0", accentClasses[level])}
      />
      <span className="flex-1">
        <RichText richText={data.rich_text} />
      </span>
      <a
        href={`#${id}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
        aria-label={`Link to ${text}`}
      >
        <Hash
          className={cn(
            level === 1 ? "h-6 w-6" : level === 2 ? "h-5 w-5" : "h-4 w-4",
          )}
        />
      </a>
    </Tag>
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

import { Quote as QuoteIcon } from "lucide-react";
import type { NotionBlock } from "@/types/blog";
import { RichText } from "./text";

interface QuoteProps {
  block: NotionBlock;
}

export function Quote({ block }: QuoteProps) {
  if (!block.quote) return null;

  return (
    <blockquote className="my-8 relative neo-border-thick neo-shadow bg-secondary p-6 pl-8">
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary" />
      {/* Quote icon */}
      <QuoteIcon className="absolute -top-3 -left-3 h-8 w-8 text-primary bg-background p-1 neo-border" />
      <div className="text-lg leading-relaxed font-medium italic">
        <RichText richText={block.quote.rich_text} />
      </div>
    </blockquote>
  );
}

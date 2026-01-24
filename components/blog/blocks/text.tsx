import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RichTextItem } from "@/types/blog";

interface RichTextProps {
  richText: RichTextItem[];
  className?: string;
}

export function RichText({ richText, className }: RichTextProps) {
  if (!richText || richText.length === 0) {
    return null;
  }

  return (
    <span className={className}>
      {richText.map((item, index) => (
        <RichTextSpan key={index} item={item} />
      ))}
    </span>
  );
}

function RichTextSpan({ item }: { item: RichTextItem }) {
  const { annotations, plain_text, href, text } = item;
  const link = href || text?.link?.url;

  let content: React.ReactNode = plain_text;

  // Apply annotations
  if (annotations.code) {
    content = (
      <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm neo-border-thin">
        {content}
      </code>
    );
  }
  if (annotations.bold) {
    content = <strong className="font-bold">{content}</strong>;
  }
  if (annotations.italic) {
    content = <em className="italic">{content}</em>;
  }
  if (annotations.strikethrough) {
    content = <s className="line-through">{content}</s>;
  }
  if (annotations.underline) {
    content = <u className="underline">{content}</u>;
  }

  // Apply color (Notion colors)
  const colorClass = getColorClass(annotations.color);

  // Wrap in link if present
  if (link) {
    const isExternal = link.startsWith("http");
    if (isExternal) {
      content = (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
            colorClass,
          )}
        >
          {content}
        </a>
      );
    } else {
      content = (
        <Link
          href={link}
          className={cn(
            "text-primary underline underline-offset-4 hover:text-primary/80 transition-colors",
            colorClass,
          )}
        >
          {content}
        </Link>
      );
    }
  } else if (colorClass) {
    content = <span className={colorClass}>{content}</span>;
  }

  return <>{content}</>;
}

function getColorClass(color: string): string {
  switch (color) {
    case "gray":
      return "text-gray-500";
    case "brown":
      return "text-amber-700";
    case "orange":
      return "text-orange-500";
    case "yellow":
      return "text-yellow-600";
    case "green":
      return "text-green-600";
    case "blue":
      return "text-blue-600";
    case "purple":
      return "text-purple-600";
    case "pink":
      return "text-pink-600";
    case "red":
      return "text-red-600";
    case "gray_background":
      return "bg-gray-100 dark:bg-gray-800";
    case "brown_background":
      return "bg-amber-100 dark:bg-amber-900/30";
    case "orange_background":
      return "bg-orange-100 dark:bg-orange-900/30";
    case "yellow_background":
      return "bg-yellow-100 dark:bg-yellow-900/30";
    case "green_background":
      return "bg-green-100 dark:bg-green-900/30";
    case "blue_background":
      return "bg-blue-100 dark:bg-blue-900/30";
    case "purple_background":
      return "bg-purple-100 dark:bg-purple-900/30";
    case "pink_background":
      return "bg-pink-100 dark:bg-pink-900/30";
    case "red_background":
      return "bg-red-100 dark:bg-red-900/30";
    default:
      return "";
  }
}

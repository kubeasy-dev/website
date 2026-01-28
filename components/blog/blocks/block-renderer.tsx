import type { NotionBlock, RichTextItem } from "@/types/blog";
import { Callout } from "./callout";
import { ChallengeBookmark } from "./challenge-bookmark";
import { CodeBlock } from "./code-block";
import { Heading } from "./heading";
import { ImageBlock } from "./image";
import {
  BulletedList,
  BulletedListItem,
  NumberedList,
  NumberedListItem,
  TodoItem,
  TodoList,
} from "./list";
import { Quote } from "./quote";
import { Table, TableRow } from "./table";
import { RichText } from "./text";

interface BlockRendererProps {
  blocks: NotionBlock[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  // Group consecutive list items
  const groupedBlocks = groupListItems(blocks);

  return (
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {groupedBlocks.map((item) => {
        if (item.type === "bulleted_list") {
          return (
            <BulletedList key={item.key}>
              {item.items.map((block) => (
                <BulletedListItem key={block.id} block={block}>
                  {block.children && <BlockRenderer blocks={block.children} />}
                </BulletedListItem>
              ))}
            </BulletedList>
          );
        }

        if (item.type === "numbered_list") {
          return (
            <NumberedList key={item.key}>
              {item.items.map((block) => (
                <NumberedListItem key={block.id} block={block}>
                  {block.children && <BlockRenderer blocks={block.children} />}
                </NumberedListItem>
              ))}
            </NumberedList>
          );
        }

        if (item.type === "to_do_list") {
          return (
            <TodoList key={item.key}>
              {item.items.map((block) => (
                <TodoItem key={block.id} block={block}>
                  {block.children && <BlockRenderer blocks={block.children} />}
                </TodoItem>
              ))}
            </TodoList>
          );
        }

        // Single block
        return <Block key={item.block.id} block={item.block} />;
      })}
    </div>
  );
}

interface BlockProps {
  block: NotionBlock;
}

function Block({ block }: BlockProps) {
  switch (block.type) {
    case "paragraph": {
      if (!block.paragraph) return null;
      if (block.paragraph.rich_text.length === 0) {
        return <div className="h-4" />;
      }

      // Check if paragraph contains only a challenge link
      const challengeSlug = extractChallengeLinkFromParagraph(
        block.paragraph.rich_text,
      );
      if (challengeSlug) {
        return <ChallengeBookmark slug={challengeSlug} />;
      }

      return (
        <p className="my-4 leading-relaxed">
          <RichText richText={block.paragraph.rich_text} />
        </p>
      );
    }

    case "heading_1":
      return <Heading block={block} level={1} />;

    case "heading_2":
      return <Heading block={block} level={2} />;

    case "heading_3":
      return <Heading block={block} level={3} />;

    case "code":
      return <CodeBlock block={block} />;

    case "quote":
      return <Quote block={block} />;

    case "callout":
      return <Callout block={block} />;

    case "divider":
      return null;

    case "image":
      return <ImageBlock block={block} />;

    case "video":
      return <VideoBlock block={block} />;

    case "bookmark":
      return <BookmarkBlock block={block} />;

    case "table":
      return (
        <Table block={block}>
          {block.children?.map((row, index) => (
            <TableRow
              key={row.id}
              block={row}
              isHeader={block.table?.has_column_header && index === 0}
              isFirstColumn={block.table?.has_row_header}
            />
          ))}
        </Table>
      );

    case "toggle":
      return <ToggleBlock block={block} />;

    case "column_list":
      return (
        <div className="my-6 grid gap-4 md:grid-cols-2">
          {block.children?.map((column) => (
            <div key={column.id}>
              {column.children && <BlockRenderer blocks={column.children} />}
            </div>
          ))}
        </div>
      );

    default:
      // Unsupported block type
      return null;
  }
}

// Video block component
function VideoBlock({ block }: BlockProps) {
  if (!block.video) return null;

  const { type, file, external } = block.video;
  const url = type === "file" ? file?.url : external?.url;

  if (!url) return null;

  // Check if it's a YouTube or Vimeo URL for embedding
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
  );
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);

  if (youtubeMatch) {
    return (
      <div className="my-6 aspect-video overflow-hidden rounded-lg neo-border">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  if (vimeoMatch) {
    return (
      <div className="my-6 aspect-video overflow-hidden rounded-lg neo-border">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          title="Vimeo video"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  // Fallback to native video
  return (
    <div className="my-6 overflow-hidden rounded-lg neo-border">
      <video src={url} controls className="w-full">
        <track kind="captions" />
      </video>
    </div>
  );
}

// Bookmark block component
function BookmarkBlock({ block }: BlockProps) {
  if (!block.bookmark) return null;

  const { url, caption } = block.bookmark;

  // Check if it's a challenge link
  const challengeMatch = url.match(
    /(?:https?:\/\/(?:www\.)?kubeasy\.dev)?\/challenges\/([a-z0-9-]+)/,
  );

  if (challengeMatch) {
    const slug = challengeMatch[1];
    return <ChallengeBookmark slug={slug} caption={caption} />;
  }

  return (
    <div className="my-6">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg neo-border p-4 hover:bg-muted/50 transition-colors"
      >
        <span className="text-sm text-primary break-all">{url}</span>
        {caption && caption.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">
            <RichText richText={caption} />
          </p>
        )}
      </a>
    </div>
  );
}

// Toggle block component (details/summary)
function ToggleBlock({ block }: BlockProps) {
  if (!block.toggle) return null;

  return (
    <details className="my-4 rounded-lg neo-border p-4 group">
      <summary className="cursor-pointer font-medium list-none flex items-center gap-2">
        <span className="text-muted-foreground transition-transform group-open:rotate-90">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </span>
        <RichText richText={block.toggle.rich_text} />
      </summary>
      {block.children && (
        <div className="mt-4 pl-6">
          <BlockRenderer blocks={block.children} />
        </div>
      )}
    </details>
  );
}

// Type definitions for grouped blocks
type GroupedItem =
  | { type: "single"; block: NotionBlock }
  | { type: "bulleted_list"; key: string; items: NotionBlock[] }
  | { type: "numbered_list"; key: string; items: NotionBlock[] }
  | { type: "to_do_list"; key: string; items: NotionBlock[] };

// Helper to group consecutive list items
function groupListItems(blocks: NotionBlock[]): GroupedItem[] {
  const result: GroupedItem[] = [];
  let currentList: NotionBlock[] = [];
  let currentListType:
    | "bulleted_list_item"
    | "numbered_list_item"
    | "to_do"
    | null = null;

  for (const block of blocks) {
    if (
      block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item" ||
      block.type === "to_do"
    ) {
      if (currentListType === block.type) {
        currentList.push(block);
      } else {
        // Flush previous list
        if (currentList.length > 0 && currentListType) {
          result.push(createListGroup(currentListType, currentList));
        }
        currentList = [block];
        currentListType = block.type;
      }
    } else {
      // Flush previous list
      if (currentList.length > 0 && currentListType) {
        result.push(createListGroup(currentListType, currentList));
        currentList = [];
        currentListType = null;
      }
      result.push({ type: "single", block });
    }
  }

  // Flush remaining list
  if (currentList.length > 0 && currentListType) {
    result.push(createListGroup(currentListType, currentList));
  }

  return result;
}

function createListGroup(
  type: "bulleted_list_item" | "numbered_list_item" | "to_do",
  items: NotionBlock[],
): GroupedItem {
  const key = items.map((b) => b.id).join("-");
  switch (type) {
    case "bulleted_list_item":
      return { type: "bulleted_list", key, items };
    case "numbered_list_item":
      return { type: "numbered_list", key, items };
    case "to_do":
      return { type: "to_do_list", key, items };
  }
}

// Helper to detect if a paragraph contains only a challenge link
// This allows using a simple link in Notion that gets rendered as a ChallengeBookmark
function extractChallengeLinkFromParagraph(
  richText: RichTextItem[],
): string | null {
  // Must have exactly one text item with a link
  if (richText.length !== 1) return null;

  const item = richText[0];
  const link = item.href || item.text?.link?.url;

  if (!link) return null;

  // Check if it's a challenge link
  const challengeMatch = link.match(
    /(?:https?:\/\/(?:www\.)?kubeasy\.dev)?\/challenges\/([a-z0-9-]+)/,
  );

  if (!challengeMatch) return null;

  // Only transform if the text looks like a CTA (contains "challenge", "start", "try", etc.)
  const text = item.plain_text.toLowerCase();
  const ctaKeywords = [
    "challenge",
    "start",
    "try",
    "practice",
    "→",
    "➡",
    "hands-on",
  ];
  const isCta = ctaKeywords.some((keyword) => text.includes(keyword));

  if (!isCta) return null;

  return challengeMatch[1];
}

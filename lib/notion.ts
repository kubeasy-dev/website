import { Client, isFullDataSource, isFullPage } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  PartialBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { env } from "@/env";
import { captureServerException } from "@/lib/analytics-server";
import type {
  Author,
  BlogPost,
  BlogPostWithContent,
  CategoryInfo,
  CategoryWithCount,
  NotionBlock,
  RichTextItem,
  TableOfContentsItem,
} from "@/types/blog";

// Check if Notion is configured
export const isNotionConfigured = Boolean(
  env.NOTION_INTEGRATION_TOKEN &&
    env.NOTION_BLOG_DATASOURCE_ID &&
    env.NOTION_PEOPLE_DATASOURCE_ID,
);

// Create Notion client (only if configured)
// Using a function to get the client ensures proper type narrowing
let _notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!_notionClient && isNotionConfigured && env.NOTION_INTEGRATION_TOKEN) {
    _notionClient = new Client({ auth: env.NOTION_INTEGRATION_TOKEN });
  }
  if (!_notionClient) {
    throw new Error("Notion client is not configured");
  }
  return _notionClient;
}

// Database IDs
const BLOG_DATABASE_ID = env.NOTION_BLOG_DATASOURCE_ID ?? "";
// Reserved for future use when fetching authors independently
const _PEOPLE_DATABASE_ID = env.NOTION_PEOPLE_DATASOURCE_ID ?? "";

// Default author for when no author is linked
const DEFAULT_AUTHOR: Author = {
  id: "default",
  name: "Kubeasy Team",
  bio: "The Kubeasy team is dedicated to helping developers learn Kubernetes through hands-on challenges.",
  avatar: "/images/kubeasy-logo.png",
};

// Helper to extract plain text from rich text array
function extractPlainText(richText: RichTextItemResponse[]): string {
  return richText.map((item) => item.plain_text).join("");
}

// Helper to convert Notion rich text to our format
function convertRichText(richText: RichTextItemResponse[]): RichTextItem[] {
  return richText.map((item) => ({
    type: item.type as RichTextItem["type"],
    text:
      item.type === "text"
        ? {
            content: item.text.content,
            link: item.text.link,
          }
        : undefined,
    annotations: item.annotations,
    plain_text: item.plain_text,
    href: item.href,
  }));
}

// Helper to extract file URL (handles both file and external types)
function extractFileUrl(
  file:
    | { type: "file"; file: { url: string } }
    | { type: "external"; external: { url: string } }
    | null
    | undefined,
): string {
  if (!file) return "";
  if (file.type === "file") return file.file.url;
  if (file.type === "external") return file.external.url;
  return "";
}

// Helper to get cover image URL from a page
function getCoverUrl(page: PageObjectResponse): string {
  if (!page.cover) return "";
  if (page.cover.type === "file") return page.cover.file.url;
  if (page.cover.type === "external") return page.cover.external.url;
  return "";
}

// Helper to extract property value safely
function getPropertyValue(
  page: PageObjectResponse,
  propertyName: string,
): PageObjectResponse["properties"][string] | undefined {
  return page.properties[propertyName];
}

// Convert a Notion page to a BlogPost
async function pageToPost(page: PageObjectResponse): Promise<BlogPost | null> {
  try {
    // Extract required fields
    const titleProp = getPropertyValue(page, "Nom");
    if (!titleProp || titleProp.type !== "title") return null;
    const title = extractPlainText(titleProp.title);

    const slugProp = getPropertyValue(page, "slug");
    if (!slugProp || slugProp.type !== "rich_text") return null;
    const slug = extractPlainText(slugProp.rich_text);
    if (!slug) return null;

    // Extract optional fields
    const descProp = getPropertyValue(page, "description");
    const description =
      descProp?.type === "rich_text"
        ? extractPlainText(descProp.rich_text)
        : "";

    const categoryProp = getPropertyValue(page, "category");
    const category: CategoryInfo =
      categoryProp?.type === "select" && categoryProp.select
        ? { name: categoryProp.select.name, color: categoryProp.select.color }
        : { name: "General", color: "default" };

    const tagsProp = getPropertyValue(page, "tags");
    const tags =
      tagsProp?.type === "multi_select"
        ? tagsProp.multi_select.map((tag) => tag.name)
        : [];

    const pinnedProp = getPropertyValue(page, "pinned");
    const isPinned =
      pinnedProp?.type === "checkbox" ? pinnedProp.checkbox : false;

    const dateProp = getPropertyValue(page, "publication_date");
    const publishedAt =
      dateProp?.type === "date" && dateProp.date
        ? dateProp.date.start
        : page.created_time;

    // Get cover image
    const cover = getCoverUrl(page);

    // Get author from relation
    let author = DEFAULT_AUTHOR;
    const authorProp = getPropertyValue(page, "author");
    if (authorProp?.type === "relation" && authorProp.relation.length > 0) {
      const authorId = authorProp.relation[0].id;
      const fetchedAuthor = await getAuthor(authorId);
      if (fetchedAuthor) {
        author = fetchedAuthor;
      }
    }

    return {
      id: page.id,
      slug,
      title,
      description,
      cover,
      category,
      tags,
      publishedAt,
      updatedAt: page.last_edited_time,
      isPinned,
      author,
    };
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "notion.pageToPost",
      pageId: page.id,
    });
    return null;
  }
}

// Get author by ID from People database
async function getAuthor(authorId: string): Promise<Author | null> {
  if (!isNotionConfigured) return null;

  try {
    const page = await getNotionClient().pages.retrieve({ page_id: authorId });
    if (!isFullPage(page)) return null;

    const props = page.properties;

    const nameProp = props.Nom;
    if (!nameProp || nameProp.type !== "title") return null;
    const name = extractPlainText(nameProp.title);

    const bioProp = props.bio;
    const bio =
      bioProp?.type === "rich_text" ? extractPlainText(bioProp.rich_text) : "";

    const avatarProp = props.avatar;
    let avatar = "";
    if (avatarProp?.type === "files" && avatarProp.files.length > 0) {
      const file = avatarProp.files[0];
      avatar = extractFileUrl(
        file as
          | { type: "file"; file: { url: string } }
          | { type: "external"; external: { url: string } },
      );
    }

    const twitterProp = props.twitter;
    const twitter =
      twitterProp?.type === "url" ? (twitterProp.url ?? undefined) : undefined;

    const githubProp = props.github;
    const github =
      githubProp?.type === "url" ? (githubProp.url ?? undefined) : undefined;

    return {
      id: authorId,
      name,
      bio,
      avatar,
      twitter,
      github,
    };
  } catch {
    return null;
  }
}

// Convert Notion block to our block format
function convertBlock(
  block: BlockObjectResponse | PartialBlockObjectResponse,
): NotionBlock | null {
  if (!("type" in block)) return null;

  const result: NotionBlock = {
    id: block.id,
    type: block.type as NotionBlock["type"],
    has_children: "has_children" in block ? block.has_children : false,
  };

  // Type-safe block content extraction
  const b = block as BlockObjectResponse;

  switch (b.type) {
    case "paragraph":
      result.paragraph = {
        rich_text: convertRichText(b.paragraph.rich_text),
      };
      break;
    case "heading_1":
      result.heading_1 = {
        rich_text: convertRichText(b.heading_1.rich_text),
        is_toggleable: b.heading_1.is_toggleable,
      };
      break;
    case "heading_2":
      result.heading_2 = {
        rich_text: convertRichText(b.heading_2.rich_text),
        is_toggleable: b.heading_2.is_toggleable,
      };
      break;
    case "heading_3":
      result.heading_3 = {
        rich_text: convertRichText(b.heading_3.rich_text),
        is_toggleable: b.heading_3.is_toggleable,
      };
      break;
    case "bulleted_list_item":
      result.bulleted_list_item = {
        rich_text: convertRichText(b.bulleted_list_item.rich_text),
      };
      break;
    case "numbered_list_item":
      result.numbered_list_item = {
        rich_text: convertRichText(b.numbered_list_item.rich_text),
      };
      break;
    case "to_do":
      result.to_do = {
        rich_text: convertRichText(b.to_do.rich_text),
        checked: b.to_do.checked,
      };
      break;
    case "toggle":
      result.toggle = {
        rich_text: convertRichText(b.toggle.rich_text),
      };
      break;
    case "code":
      result.code = {
        rich_text: convertRichText(b.code.rich_text),
        language: b.code.language,
        caption: convertRichText(b.code.caption),
      };
      break;
    case "quote":
      result.quote = {
        rich_text: convertRichText(b.quote.rich_text),
      };
      break;
    case "callout": {
      const calloutIcon = b.callout.icon;
      let iconValue:
        | { type: "emoji"; emoji: string }
        | { type: "external"; external: { url: string } }
        | undefined;
      if (calloutIcon?.type === "emoji") {
        iconValue = { type: "emoji", emoji: calloutIcon.emoji };
      } else if (calloutIcon?.type === "external") {
        iconValue = {
          type: "external",
          external: { url: calloutIcon.external.url },
        };
      }
      result.callout = {
        rich_text: convertRichText(b.callout.rich_text),
        icon: iconValue,
        color: b.callout.color,
      };
      break;
    }
    case "divider":
      result.divider = {};
      break;
    case "image":
      result.image = {
        type: b.image.type as "file" | "external",
        file:
          b.image.type === "file"
            ? { url: b.image.file.url, expiry_time: b.image.file.expiry_time }
            : undefined,
        external:
          b.image.type === "external"
            ? { url: b.image.external.url }
            : undefined,
        caption: convertRichText(b.image.caption),
      };
      break;
    case "video":
      result.video = {
        type: b.video.type as "file" | "external",
        file: b.video.type === "file" ? { url: b.video.file.url } : undefined,
        external:
          b.video.type === "external"
            ? { url: b.video.external.url }
            : undefined,
      };
      break;
    case "bookmark":
      result.bookmark = {
        url: b.bookmark.url,
        caption: convertRichText(b.bookmark.caption),
      };
      break;
    case "table":
      result.table = {
        table_width: b.table.table_width,
        has_column_header: b.table.has_column_header,
        has_row_header: b.table.has_row_header,
      };
      break;
    case "table_row":
      result.table_row = {
        cells: b.table_row.cells.map((cell) => convertRichText(cell)),
      };
      break;
    case "column_list":
      result.column_list = {};
      break;
    case "column":
      result.column = {};
      break;
  }

  return result;
}

// Recursively fetch all blocks for a page
async function fetchBlocks(pageId: string): Promise<NotionBlock[]> {
  if (!isNotionConfigured) return [];

  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  try {
    do {
      const response = await getNotionClient().blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
        page_size: 100,
      });

      for (const block of response.results) {
        const converted = convertBlock(block);
        if (converted) {
          // Recursively fetch children if needed
          if (converted.has_children) {
            converted.children = await fetchBlocks(block.id);
          }
          blocks.push(converted);
        }
      }

      cursor = response.has_more
        ? (response.next_cursor ?? undefined)
        : undefined;
    } while (cursor);
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "notion.fetchBlocks",
      pageId,
    });
  }

  return blocks;
}

// Extract headings for table of contents
function extractHeadings(blocks: NotionBlock[]): TableOfContentsItem[] {
  const headings: TableOfContentsItem[] = [];

  function traverse(blockList: NotionBlock[]) {
    for (const block of blockList) {
      if (block.type === "heading_1" && block.heading_1) {
        headings.push({
          id: block.id,
          text: block.heading_1.rich_text.map((t) => t.plain_text).join(""),
          level: 1,
        });
      } else if (block.type === "heading_2" && block.heading_2) {
        headings.push({
          id: block.id,
          text: block.heading_2.rich_text.map((t) => t.plain_text).join(""),
          level: 2,
        });
      } else if (block.type === "heading_3" && block.heading_3) {
        headings.push({
          id: block.id,
          text: block.heading_3.rich_text.map((t) => t.plain_text).join(""),
          level: 3,
        });
      }

      if (block.children) {
        traverse(block.children);
      }
    }
  }

  traverse(blocks);
  return headings;
}

/**
 * Get all published blog posts
 * @param includeDrafts - Include drafts (only in development)
 */
export async function getAllPosts(includeDrafts = false): Promise<BlogPost[]> {
  if (!isNotionConfigured || !BLOG_DATABASE_ID) return [];

  const showDrafts = includeDrafts && process.env.NODE_ENV === "development";

  try {
    const response = await getNotionClient().dataSources.query({
      data_source_id: BLOG_DATABASE_ID,
      filter: showDrafts
        ? undefined
        : {
            property: "status",
            select: { equals: "Posted" },
          },
      sorts: [
        { property: "pinned", direction: "descending" },
        { property: "publication_date", direction: "descending" },
      ],
    });

    const posts: BlogPost[] = [];
    for (const page of response.results) {
      if (isFullPage(page)) {
        const post = await pageToPost(page);
        if (post) posts.push(post);
      }
    }

    return posts;
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "notion.getAllPosts",
    });
    return [];
  }
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isNotionConfigured || !BLOG_DATABASE_ID) return null;

  try {
    const response = await getNotionClient().dataSources.query({
      data_source_id: BLOG_DATABASE_ID,
      filter: {
        property: "slug",
        rich_text: { equals: slug },
      },
    });

    if (response.results.length === 0) return null;

    const page = response.results[0];
    if (!isFullPage(page)) return null;

    return await pageToPost(page);
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "notion.getPostBySlug",
      slug,
    });
    return null;
  }
}

/**
 * Get a post with all its content blocks
 */
export async function getPostWithContent(
  slug: string,
): Promise<BlogPostWithContent | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;

  const blocks = await fetchBlocks(post.id);
  const headings = extractHeadings(blocks);

  return {
    ...post,
    blocks,
    headings,
  };
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(
  category: string,
): Promise<BlogPost[]> {
  if (!isNotionConfigured || !BLOG_DATABASE_ID) return [];

  try {
    const response = await getNotionClient().dataSources.query({
      data_source_id: BLOG_DATABASE_ID,
      filter: {
        and: [
          { property: "status", select: { equals: "Posted" } },
          { property: "category", select: { equals: category } },
        ],
      },
      sorts: [
        { property: "pinned", direction: "descending" },
        { property: "publication_date", direction: "descending" },
      ],
    });

    const posts: BlogPost[] = [];
    for (const page of response.results) {
      if (isFullPage(page)) {
        const post = await pageToPost(page);
        if (post) posts.push(post);
      }
    }

    return posts;
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "notion.getPostsByCategory",
      category,
    });
    return [];
  }
}

/**
 * Get all categories with post counts
 * @param includeDrafts - Include drafts in counts (only in development)
 */
export async function getAllCategories(
  includeDrafts = false,
): Promise<CategoryWithCount[]> {
  if (!isNotionConfigured || !BLOG_DATABASE_ID) return [];

  try {
    // Get data source schema to extract category options
    const dataSource = await getNotionClient().dataSources.retrieve({
      data_source_id: BLOG_DATABASE_ID,
    });

    // Type guard for full data source response
    if (!isFullDataSource(dataSource)) return [];

    const categoryProp = dataSource.properties.category;
    if (!categoryProp || categoryProp.type !== "select") return [];

    const categoryOptions = categoryProp.select.options;

    // Get all posts to count per category
    const posts = await getAllPosts(includeDrafts);
    const categoryCountMap = new Map<string, number>();

    for (const post of posts) {
      const count = categoryCountMap.get(post.category.name) ?? 0;
      categoryCountMap.set(post.category.name, count + 1);
    }

    return categoryOptions.map((opt: { name: string; color: string }) => ({
      name: opt.name,
      color: opt.color,
      count: categoryCountMap.get(opt.name) ?? 0,
    }));
  } catch (error) {
    captureServerException(error, undefined, {
      operation: "notion.getAllCategories",
    });
    return [];
  }
}

/**
 * Get related posts based on category and tags
 * @param includeDrafts - Include drafts (only in development)
 */
export async function getRelatedPosts(
  post: BlogPost,
  limit = 3,
  includeDrafts = false,
): Promise<BlogPost[]> {
  const allPosts = await getAllPosts(includeDrafts);

  // Filter out the current post and score by similarity
  const scored = allPosts
    .filter((p) => p.id !== post.id)
    .map((p) => {
      let score = 0;
      // Same category: +2
      if (p.category.name === post.category.name) score += 2;
      // Matching tags: +1 each
      for (const tag of p.tags) {
        if (post.tags.includes(tag)) score += 1;
      }
      return { post: p, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.post);
}

/**
 * Get all post slugs for static generation
 * @param includeDrafts - Include drafts (only in development)
 */
export async function getAllPostSlugs(
  includeDrafts = false,
): Promise<string[]> {
  const posts = await getAllPosts(includeDrafts);
  return posts.map((p) => p.slug);
}

/**
 * Get all category names for static generation
 */
export async function getAllCategoryNames(): Promise<string[]> {
  const categories = await getAllCategories();
  return categories.filter((c) => c.count > 0).map((c) => c.name);
}

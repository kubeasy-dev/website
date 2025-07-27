import { defineDocs, defineCollections, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
});

const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  author: z.string(),
  date: z.string().date().or(z.date()),
  category: z.string(),
});

export const blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: blogSchema,
});

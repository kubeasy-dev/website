import { defineDocs, defineCollections, frontmatterSchema } from "fumadocs-mdx/config";
import { z } from "zod";

export const docs = defineDocs({
  dir: "content/docs",
});

const blogSchema = frontmatterSchema.extend({
  author: z.string(),
  description: z.string(),
  date: z.string().date().or(z.date()),
  category: z.string(),
});

export const blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: blogSchema,
});

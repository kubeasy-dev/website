// .source folder will be generated when you run `next dev`
import { docs, blogPosts } from "@/.source";
import { InferPageType, loader } from "fumadocs-core/source";
import { createMDXSource } from "fumadocs-mdx";

export const source = loader({
  baseUrl: "/docs",
  source: docs.toFumadocsSource(),
});

export const blog = loader({
  baseUrl: "/blog",
  source: createMDXSource(blogPosts),
});

export type BlogPage = InferPageType<typeof blog>;

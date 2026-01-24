import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

interface RelatedPostsProps {
  posts: BlogPost[];
  title?: string;
}

export function RelatedPosts({
  posts,
  title = "Related Articles",
}: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 pt-8 border-t-4 border-foreground">
      <h2 className="text-xl font-black mb-8 flex items-center gap-2">
        <span className="inline-block w-8 h-1 bg-primary" />
        {title}
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col neo-border-thick neo-shadow overflow-hidden bg-secondary hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-muted border-b-2 border-foreground">
              {post.cover ? (
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-primary/10">
                  <span className="text-3xl font-black text-primary/30">K</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                {post.category.name}
              </span>
              <h3 className="mt-2 font-bold line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              <div className="mt-auto pt-4 flex items-center text-sm font-bold text-primary">
                <span>Read more</span>
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

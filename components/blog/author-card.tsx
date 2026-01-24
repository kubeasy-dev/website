import { Github, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Author } from "@/types/blog";

interface AuthorCardProps {
  author: Author;
  showBio?: boolean;
}

export function AuthorCard({ author, showBio = true }: AuthorCardProps) {
  return (
    <div className="flex items-start gap-6 neo-border-thick neo-shadow p-6 bg-secondary">
      {/* Avatar */}
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={80}
          height={80}
          className="rounded-none neo-border-thick flex-shrink-0"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center bg-primary text-primary-foreground text-3xl font-black neo-border-thick flex-shrink-0">
          {author.name.charAt(0)}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-xl">{author.name}</h3>
        {showBio && author.bio && (
          <p className="mt-2 text-muted-foreground leading-relaxed">
            {author.bio}
          </p>
        )}

        {/* Social links */}
        {(author.twitter || author.github) && (
          <div className="mt-4 flex gap-3">
            {author.twitter && (
              <Link
                href={author.twitter}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${author.name} on Twitter`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-background neo-border font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Link>
            )}
            {author.github && (
              <Link
                href={author.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${author.name} on GitHub`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-background neo-border font-bold text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

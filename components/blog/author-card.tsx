import Image from "next/image";
import type { Author } from "@/types/blog";

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 neo-border-thick neo-shadow p-4 sm:p-6 bg-secondary">
      {/* Avatar */}
      {author.avatar ? (
        <Image
          src={author.avatar}
          alt={author.name}
          width={80}
          height={80}
          className="rounded-none neo-border-thick flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20"
        />
      ) : (
        <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center bg-primary text-primary-foreground text-2xl sm:text-3xl font-black neo-border-thick flex-shrink-0">
          {author.name.charAt(0)}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <h3 className="font-black text-lg sm:text-xl mt-0.5">{author.name}</h3>
      </div>
    </div>
  );
}

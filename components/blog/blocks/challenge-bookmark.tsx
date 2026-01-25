import { ArrowRight, Clock, Target } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getChallengeBySlug } from "@/server/db/queries";
import type { RichTextItem } from "@/types/blog";
import { RichText } from "./text";

interface ChallengeBookmarkProps {
  slug: string;
  caption?: RichTextItem[];
}

const difficultyColors = {
  easy: "bg-green-500 text-white",
  medium: "bg-yellow-500 text-white",
  hard: "bg-red-500 text-white",
};

const difficultyLabels = {
  easy: "Beginner",
  medium: "Intermediate",
  hard: "Advanced",
};

export async function ChallengeBookmark({
  slug,
  caption,
}: ChallengeBookmarkProps) {
  const challenge = await getChallengeBySlug(slug);

  // Fallback if challenge not found
  if (!challenge) {
    return (
      <div className="my-6">
        <Link
          href={`/challenges/${slug}`}
          className="block rounded-lg neo-border p-4 hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm text-primary">View Challenge: {slug}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="my-8">
      <Link
        href={`/challenges/${slug}`}
        className="group block neo-border-thick bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all hover:-translate-y-1 overflow-hidden"
      >
        {/* Header bar */}
        <div className="bg-primary px-5 py-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary-foreground" />
          <span className="text-sm font-bold text-primary-foreground">
            Practice This Scenario
          </span>
        </div>

        <div className="p-5">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3">
            <Badge
              className={cn(
                "text-xs font-bold",
                difficultyColors[challenge.difficulty],
              )}
            >
              {difficultyLabels[challenge.difficulty]}
            </Badge>
            <Badge variant="outline" className="text-xs font-medium">
              {challenge.theme}
            </Badge>
          </div>

          {/* Title */}
          <h4 className="font-black text-xl group-hover:text-primary transition-colors">
            {challenge.title}
          </h4>

          {/* Description */}
          <p className="mt-2 text-muted-foreground line-clamp-2">
            {challenge.description}
          </p>

          {/* Caption from Notion (optional) */}
          {caption && caption.length > 0 && (
            <p className="mt-3 text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
              <RichText richText={caption} />
            </p>
          )}

          {/* Footer */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{challenge.estimatedTime} min</span>
            </div>
            <div className="flex items-center text-sm text-primary font-bold">
              <span>Start Challenge</span>
              <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

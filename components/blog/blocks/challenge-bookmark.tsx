import { ArrowRight, Clock, Target } from "lucide-react";
import Link from "next/link";
import { DifficultyBadge } from "@/components/difficulty-badge";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getChallengeBySlug } from "@/server/db/queries";
import type { RichTextItem } from "@/types/blog";
import { RichText } from "./text";

interface ChallengeBookmarkProps {
  slug: string;
  caption?: RichTextItem[];
}

export async function ChallengeBookmark({
  slug,
  caption,
}: ChallengeBookmarkProps) {
  const challenge = await getChallengeBySlug(slug);

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
    <div className="my-8 not-prose">
      <Link href={`/challenges/${slug}`} className="group block">
        <Card className="neo-border neo-shadow hover:neo-shadow-lg transition-all overflow-hidden pt-0">
          {/* Header bar */}
          <div className="bg-primary px-5 p-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-bold text-primary-foreground">
              Practice This Scenario
            </span>
          </div>

          <CardHeader>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
              <Badge
                variant="secondary"
                className="text-xs font-bold neo-border"
              >
                {challenge.theme}
              </Badge>
            </div>
            <CardTitle className="text-xl font-black group-hover:text-primary transition-colors">
              {challenge.title}
            </CardTitle>
            <CardDescription className="leading-relaxed font-medium">
              {challenge.description}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Caption from Notion (optional) */}
            {caption && caption.length > 0 && (
              <p className="mb-4 text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                <RichText richText={caption} />
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between text-sm font-bold pt-2">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{challenge.estimatedTime} min</span>
              </div>
              <div className="flex items-center text-primary">
                <span>Start Challenge</span>
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

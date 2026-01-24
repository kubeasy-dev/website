import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Simple challenge type for display purposes
interface SimpleChallenge {
  slug: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  theme: string;
  estimatedTime: number;
}

interface RelatedChallengesProps {
  challenges: SimpleChallenge[];
  title?: string;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function RelatedChallenges({
  challenges,
  title = "Practice What You Learned",
}: RelatedChallengesProps) {
  if (challenges.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6">
        Put your knowledge to the test with these hands-on challenges
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {challenges.map((challenge) => (
          <Link
            key={challenge.slug}
            href={`/challenges/${challenge.slug}`}
            className="group flex flex-col rounded-lg neo-border p-6 bg-card hover:bg-muted/50 transition-all hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
              <Badge
                className={cn(
                  "text-xs font-medium",
                  difficultyColors[challenge.difficulty],
                )}
              >
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {challenge.theme}
              </Badge>
            </div>

            {/* Title */}
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
              {challenge.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2 flex-1">
              {challenge.description}
            </p>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{challenge.estimatedTime} min</span>
              </div>
              <div className="flex items-center text-sm text-primary font-medium">
                <span>Try it</span>
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

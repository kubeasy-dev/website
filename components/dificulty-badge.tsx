import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/schemas/challengeFilters";

const difficultyColors: Record<ChallengeDifficulty, string> = {
  easy: "bg-green-400",
  medium: "bg-yellow-400",
  hard: "bg-red-400",
};

const difficultySizes: Record<"sm" | "md" | "lg", string> = {
  sm: "text-xs border-2",
  md: "text-sm px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
  lg: "text-md px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
};

export function DifficultyBadge({
  difficulty,
  size = "md",
}: {
  difficulty: ChallengeDifficulty;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize border-black neo-border",
        difficultyColors[difficulty],
        difficultySizes[size],
      )}
    >
      {difficulty}
    </Badge>
  );
}

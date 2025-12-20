"use client";

import { useQuery } from "@tanstack/react-query";
import { Circle, Clock, Loader2, Target } from "lucide-react";
import Link from "next/link";
import { DifficultyBadge } from "@/components/dificulty-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import type { ObjectiveCategory } from "@/types/cli-api";

const CATEGORY_LABELS: Record<ObjectiveCategory, string> = {
  status: "Status",
  log: "Logs",
  event: "Events",
  metrics: "Metrics",
  rbac: "RBAC",
  connectivity: "Network",
};

const CATEGORY_COLORS: Record<ObjectiveCategory, string> = {
  log: "bg-blue-100 text-blue-700",
  status: "bg-purple-100 text-purple-700",
  event: "bg-orange-100 text-orange-700",
  metrics: "bg-green-100 text-green-700",
  rbac: "bg-yellow-100 text-yellow-700",
  connectivity: "bg-cyan-100 text-cyan-700",
};

export interface ChallengePreviewData {
  slug: string;
  title: string;
  description: string;
  theme: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: number;
  initialSituation: string | null;
  objective: string | null;
}

interface ChallengePreviewProps {
  challenge: ChallengePreviewData;
}

export function ChallengePreview({ challenge }: ChallengePreviewProps) {
  const trpc = useTRPC();

  // Fetch objectives for this challenge
  const { data: objectivesData, isLoading } = useQuery({
    ...trpc.challenge.getObjectives.queryOptions({ slug: challenge.slug }),
  });

  const objectives = objectivesData?.objectives ?? [];

  return (
    <div className="bg-white border-4 border-black neo-shadow p-6 space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-black">{challenge.title}</h3>
          <DifficultyBadge difficulty={challenge.difficulty} size="sm" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="font-bold">
            {challenge.theme}
          </Badge>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {challenge.estimatedTime} min
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground font-medium">
        {challenge.description}
      </p>

      {/* Initial Situation */}
      {challenge.initialSituation && (
        <div className="bg-secondary/50 border-2 border-border rounded-lg p-3">
          <p className="text-xs font-bold text-muted-foreground mb-1">
            Situation
          </p>
          <p className="text-sm">{challenge.initialSituation}</p>
        </div>
      )}

      {/* Objective */}
      {challenge.objective && (
        <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-3">
          <p className="text-xs font-bold text-primary mb-1">Your Goal</p>
          <p className="text-sm font-medium">{challenge.objective}</p>
        </div>
      )}

      {/* Objectives Checklist */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <p className="text-sm font-bold">
            Objectives to Complete ({objectives.length})
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading objectives...</span>
          </div>
        ) : objectives.length > 0 ? (
          <div className="space-y-1.5">
            {objectives.map((obj) => (
              <div
                key={obj.id}
                className="flex items-start gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
              >
                <Circle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold">{obj.title}</span>
                    <span
                      className={cn(
                        "text-xs font-medium px-1.5 py-0.5 rounded-full",
                        CATEGORY_COLORS[obj.category as ObjectiveCategory] ||
                          "bg-gray-100 text-gray-700",
                      )}
                    >
                      {CATEGORY_LABELS[obj.category as ObjectiveCategory] ||
                        obj.category}
                    </span>
                  </div>
                  {obj.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {obj.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            Objectives will be revealed when you start the challenge.
          </p>
        )}
      </div>

      {/* View Details Link */}
      <Button variant="outline" className="w-full neo-border font-bold" asChild>
        <Link href={`/challenges/${challenge.slug}`}>View Full Details</Link>
      </Button>
    </div>
  );
}

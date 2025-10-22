"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { useTRPC } from "@/trpc/client";

export function DashboardChart() {
  const trpc = useTRPC();

  const { data: challengesCompletions } = useSuspenseQuery(
    trpc.userProgress.getCompletionPercentage.queryOptions({
      splitByTheme: true,
    }),
  );

  const { data: themes } = useSuspenseQuery(trpc.theme.list.queryOptions());

  if (!challengesCompletions.byTheme) {
    return null;
  }

  const bestTheme =
    challengesCompletions.byTheme.length > 0
      ? challengesCompletions.byTheme.reduce((best, current) =>
          current.percentageCompleted > best.percentageCompleted
            ? current
            : best,
        )
      : null;

  const bestThemeName = bestTheme
    ? themes.find((t) => t.slug === bestTheme.themeSlug)?.name
    : null;

  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary border-4 border-border neo-shadow rounded-lg">
          <TrendingUp className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-black">Skills by Themes</h2>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <RadarChart data={challengesCompletions.byTheme}>
          <PolarGrid stroke="#000" strokeWidth={2} />
          <PolarAngleAxis
            dataKey="themeSlug"
            tick={{ fill: "#000", fontWeight: "bold", fontSize: 12 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
          <Radar
            name="Completion"
            dataKey="percentageCompleted"
            stroke="#6366F1"
            fill="#6366F1"
            fillOpacity={0.6}
            strokeWidth={3}
          />
        </RadarChart>
      </ResponsiveContainer>
      <div className="mt-4 p-4 bg-secondary border-4 border-border rounded-lg">
        {bestTheme && bestTheme.percentageCompleted > 0 && bestThemeName ? (
          <p className="text-sm font-bold text-center">
            Your best theme is{" "}
            <span className="text-primary">{bestThemeName}</span> at{" "}
            {bestTheme.percentageCompleted}%!
          </p>
        ) : (
          <p className="text-sm font-bold text-center">
            Master all themes to become a Kubernetes expert!
          </p>
        )}
      </div>
    </div>
  );
}

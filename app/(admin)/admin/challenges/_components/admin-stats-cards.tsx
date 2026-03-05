"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle, RotateCcw, Trophy, Users } from "lucide-react";
import type { StatCardDef } from "@/app/(admin)/_components/stats-cards";
import { StatsCards } from "@/app/(admin)/_components/stats-cards";
import { useTRPC } from "@/trpc/client";

type Data = {
  completionRate: number;
  totalCompletions: number;
  totalStarts: number;
  successRate: number;
  successfulSubmissions: number;
  totalSubmissions: number;
};

const stats: readonly StatCardDef<Data>[] = [
  {
    key: "completionRate",
    label: "Completion rate",
    icon: Trophy,
    color: "text-primary",
    bg: "bg-primary/10",
    getValue: (d) => (d ? `${d.completionRate}%` : "—"),
    getSub: (d) =>
      d ? `${d.totalCompletions} completions / ${d.totalStarts} starts` : "",
  },
  {
    key: "successRate",
    label: "Success rate",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    getValue: (d) => (d ? `${d.successRate}%` : "—"),
    getSub: (d) =>
      d
        ? `${d.successfulSubmissions} passed / ${d.totalSubmissions} submitted`
        : "",
  },
  {
    key: "totalSubmissions",
    label: "Total submissions",
    icon: RotateCcw,
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    getValue: (d) => (d ? d.totalSubmissions.toLocaleString() : "—"),
    getSub: (d) => (d ? `${d.successfulSubmissions} successful` : ""),
  },
  {
    key: "avgAttempts",
    label: "Avg. attempts",
    icon: Users,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    getValue: (d) =>
      d && d.totalStarts > 0
        ? (d.totalSubmissions / d.totalStarts).toFixed(1)
        : "—",
    getSub: () => "submissions per start",
  },
];

export function AdminStatsCards() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.challenge.adminStats.queryOptions(),
  );

  return <StatsCards stats={stats} data={data} isLoading={isLoading} />;
}

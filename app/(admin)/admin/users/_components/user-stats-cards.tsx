"use client";

import { useQuery } from "@tanstack/react-query";
import { ShieldCheck, UserCheck, Users, UserX } from "lucide-react";
import type { StatCardDef } from "@/app/(admin)/_components/stats-cards";
import { StatsCards } from "@/app/(admin)/_components/stats-cards";
import { useTRPC } from "@/trpc/client";

type Data = {
  total: number;
  active: number;
  banned: number;
  admins: number;
};

const stats: readonly StatCardDef<Data>[] = [
  {
    key: "total",
    label: "Total users",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
    getValue: (d) => d?.total.toLocaleString() ?? "—",
    getSub: (d) => (d ? `${d.active} active` : ""),
  },
  {
    key: "active",
    label: "Active users",
    icon: UserCheck,
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
    getValue: (d) => d?.active.toLocaleString() ?? "—",
    getSub: (d) =>
      d && d.total > 0
        ? `${Math.round((d.active / d.total) * 100)}% of total`
        : "",
  },
  {
    key: "banned",
    label: "Banned users",
    icon: UserX,
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
    getValue: (d) => d?.banned.toLocaleString() ?? "—",
    getSub: (d) =>
      d && d.total > 0
        ? `${Math.round((d.banned / d.total) * 100)}% of total`
        : "",
  },
  {
    key: "admins",
    label: "Admins",
    icon: ShieldCheck,
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/30",
    getValue: (d) => d?.admins.toLocaleString() ?? "—",
    getSub: (d) =>
      d && d.total > 0
        ? `${Math.round((d.admins / d.total) * 100)}% of total`
        : "",
  },
];

export function UserStatsCards() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(trpc.user.adminStats.queryOptions());

  return <StatsCards stats={stats} data={data} isLoading={isLoading} />;
}

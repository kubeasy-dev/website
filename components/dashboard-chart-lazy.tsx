"use client";

import dynamic from "next/dynamic";

export const DashboardChart = dynamic(
  () =>
    import("@/components/dashboard-chart").then((m) => ({
      default: m.DashboardChart,
    })),
  { ssr: false },
);

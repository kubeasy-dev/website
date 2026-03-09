import { getQueryClient, trpc } from "@/trpc/server";
import { DashboardRecentGainsClient } from "./dashboard-recent-gains-client";

export async function DashboardRecentGains() {
  const queryClient = getQueryClient();
  const recentGains = await queryClient.fetchQuery(
    trpc.xpTransaction.getRecentGains.queryOptions(),
  );
  return <DashboardRecentGainsClient recentGains={recentGains} />;
}

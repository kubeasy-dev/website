import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { AdminStatsCards } from "./_components/admin-stats-cards";
import { ChallengesAdminTable } from "./_components/challenges-admin-table";

export default async function AdminChallengesPage() {
  await Promise.all([
    prefetch(trpc.challenge.adminList.queryOptions()),
    prefetch(trpc.challenge.adminStats.queryOptions()),
  ]);

  return (
    <HydrateClient>
      <div className="space-y-6">
        {/* Summary stats */}
        <Card className="py-0 overflow-hidden gap-0">
          <AdminStatsCards />
        </Card>

        {/* Challenges table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-black">Challenges</CardTitle>
            <CardDescription>
              Enable or disable challenges to control visibility on the site.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <ChallengesAdminTable />
          </CardContent>
        </Card>
      </div>
    </HydrateClient>
  );
}

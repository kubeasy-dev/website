import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { UserStatsCards } from "./_components/user-stats-cards";
import { UsersAdminTable } from "./_components/users-admin-table";

export default async function AdminUsersPage() {
  await Promise.all([
    prefetch(trpc.user.adminList.queryOptions({ limit: 50, offset: 0 })),
    prefetch(trpc.user.adminStats.queryOptions()),
  ]);

  return (
    <HydrateClient>
      <div className="space-y-6">
        <Card className="py-0 overflow-hidden gap-0">
          <UserStatsCards />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-black">Users</CardTitle>
            <CardDescription>
              Manage user roles and access. Ban or unban users from the
              platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0">
            <UsersAdminTable />
          </CardContent>
        </Card>
      </div>
    </HydrateClient>
  );
}

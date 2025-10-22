import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getQueryClient, trpc } from "@/trpc/server";

export async function DashboardRecentGains() {
  const queryClient = getQueryClient();

  const recentGains = await queryClient.fetchQuery(
    trpc.xpTransaction.getRecentGains.queryOptions(),
  );

  return (
    <div className="bg-secondary border-4 border-border neo-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary border-4 border-border neo-shadow rounded-lg">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-black">Recent Activity</h2>
      </div>
      <div className="space-y-4">
        {recentGains.map((activity) => (
          <div
            key={activity.id}
            className="p-4 bg-background border-4 border-border neo-shadow-sm border-l-8"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 border-4 border-border neo-shadow-sm rounded-lg"></div>
              <div className="flex-1">
                <Link
                  href={`/challenges/${activity.challengeSlug}`}
                  className="font-black hover:text-primary transition-colors"
                >
                  {activity.challengeTitle}
                </Link>
                <p className="text-sm text-muted-foreground font-bold mt-1">
                  {activity.description}
                </p>
                {activity.xpAmount > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="px-2 py-1 bg-primary border-2 border-border rounded">
                      <span className="text-xs font-black text-primary-foreground">
                        +{activity.xpAmount} XP
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground font-bold mt-2">
                  {activity.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Button className="w-full mt-6 neo-border neo-shadow font-black" asChild>
        <Link href="/challenges">
          View All Challenges
          <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}

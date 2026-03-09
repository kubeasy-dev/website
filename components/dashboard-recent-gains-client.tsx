"use client";

import { Clock, History, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { RouterOutputs } from "@/types/trpc";

type RecentGains = RouterOutputs["xpTransaction"]["getRecentGains"];
type Gain = RecentGains[number];

function groupByMonth(gains: RecentGains) {
  const map = new Map<string, { label: string; items: Gain[] }>();
  for (const gain of gains) {
    const key = `${gain.createdAt.getFullYear()}-${gain.createdAt.getMonth()}`;
    const label = gain.createdAt.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const group = map.get(key);
    if (group) {
      group.items.push(gain);
    } else {
      map.set(key, { label, items: [gain] });
    }
  }
  return Array.from(map.entries()).map(([key, value]) => ({ key, ...value }));
}

function ActivityItem({
  activity,
  compact = false,
}: {
  activity: Gain;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-background neo-border-thick neo-shadow-sm relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[4px] before:bg-primary",
        compact ? "pl-4" : "pl-6",
      )}
    >
      <div className={cn("flex items-start gap-3", compact ? "p-3" : "p-4")}>
        <div className="p-1.5 neo-border-thick neo-shadow-sm rounded-lg bg-secondary shrink-0">
          <Trophy
            className={cn("text-primary", compact ? "w-3.5 h-3.5" : "w-4 h-4")}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/challenges/${activity.challengeSlug}`}
              className="font-black hover:text-primary transition-colors text-sm block truncate"
            >
              {activity.challengeTitle}
            </Link>
            {activity.xpAmount > 0 && (
              <div className="px-1.5 py-0.5 bg-primary neo-border shrink-0">
                <span className="text-xs font-black text-primary-foreground">
                  +{activity.xpAmount} XP
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between mt-0.5">
            <p className="text-xs text-muted-foreground font-bold">
              {activity.description}
            </p>
            <p className="text-xs text-muted-foreground font-bold shrink-0 ml-2">
              {activity.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardRecentGainsClient({
  recentGains,
}: {
  recentGains: RecentGains;
}) {
  const preview = recentGains.slice(0, 3);
  const totalXp = recentGains.reduce((sum, g) => sum + g.xpAmount, 0);
  const grouped = groupByMonth(recentGains);

  return (
    <div className="bg-secondary neo-border-thick neo-shadow p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary neo-border-thick neo-shadow rounded-lg">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-black">Recent Activity</h2>
      </div>
      <div className="space-y-4">
        {preview.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full mt-6 neo-border neo-shadow font-black">
            View All Activity
            <History className="ml-2 w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent
          className={cn(
            "p-0 gap-0 overflow-hidden",
            // make the built-in close button visible over the purple header
            "[&>button:last-child]:text-primary-foreground [&>button:last-child]:opacity-80 [&>button:last-child]:hover:opacity-100",
          )}
        >
          <DialogTitle className="sr-only">Activity Log</DialogTitle>

          {/* Purple header */}
          <div className="bg-primary px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-primary-foreground" />
              <span className="text-xl font-black text-primary-foreground">
                Activity Log
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-white/20 border border-white/30">
                <span className="text-sm font-black text-primary-foreground">
                  +{totalXp} XP
                </span>
              </div>
              <span className="text-primary-foreground/80 text-sm font-bold">
                {recentGains.length}{" "}
                {recentGains.length === 1 ? "activity" : "activities"}
              </span>
            </div>
          </div>

          {/* Grouped list */}
          <div className="overflow-y-auto max-h-[55vh] p-5 space-y-5">
            {grouped.map(({ label, key, items }) => (
              <div key={key}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                    {label}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="space-y-2">
                  {items.map((gain) => (
                    <ActivityItem key={gain.id} activity={gain} compact />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

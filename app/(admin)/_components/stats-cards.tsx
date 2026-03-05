"use client";

import type { LucideIcon } from "lucide-react";

export interface StatCardDef<T> {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  getValue: (data: T | undefined) => string | number;
  getSub: (data: T | undefined) => string;
}

export function StatsCards<T>({
  stats,
  data,
  isLoading,
}: {
  stats: readonly StatCardDef<T>[];
  data: T | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
      {stats.map(({ key, label, icon: Icon, color, bg, getValue, getSub }) => (
        <div key={key} className="flex items-start gap-4 p-6">
          <div className={`mt-0.5 rounded-lg p-2 ${bg} shrink-0`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            {isLoading ? (
              <>
                <div className="mt-1 h-7 w-16 bg-muted rounded animate-pulse" />
                <div className="mt-1.5 h-3 w-28 bg-muted rounded animate-pulse" />
              </>
            ) : (
              <>
                <p className="text-2xl font-black mt-0.5">{getValue(data)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getSub(data)}
                </p>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

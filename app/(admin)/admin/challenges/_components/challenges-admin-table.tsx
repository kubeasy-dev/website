"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/trpc/client";

export function ChallengesAdminTable() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [pendingSlugs, setPendingSlugs] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery(trpc.challenge.adminList.queryOptions());

  const { mutate: setAvailability } = useMutation(
    trpc.challenge.setAvailability.mutationOptions({
      onSuccess: (_, { slug }) => {
        setPendingSlugs((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
        void queryClient.invalidateQueries(
          trpc.challenge.adminList.queryOptions(),
        );
      },
      onError: (error, { slug }) => {
        setPendingSlugs((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          return next;
        });
        toast.error("Failed to update availability", {
          description: error.message,
        });
        // Refetch to restore correct state in the UI
        void queryClient.invalidateQueries(
          trpc.challenge.adminList.queryOptions(),
        );
      },
    }),
  );

  const handleToggle = (slug: string, available: boolean) => {
    setPendingSlugs((prev) => new Set(prev).add(slug));
    setAvailability({ slug, available });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={i} className="h-14 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const challenges = data?.challenges ?? [];

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-black">Title</TableHead>
            <TableHead className="font-black">Theme</TableHead>
            <TableHead className="font-black">Type</TableHead>
            <TableHead className="font-black">Difficulty</TableHead>
            <TableHead className="font-black">Created</TableHead>
            <TableHead className="font-black text-right">Completion</TableHead>
            <TableHead className="font-black text-right">
              Success rate
            </TableHead>
            <TableHead className="font-black text-right">Available</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.map((c) => (
            <TableRow key={c.slug}>
              <TableCell className="font-bold">{c.title}</TableCell>
              <TableCell className="text-sm">{c.theme}</TableCell>
              <TableCell className="text-sm">{c.type}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    c.difficulty === "easy"
                      ? "default"
                      : c.difficulty === "medium"
                        ? "secondary"
                        : "destructive"
                  }
                  className="capitalize font-bold"
                >
                  {c.difficulty}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(c.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums">
                {c.starts > 0 ? (
                  <>
                    <span className="font-bold">
                      {Math.round((c.completions / c.starts) * 100)}%
                    </span>
                    <span className="text-muted-foreground ml-1.5 text-xs">
                      {c.completions}/{c.starts}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right text-sm tabular-nums">
                {c.totalSubmissions > 0 ? (
                  <>
                    <span className="font-bold">
                      {Math.round(
                        (c.successfulSubmissions / c.totalSubmissions) * 100,
                      )}
                      %
                    </span>
                    <span className="text-muted-foreground ml-1.5 text-xs">
                      {c.successfulSubmissions}/{c.totalSubmissions}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Switch
                  checked={c.available}
                  disabled={pendingSlugs.has(c.slug)}
                  onCheckedChange={(available) =>
                    handleToggle(c.slug, available)
                  }
                  aria-label={`Toggle availability for ${c.title}`}
                />
              </TableCell>
            </TableRow>
          ))}
          {challenges.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center text-muted-foreground py-8"
              >
                No challenges found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

import { ChallengeProgress, DifficultyLevel, UserProgressStatus } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { DisplayDifficultyLevel } from "../difficulty-level";
import { Button } from "../ui/button";
import Link from "next/link";
import { RelativeDateDisplay } from "../relative-date-display";

export function ChallengeTable({ challenges }: { challenges: ChallengeProgress[] | null | undefined }) {
  const columns: ColumnDef<ChallengeProgress>[] = [
    {
      header: "Name",
      accessorKey: "title",
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ cell, row }) => {
        const status = cell.getValue() as UserProgressStatus;
        const startedAt = row.original.started_at;
        const completedAt = row.original.completed_at;
        switch (status) {
          case "completed":
            return (
              <p className='text-primary'>
                <RelativeDateDisplay stringDate={completedAt} />
              </p>
            );
          case "in_progress":
            return (
              <p>
                Started <RelativeDateDisplay stringDate={startedAt} />
              </p>
            );
          case "not_started":
            return <p className='text-destructive'>Not Started</p>;
        }
      },
    },
    {
      header: "Theme",
      accessorKey: "theme",
    },
    {
      header: "Difficulty",
      accessorKey: "difficulty",
      cell: ({ cell }) => {
        const level = cell.getValue() as DifficultyLevel;
        return (
          <div className='flex flex-row items-center gap-2'>
            <DisplayDifficultyLevel level={level} />
            <p className='capitalize'>{level}</p>
          </div>
        );
      },
    },
    {
      header: "Estimated Time",
      accessorKey: "estimated_time",
      cell: ({ cell }) => {
        const time = cell.getValue() as string;
        return <p>{time} minutes</p>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const challenge = row.original;
        const label = challenge.status === "completed" ? "Review" : challenge.status === "in_progress" ? "Continue" : "Start";
        return (
          <Button variant='secondary' size='sm' asChild>
            <Link href={`/challenge/${challenge.slug}`} className='w-full'>
              {label}
            </Link>
          </Button>
        );
      },
    },
  ];

  if (!challenges) {
    return <p>No challenges found</p>;
  }

  return (
    <div className='bg-card'>
      <DataTable columns={columns} data={challenges} />
    </div>
  );
}

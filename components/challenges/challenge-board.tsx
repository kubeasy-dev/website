"use client";

import React from "react";
import { ChallengeProgress, UserProgressStatus } from "@/lib/types";
import { ChallengeBoardColumn } from "./challenge-board-column";

const STATUS_COLUMNS = [
  { key: "not_started", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Done" },
] as const;

export function ChallengeBoard({ challenges }: Readonly<{ challenges: ChallengeProgress[] | null | undefined }>) {
  if (!challenges) {
    return <p>No challenge found</p>;
  }

  const grouped: Record<UserProgressStatus, ChallengeProgress[]> = {
    not_started: [],
    in_progress: [],
    completed: [],
  };

  for (const challenge of challenges) {
    const status = challenge.status ?? "not_started";
    grouped[status].push(challenge);
  }

  return (
    <div className='flex gap-4 overflow-x-auto'>
      {STATUS_COLUMNS.map(({ key: status, label }) => (
        <ChallengeBoardColumn key={status} label={label} challenges={grouped[status]} />
      ))}
    </div>
  );
}

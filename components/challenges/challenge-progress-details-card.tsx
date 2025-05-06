"use client";

import React from "react";
import { RelativeDateDisplay } from "@/components/relative-date-display";
import { ChallengeSubmissions } from "./challenge-submissions";
import { UserProgress } from "@/lib/types";

export function ChallengeProgressDetailsCard({ userProgress }: Readonly<{ userProgress: UserProgress }>) {
  const duration = React.useMemo(() => {
    if (userProgress.status !== "completed") return null;
    return userProgress?.started_at && userProgress?.completed_at ? Math.round((new Date(userProgress.completed_at).getTime() - new Date(userProgress.started_at).getTime()) / (1000 * 60)) : null;
  }, [userProgress]);

  return (
    <div className='space-y-4'>
      <div className='flex flex-row gap-1 text-sm text-muted-foreground text-left'>
        <p>
          Challenge started <RelativeDateDisplay stringDate={userProgress.started_at} />
        </p>
        <span className='text-muted-foreground'>|</span>
        <p>
          {userProgress.status == "completed" ? "Completed " : "Last updated "}
          <RelativeDateDisplay stringDate={userProgress.completed_at || userProgress.updated_at} />
          {duration && <span className='text-muted-foreground'> ({duration} minutes)</span>}
        </p>
      </div>
      {userProgress.composite_key && <ChallengeSubmissions userProgressId={userProgress.composite_key} />}
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ChallengeProgress, UserProgressStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ClockIcon } from "lucide-react";
import { DisplayDifficultyLevel } from "../difficulty-level";

const STATUS_COLUMNS = [
  { key: "not_started", label: "To Do" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Done" },
] as const;

const NB_CARDS = 10;

export function ChallengeBoardColumn({ status, label, challenges }: Readonly<{ status: UserProgressStatus; label: string; challenges: ChallengeProgress[] }>) {
  const [expanded, setExpanded] = React.useState(false);
  const visibleChallenges = React.useMemo(() => {
    if (expanded) {
      return challenges;
    }
    return challenges.slice(0, NB_CARDS);
  }, [challenges, expanded]);
  const hasMore = React.useMemo(() => challenges.length > NB_CARDS, [challenges]);

  return (
    <div className='min-w-[320px] flex-1 bg-muted rounded-lg p-4 flex flex-col'>
      <h2 className='text-lg font-bold mb-4 text-center'>{label}</h2>
      {visibleChallenges.length === 0 ? (
        <div className='text-muted-foreground text-sm mb-2'>No challenge</div>
      ) : (
        <motion.ul
          className='space-y-2'
          initial='hidden'
          animate='visible'
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.07,
              },
            },
          }}
        >
          <AnimatePresence>
            {visibleChallenges.map((challenge) => (
              <Link href={`/challenge/${challenge.slug}`} className='block' key={challenge.id}>
                <motion.li
                  className='bg-card dark:bg rounded shadow p-3 border'
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  layout
                >
                  <div className='font-medium flex flex-row gap-1.5 items-baseline'>
                    <DisplayDifficultyLevel level={challenge.difficulty!} />
                    {challenge.title}
                  </div>
                  <div className='text-sm text-muted-foreground mt-1'>{challenge.description}</div>
                  {status === "not_started" && (
                    <div className='flex justify-between items-center mt-2'>
                      <Badge variant='secondary'>{challenge.theme}</Badge>
                      <div className='flex flex-row space-x-0.5 items-center text-sm text-muted-foreground'>
                        <ClockIcon className='h-4 w-4' />
                        <span>{challenge.estimated_time} min.</span>
                      </div>
                    </div>
                  )}
                </motion.li>
              </Link>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
      {hasMore && (
        <Button variant='ghost' className='mt-1' onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Show less" : `Show all (${challenges.length})`}
        </Button>
      )}
    </div>
  );
}

export function ChallengesBoard({ challenges }: Readonly<{ challenges: ChallengeProgress[] | null | undefined }>) {
  if (!challenges) {
    return <p>No challenge found</p>;
  }

  // Group by status only
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
        <ChallengeBoardColumn key={status} status={status} label={label} challenges={grouped[status]} />
      ))}
    </div>
  );
}

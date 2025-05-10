"use client";

import React from "react";
import { ChallengeProgress, MakeAllRequiredExcept } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChallengeCard } from "./challenge-card";

const NB_CARDS = 5;

export function ChallengeBoardColumn({ label, challenges }: Readonly<{ label: string; challenges: ChallengeProgress[] }>) {
  const [expanded, setExpanded] = React.useState(false);
  const visibleChallenges = React.useMemo(() => {
    if (expanded) {
      return challenges as MakeAllRequiredExcept<ChallengeProgress, "started_at" | "completed_at">[];
    }
    return challenges.slice(0, NB_CARDS) as MakeAllRequiredExcept<ChallengeProgress, "started_at" | "completed_at">[];
  }, [challenges, expanded]);
  const hasMore = React.useMemo(() => challenges.length > NB_CARDS, [challenges]);

  return (
    <div className='min-w-[320px] flex-1 bg-muted rounded-lg p-4 flex flex-col border'>
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
              <motion.li
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                layout
                key={challenge.id}
              >
                <ChallengeCard challenge={challenge} />
              </motion.li>
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

"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Challenge, UserProgress } from "@/lib/types";
import { useQuery } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import useSupabase from "@/hooks/use-supabase";
import { ChallengeCard } from "./challenge-card";

interface ChallengeCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge;
  userProgress: UserProgress;
}

export function ChallengeCompletionDialog({ open, onOpenChange, challenge, userProgress }: ChallengeCompletionDialogProps) {
  const supabase = useSupabase();
  const duration = React.useMemo(() => {
    return Math.round((new Date(userProgress.completed_at || "").getTime() - new Date(userProgress.started_at || "").getTime()) / (1000 * 60));
  }, [userProgress]);

  const { data: similarChallenges } = useQuery(queries.challenge.findSimilar(supabase, { theme: challenge.theme, excludeChallengeId: challenge.id }), {
    enabled: !!challenge.theme && !!challenge.id,
  });

  const { data: submissions } = useQuery(queries.userSubmission.list(supabase, { challengeId: challenge.id }));

  const submissionCount = submissions ? submissions.length : 0;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>🎉 Congratulations!</DialogTitle>
        </DialogHeader>
        <div className='space-y-2'>
          <div className='text-lg font-semibold'>
            You have completed the challenge: <span className='text-primary'>{challenge.title}</span>
          </div>
          <div className='text-sm text-muted-foreground'>
            {/* Challenge statistics */}
            <ul className='list-disc ml-5'>
              <li>
                Duration: <span className='font-medium text-secondary-foreground'>{duration}</span> minutes
              </li>
              <li>
                Number of submissions: <span className='font-medium text-secondary-foreground'>{submissionCount}</span>
              </li>
            </ul>
          </div>

          {!similarChallenges || similarChallenges.length === 0 ? (
            <span className='text-muted-foreground text-sm'>No similar challenges found.</span>
          ) : (
            <div className='pt-4'>
              <div className='font-semibold mb-2'>Similar challenges to try:</div>
              <div className='flex flex-col gap-2'>
                {similarChallenges.map((sim) => (
                  <ChallengeCard challenge={sim} key={sim.id} />
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

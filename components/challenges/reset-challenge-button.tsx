"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useDeleteMutation } from "@supabase-cache-helpers/postgrest-react-query";
import useSupabase from "@/hooks/use-supabase";
import { Icons } from "@/components/icons";
import { RefreshCcw } from "lucide-react";

export function ResetChallengeButton({ userProgressId }: { userProgressId: string }) {
  const { toast } = useToast();
  const supabase = useSupabase();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { mutateAsync: deleteProgress } = useDeleteMutation(supabase.from("user_progress"), ["user_id", "challenge_id"], "composite_key", {
    onSuccess: () => {
      toast({
        title: "Challenge reset",
        description: "Your progress has been successfully reset.",
      });
    },
    onError: (error) => {
      console.error("Error resetting challenge:", error);
      toast({
        title: "Error",
        description: "An error occurred while resetting the challenge.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const handleReset = () => {
    setIsDeleting(true);
    const [userId, challengeId] = userProgressId.split("+");
    if (!userId || !challengeId) {
      toast({
        title: "Error",
        description: "An error occurred while resetting the challenge.",
        variant: "destructive",
      });
      setIsDeleting(false);
      return;
    }
    deleteProgress({ user_id: userId, challenge_id: challengeId });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='secondary' disabled={isDeleting}>
          {isDeleting ? (
            <span className='flex items-center gap-2'>
              <Icons.spinner className='h-4 w-4 animate-spin' aria-label='Loading' />
              Resetting...
            </span>
          ) : (
            <React.Fragment>
              <RefreshCcw className='h-4 w-4' />
              Reset Challenge
            </React.Fragment>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone. All your submissions and progress for this challenge will be permanently deleted.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isDeleting}>
            {isDeleting ? (
              <span className='flex items-center gap-2'>
                <Icons.spinner className='h-4 w-4 animate-spin' aria-label='Loading' />
                Resetting...
              </span>
            ) : (
              "Yes, reset"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

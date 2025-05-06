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

export function ResetChallengeButton({ userProgressId }: { userProgressId: string }) {
  const { toast } = useToast();
  const supabase = useSupabase();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { mutateAsync: deleteProgress } = useDeleteMutation(supabase.from("user_progress"), ["user_id", "challenge_id"], "composite_key", {
    onSuccess: (data) => {
      console.log(data);
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
    deleteProgress({ user_id: userId, challenge_id: challengeId });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='secondary' className='mt-4' disabled={isDeleting}>
          {isDeleting ? "Resetting..." : "Reset Challenge"}
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
            {isDeleting ? "Resetting..." : "Yes, reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

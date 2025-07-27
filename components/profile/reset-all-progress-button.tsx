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
import { useRevalidateTables } from "@supabase-cache-helpers/postgrest-react-query";
import { useUser } from "@/hooks/use-user";

export function ResetAllProgressButton() {
  const { toast } = useToast();
  const supabase = useSupabase();
  const { data: user } = useUser();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const revalidateTables = useRevalidateTables([
    { schema: "public", table: "challenge_progress" },
    { schema: "public", table: "user_submissions" },
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync: deleteAllProgress } = useDeleteMutation(supabase.from("user_progress") as any, ["user_id"], "*", {
    onSuccess: () => {
      toast({
        title: "Success",
        description: "All your challenge progress has been successfully reset.",
      });
      revalidateTables();
    },
    onError: (error) => {
      console.error("Error resetting all progress:", error);
      toast({
        title: "Error",
        description: "An error occurred while resetting your progress.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsDeleting(false);
    },
  });

  const handleReset = async () => {
    setIsDeleting(true);
    try {
      if (!user) throw new Error("User not found");

      await deleteAllProgress({ user_id: user.id });
    } catch (error) {
      console.error("Error in handleReset:", error);
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant='destructive' disabled={isDeleting}>
          {isDeleting ? "Resetting..." : "Reset All Progress"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will delete all your challenge progress and cannot be undone. This includes all your submissions and completion status for all challenges.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isDeleting} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
            {isDeleting ? "Resetting..." : "Reset All Progress"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

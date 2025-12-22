"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTRPCMutation } from "@/hooks/use-trpc-mutation";
import { trpc } from "@/trpc/client";

export function ProfileDangerZone() {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const resetProgressMutation = useTRPCMutation(trpc.user.resetProgress, {
    invalidateQueries: [
      // Invalidate all user-related queries
      trpc.userProgress.getCompletionPercentage.getQueryKey?.() || [],
      trpc.userProgress.getXpAndRank.getQueryKey?.() || [],
      trpc.userProgress.getStreak.getQueryKey?.() || [],
    ],
    onSuccess: (data) => {
      toast.success("Progress reset successfully", {
        description: `Deleted ${data.deletedChallenges} challenges and ${data.deletedXp} XP`,
      });
      setResetDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to reset progress", {
        description: error.message,
      });
      setResetDialogOpen(false);
    },
  });

  const handleResetProgress = () => {
    setResetDialogOpen(true);
  };

  const confirmReset = () => {
    resetProgressMutation.mutate();
  };

  return (
    <div className="bg-red-50 neo-border border-red-600 neo-shadow shadow-red-600 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-red-600 text-white neo-border border-red-800">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-red-600">Danger Zone</h2>
          <p className="text-sm text-red-700 font-bold">
            Irreversible actions - proceed with caution
          </p>
        </div>
      </div>

      <div className="p-4 bg-white neo-border border-red-600 mb-4">
        <h3 className="font-black mb-2">Reset All Progress</h3>
        <p className="text-sm text-muted-foreground mb-4">
          This will permanently delete all your completed challenges, progress,
          and statistics. This action cannot be undone.
        </p>
        <Button
          onClick={handleResetProgress}
          disabled={resetProgressMutation.isPending}
          className="bg-red-600 text-white neo-border border-red-800 neo-shadow shadow-red-800 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Reset All Progress
        </Button>
      </div>

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="border-red-600 shadow-[8px_8px_0px_0px_rgba(220,38,38,1)]">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Reset All Progress
            </DialogTitle>
            <DialogDescription className="text-base">
              <p className="mb-3 font-semibold text-red-800">
                ⚠️ Warning: This action cannot be undone!
              </p>
              <p className="mb-2">This will permanently delete:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All your completed challenges</li>
                <li>All your earned XP and rank progress</li>
                <li>All your statistics and history</li>
              </ul>
              <p className="mt-3 font-semibold">
                Are you absolutely sure you want to continue?
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              disabled={resetProgressMutation.isPending}
              className="neo-border font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmReset}
              disabled={resetProgressMutation.isPending}
              className="bg-red-600 text-white neo-border border-red-800 neo-shadow shadow-red-800 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all font-bold"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              {resetProgressMutation.isPending
                ? "Resetting..."
                : "Yes, Reset Everything"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

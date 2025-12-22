"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/trpc/client";

export function ProfileEmailPreferences() {
  const queryClient = useQueryClient();

  const {
    data: categories = [],
    isLoading,
  } = useQuery({
    ...trpc.emailPreference.listCategories.queryOptions(),
  });

  const updateMutation = trpc.emailPreference.updateSubscription.useMutation({
    // Optimistic update for instant UI feedback
    onMutate: async (variables) => {
      const queryKey =
        trpc.emailPreference.listCategories.getQueryKey?.() || [];

      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey,
      });

      // Snapshot previous value
      const previousCategories = queryClient.getQueryData(queryKey);

      // Optimistically update UI
      queryClient.setQueryData(queryKey, (old: typeof categories) => {
        if (!old) return old;
        return old.map((cat) =>
          cat.id === variables.categoryId
            ? { ...cat, subscribed: variables.subscribed }
            : cat,
        );
      });

      return { previousCategories };
    },
    // Rollback on error
    onError: (error, _variables, context) => {
      if (context?.previousCategories) {
        const queryKey =
          trpc.emailPreference.listCategories.getQueryKey?.() || [];
        queryClient.setQueryData(queryKey, context.previousCategories);
      }
      toast.error("Failed to update preferences", {
        description: error.message,
      });
    },
    // Refetch on success to sync with server
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: trpc.emailPreference.listCategories.getQueryKey?.() || [],
      });
    },
    onSuccess: () => {
      toast.success("Email preferences updated");
    },
  });

  const handleSubscriptionChange = (categoryId: number, checked: boolean) => {
    updateMutation.mutate({
      categoryId,
      subscribed: checked,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-secondary neo-border neo-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary text-primary-foreground neo-border">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Email Preferences</h2>
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary neo-border neo-shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary text-primary-foreground neo-border">
          <Mail className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Email Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Control what emails you receive
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-start justify-between p-4 bg-background neo-border"
          >
            <div className="flex-1 pr-4">
              <div className="font-black mb-1">{category.name}</div>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
              {category.forceSubscription && (
                <p className="text-xs text-muted-foreground mt-1 italic">
                  Required subscription
                </p>
              )}
            </div>
            <Switch
              checked={category.subscribed}
              onCheckedChange={(checked) =>
                handleSubscriptionChange(category.id, checked)
              }
              disabled={category.forceSubscription || updateMutation.isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

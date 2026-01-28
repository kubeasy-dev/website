"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { List, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import { useTRPC } from "@/trpc/client";

export function ProfileEmailPreferences() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: topics = [], isLoading } = useQuery({
    ...trpc.emailPreference.listTopics.queryOptions(),
  });

  const updateMutation = useMutation({
    ...trpc.emailPreference.updateSubscription.mutationOptions(),
    // Optimistic update for instant UI feedback
    onMutate: async (variables) => {
      const queryKey = trpc.emailPreference.listTopics.queryKey();

      // Cancel outgoing queries
      await queryClient.cancelQueries({
        queryKey,
      });

      // Snapshot previous value
      const previousTopics = queryClient.getQueryData(queryKey);

      // Optimistically update UI
      queryClient.setQueryData(queryKey, (old: typeof topics | undefined) => {
        if (!old) return old;
        return old.map((topic) =>
          topic.id === variables.topicId
            ? { ...topic, subscribed: variables.subscribed }
            : topic,
        );
      });

      return { previousTopics };
    },
    // Rollback on error
    onError: (error, _variables, context) => {
      if (context?.previousTopics) {
        const queryKey = trpc.emailPreference.listTopics.queryKey();
        queryClient.setQueryData(queryKey, context.previousTopics);
      }
      toast.error("Failed to update preferences", {
        description: error.message,
      });
      // Refetch on error to ensure we have the correct server state
      queryClient.invalidateQueries({
        queryKey: trpc.emailPreference.listTopics.queryKey(),
      });
    },
    // Don't invalidate on success - trust the optimistic update
    // Resend API may have eventual consistency, so refetching immediately
    // could return stale data and revert the toggle
    onSettled: () => {},
    onSuccess: () => {
      toast.success("Email preferences updated");
    },
  });

  const handleSubscriptionChange = (topicId: number, checked: boolean) => {
    updateMutation.mutate({
      topicId,
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

  // Don't show the section if there are no topics
  if (topics.length === 0) {
    return (
      <Empty>
        <EmptyMedia variant="icon">
          <List />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>No email topics found</EmptyTitle>
          <EmptyDescription>
            There are currently no email topics available to manage
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
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
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex items-start justify-between p-4 bg-background neo-border"
          >
            <div className="flex-1 pr-4">
              <div className="font-black mb-1">{topic.name}</div>
              {topic.description && (
                <p className="text-sm text-muted-foreground">
                  {topic.description}
                </p>
              )}
            </div>
            <Switch
              checked={topic.subscribed}
              onCheckedChange={(checked) =>
                handleSubscriptionChange(topic.id, checked)
              }
              disabled={updateMutation.isPending}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

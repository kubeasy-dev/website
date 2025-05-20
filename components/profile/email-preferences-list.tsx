"use client";

import useSupabase from "@/hooks/use-supabase";
import { queries } from "@/lib/queries";
import { useQuery, useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import Loading from "../loading";
import { Switch } from "@/components/ui/switch";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "../ui/separator";
import React from "react";
import posthog from "posthog-js";

export function EmailPreferencesList() {
  const supabase = useSupabase();
  const { data: emailSubscriptions, isLoading } = useQuery(queries.emailSubscriptions.list(supabase));

  const { data: user } = useUser();
  const { toast } = useToast();

  const { mutateAsync: updateEmailSubscription } = useUpdateMutation(supabase.from("email_subscriptions"), ["user_id", "category_id"], "subscribed,category_id", {
    onSuccess: (result) => {
      posthog.capture("email_preferences_updated", {
        category_id: result?.category_id,
        subscribed: result?.subscribed,
      });
      toast({
        title: "Success",
        description: `${result?.subscribed ? "Subscribed" : "Unsubscribed"} to ${emailSubscriptions?.find((emailSubscription) => emailSubscription.category_id === result?.category_id)?.email_category?.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "An error occurred while updating the email subscription",
        variant: "destructive",
      });
    },
  });

  const handleToggleSubscription = async (emailCategoryId: number, subscribed: boolean) => {
    if (!user) {
      return;
    }

    await updateEmailSubscription({ user_id: user.id, category_id: emailCategoryId, subscribed });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className='space-y-2'>
      {emailSubscriptions?.map((emailSubscription, index) => (
        <React.Fragment key={emailSubscription.category_id}>
          <div className='flex flex-row items-center justify-between py-4'>
            <div className='space-y-0.5'>
              <p className='font-medium'>{emailSubscription.email_category.name}</p>
              <p className='text-sm text-muted-foreground'>{emailSubscription.email_category.description}</p>
            </div>
            <Switch
              disabled={emailSubscription.email_category.force_subscription}
              checked={emailSubscription.subscribed}
              onCheckedChange={(checked) => (emailSubscription.email_category.force_subscription ? undefined : handleToggleSubscription(emailSubscription.category_id, checked))}
            />
          </div>
          {index < emailSubscriptions.length - 1 && <Separator />}
        </React.Fragment>
      ))}
    </div>
  );
}

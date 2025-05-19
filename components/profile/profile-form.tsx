"use client";

import { z } from "zod";
import useSupabase from "@/hooks/use-supabase";
import { useQuery, useUpdateMutation } from "@supabase-cache-helpers/postgrest-react-query";
import { queries } from "@/lib/queries";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { FormField } from "../ui/form";
import { Form, FormControl, FormDescription, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
import posthog from "posthog-js";

const updateProfileSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
});

type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export function ProfileForm() {
  const supabase = useSupabase();
  const { toast } = useToast();

  const { data: profile } = useQuery(queries.profile.get(supabase));

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      id: "",
      first_name: "",
      last_name: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.setValue("id", profile.id);
      form.setValue("first_name", profile.first_name);
      form.setValue("last_name", profile.last_name);
    }
  }, [profile, form]);

  const { mutateAsync: updateProfile } = useUpdateMutation(supabase.from("profiles"), ["id"], "id, first_name, last_name", {
    onSuccess: (data) => {
      if (!data) {
        return;
      }
      const { id, first_name, last_name } = data;
      posthog.capture("profile_updated", { first_name, last_name });
      posthog.identify(id, { name: `${first_name} ${last_name}` });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating your profile.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: UpdateProfileFormValues) => {
    const { id, first_name, last_name } = data;
    updateProfile({ id, first_name, last_name });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='first_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>This name will be used to identify you in the platform.</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='last_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>This name will be used to identify you in the platform.</FormDescription>
            </FormItem>
          )}
        />
        <Button type='submit'>Save</Button>
      </form>
    </Form>
  );
}

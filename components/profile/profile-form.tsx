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

const updateProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(1, { message: "Name is required" }),
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
      full_name: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.setValue("id", profile.id);
      form.setValue("full_name", profile.full_name);
    }
  }, [profile, form]);

  const { mutateAsync: updateProfile } = useUpdateMutation(supabase.from("profiles"), ["id"], "full_name", {
    onSuccess: () => {
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
    const { full_name, id } = data;
    updateProfile({ full_name, id });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='full_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
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

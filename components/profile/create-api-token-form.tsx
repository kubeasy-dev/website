"use client";

import React from "react";
import { z } from "zod";
import useSupabase from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "../ui/form";
import { useRevalidateTables } from "@supabase-cache-helpers/postgrest-react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { TriangleAlertIcon } from "lucide-react";
import { Terminal } from "@/components/terminal";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const createApiTokenSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

type CreateApiTokenFormValues = z.infer<typeof createApiTokenSchema>;

export function CreateApiTokenForm() {
  const supabase = useSupabase();
  const { toast } = useToast();
  const [result, setResult] = React.useState<null | string>(null);

  const form = useForm<CreateApiTokenFormValues>({
    resolver: zodResolver(createApiTokenSchema),
  });

  const revalidateTokens = useRevalidateTables([{ schema: "public", table: "api_tokens" }]);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: () => supabase.auth.getUser(),
    select: (res) => res.data.user,
    refetchOnWindowFocus: true,
  });

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center gap-4'>
        <p className='text-sm text-muted-foreground'>You need to be logged in to create an API token.</p>
      </div>
    );
  }

  const onSubmit = async (data: CreateApiTokenFormValues) => {
    const { name } = data;

    try {
      const { data: token, error } = await supabase.rpc("create_api_token", {
        user_id: user?.id,
        name: name,
      });
      if (error) {
        console.error("Error creating API token:", error);
        toast({
          title: "Error",
          description: "An error occurred while creating the API token",
          variant: "destructive",
        });
        return;
      }
      if (token) {
        setResult(token);
        revalidateTokens();
      }
    } catch (error) {
      console.error("Error creating API token:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating the API token",
        variant: "destructive",
      });
    }
  };

  if (result) {
    return (
      <div className='flex flex-col gap-1 mt-4'>
        <Alert variant='danger'>
          <TriangleAlertIcon className='h-4 w-4 text-yellow-800 dark:text-yellow-900' />
          <AlertTitle>API Token Created</AlertTitle>
          <AlertDescription>Here is your API token. Make sure to copy it, as you won&apos;t be able to see it again.</AlertDescription>
        </Alert>
        <div className='flex flex-col gap-2 pt-2'>
          <Terminal content={result} thingToCopy='Token' />
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div>
          <FormField
            control={form.control}
            name='name'
            defaultValue=''
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription>This name will be used to identify the API token. It can be anything you want.</FormDescription>
              </FormItem>
            )}
          />
        </div>
        <Button type='submit'>Create Api Token</Button>
      </form>
    </Form>
  );
}

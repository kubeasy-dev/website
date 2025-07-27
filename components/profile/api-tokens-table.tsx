"use client";

import { ApiToken } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDeleteMutation } from "@supabase-cache-helpers/postgrest-react-query";
import useSupabase from "@/hooks/use-supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Trash2Icon } from "lucide-react";
import posthog from "posthog-js";

export function ApiTokenTable({ tokens }: Readonly<{ tokens: ApiToken[] }>) {
  const supabase = useSupabase();
  const { toast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { mutateAsync: deleteToken } = useDeleteMutation(supabase.from("api_tokens") as any, ["id"], "name", {
    onSuccess: () => {
      posthog.capture("api_token_deleted");
      toast({
        title: "Success",
        description: "Token deleted successfully",
        variant: "default",
      });
    },
  });

  const columns: ColumnDef<ApiToken>[] = [
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "Created At",
      accessorKey: "created_at",
      cell: ({ cell }) => {
        const date = cell.getValue() as string;
        return new Date(date).toLocaleDateString("en-US") + " " + new Date(date).toLocaleTimeString("en-US");
      },
    },
    {
      header: "Token",
      cell: () => <p>*********</p>,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const token = row.original;
        return (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => {
              deleteToken(token);
            }}
          >
            <Trash2Icon className='h-4 w-4' />
          </Button>
        );
      },
    },
  ];

  return <DataTable columns={columns} data={tokens} />;
}

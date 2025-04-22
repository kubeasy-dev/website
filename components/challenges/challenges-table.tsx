import { ChallengeProgress } from "@/lib/types";
import { DataTable } from "@/components/ui/data-table";

export function ChallengesTable({ challenges }: { challenges: ChallengeProgress[] | null | undefined }) {
  const columns = [
    {
      header: "Name",
      accessorKey: "title",
    },
    {
      header: "Status",
      accessorKey: "status",
    },
    {
      header: "Difficulty",
      accessorKey: "difficulty",
    },
  ];

  if (!challenges) {
    return <p>No challenges found</p>;
  }

  return <DataTable columns={columns} data={challenges} />;
}

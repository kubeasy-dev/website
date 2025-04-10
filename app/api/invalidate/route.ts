import { Database } from "@/lib/database.types";
import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { TableName } from "@/lib/types";

type SupabaseEvent =
  {
    [T in TableName]:
      | {
          type: "INSERT";
          table: T;
          schema: string;
          record: Database["public"]["Tables"][T]["Row"];
          old_record: null;
        }
      | {
          type: "UPDATE";
          table: T;
          schema: string;
          record: Database["public"]["Tables"][T]["Row"];
          old_record: Database["public"]["Tables"][T]["Row"];
        }
      | {
          type: "DELETE";
          table: T;
          schema: string;
          record: null;
          old_record: Database["public"]["Tables"][T]["Row"];
        };
  }[TableName];

function processPayload(payload: SupabaseEvent): string[] {
  const tags: string[] = [];

  if (payload.table === "challenges" && (payload.type === "DELETE" || payload.type == "INSERT") ) {
    tags.push("challenges");
  }

  if (payload.table === "challenges" && payload.type === "UPDATE") {
    tags.push(`challenge`)
  }


  return tags;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SupabaseEvent;
    const paths = processPayload(body);

    for (const path of paths) {
      revalidatePath(path);
      console.log(`Revalidated path: ${path}`);
    }

    return Response.json({ success: true, revalidated: paths });
  } catch (err) {
    console.error("Revalidation error:", err);
    return Response.json({
      error: "Failed to revalidate cache",
      details: err,
    });
  }
}

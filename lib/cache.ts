import { Database } from "./database.types";
import { TableName } from "./types";

export function generateCacheTag<T extends TableName>(
  table: T,
  keys: Partial<Database["public"]["Tables"][T]["Row"]>,
  scope?: string
): string | null {

  const parts: string[] = [];

  for (const [key, value] of Object.entries(keys)) {
    if (value === undefined || value === null) {
      return null;
    }
    parts.push(`${key}=${value}`);
  }

  const base = `${table}:${parts.join(",")}`;
  return scope ? `${base}:${scope}` : base;
}
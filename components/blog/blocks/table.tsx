import { cn } from "@/lib/utils";
import type { NotionBlock } from "@/types/blog";
import { RichText } from "./text";

interface TableProps {
  block: NotionBlock;
  children?: React.ReactNode;
}

export function Table({ block, children }: TableProps) {
  if (!block.table) return null;

  return (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse neo-border-thick neo-shadow overflow-hidden">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

interface TableRowProps {
  block: NotionBlock;
  isHeader?: boolean;
  isFirstColumn?: boolean;
}

export function TableRow({ block, isHeader, isFirstColumn }: TableRowProps) {
  if (!block.table_row) return null;

  const { cells } = block.table_row;

  return (
    <tr className={cn(isHeader && "bg-secondary")}>
      {cells.map((cell, index) => {
        const isHeaderCell = isHeader || (isFirstColumn && index === 0);
        const Tag = isHeaderCell ? "th" : "td";

        return (
          <Tag
            key={index}
            className={cn(
              "border-2 border-foreground p-4 text-left",
              isHeaderCell &&
                "font-black bg-secondary uppercase text-sm tracking-wider",
            )}
          >
            <RichText richText={cell} />
          </Tag>
        );
      })}
    </tr>
  );
}

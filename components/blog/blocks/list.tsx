import { CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotionBlock } from "@/types/blog";
import { RichText } from "./text";

interface ListItemProps {
  block: NotionBlock;
  children?: React.ReactNode;
}

export function BulletedListItem({ block, children }: ListItemProps) {
  if (!block.bulleted_list_item) return null;

  return (
    <li className="flex items-start gap-3">
      <span className="mt-2.5 h-2 w-2 flex-shrink-0 bg-primary" />
      <div className="flex-1">
        <RichText richText={block.bulleted_list_item.rich_text} />
        {children && <ul className="mt-2 space-y-2">{children}</ul>}
      </div>
    </li>
  );
}

export function NumberedListItem({ block, children }: ListItemProps) {
  if (!block.numbered_list_item) return null;

  return (
    <li className="marker:text-primary marker:font-black">
      <RichText richText={block.numbered_list_item.rich_text} />
      {children && <ol className="mt-2 space-y-2">{children}</ol>}
    </li>
  );
}

export function TodoItem({ block, children }: ListItemProps) {
  if (!block.to_do) return null;

  const { rich_text, checked } = block.to_do;

  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex-shrink-0">
        {checked ? (
          <CheckSquare className="h-5 w-5 text-primary" />
        ) : (
          <Square className="h-5 w-5 text-muted-foreground" />
        )}
      </span>
      <span
        className={cn(
          "flex-1",
          checked && "line-through text-muted-foreground",
        )}
      >
        <RichText richText={rich_text} />
      </span>
      {children && <ul className="mt-2 space-y-2">{children}</ul>}
    </li>
  );
}

// Wrapper components for proper list structure
interface ListWrapperProps {
  children: React.ReactNode;
}

export function BulletedList({ children }: ListWrapperProps) {
  return <ul className="my-6 space-y-3 list-none">{children}</ul>;
}

export function NumberedList({ children }: ListWrapperProps) {
  return <ol className="my-6 space-y-3 list-decimal">{children}</ol>;
}

export function TodoList({ children }: ListWrapperProps) {
  return <ul className="my-6 space-y-3 list-none">{children}</ul>;
}

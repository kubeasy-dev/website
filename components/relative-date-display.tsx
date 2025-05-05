import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function RelativeDateDisplay({ stringDate, className }: Readonly<{ stringDate: string | null; className?: string }>) {
  if (!stringDate) {
    return <span className={cn("text-muted-foreground", className)}>Unknown</span>;
  }

  const parsedDate = new Date(stringDate);
  const relativeTime = !isNaN(parsedDate.getTime()) ? formatDistanceToNow(parsedDate, { addSuffix: true, locale: enUS }) : "Unknown";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("hover:cursor-help", className)}>{relativeTime}</span>
      </TooltipTrigger>
      <TooltipContent>
        <span>{parsedDate.toLocaleString()}</span>
      </TooltipContent>
    </Tooltip>
  );
}

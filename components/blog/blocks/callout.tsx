import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { NotionBlock } from "@/types/blog";
import { RichText } from "./text";

interface CalloutProps {
  block: NotionBlock;
}

// Map callout colors to neo-brutalist styles
const colorStyles: Record<
  string,
  { bg: string; border: string; icon: string; accent: string }
> = {
  default: {
    bg: "bg-secondary",
    border: "border-foreground",
    icon: "text-foreground",
    accent: "bg-foreground",
  },
  gray: {
    bg: "bg-gray-100 dark:bg-gray-900",
    border: "border-gray-900 dark:border-gray-100",
    icon: "text-gray-900 dark:text-gray-100",
    accent: "bg-gray-900 dark:bg-gray-100",
  },
  brown: {
    bg: "bg-amber-100 dark:bg-amber-950",
    border: "border-amber-900 dark:border-amber-200",
    icon: "text-amber-900 dark:text-amber-200",
    accent: "bg-amber-900 dark:bg-amber-200",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-950",
    border: "border-orange-600",
    icon: "text-orange-600",
    accent: "bg-orange-600",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-950",
    border: "border-yellow-600",
    icon: "text-yellow-700 dark:text-yellow-400",
    accent: "bg-yellow-600",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-950",
    border: "border-green-700",
    icon: "text-green-700 dark:text-green-400",
    accent: "bg-green-700",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-950",
    border: "border-blue-700",
    icon: "text-blue-700 dark:text-blue-400",
    accent: "bg-blue-700",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-950",
    border: "border-purple-700",
    icon: "text-purple-700 dark:text-purple-400",
    accent: "bg-purple-700",
  },
  pink: {
    bg: "bg-pink-100 dark:bg-pink-950",
    border: "border-pink-600",
    icon: "text-pink-600",
    accent: "bg-pink-600",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-950",
    border: "border-red-700",
    icon: "text-red-700 dark:text-red-400",
    accent: "bg-red-700",
  },
};

// Map colors to semantic icons
const colorIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  default: Info,
  gray: Info,
  brown: Info,
  orange: AlertTriangle,
  yellow: Lightbulb,
  green: CheckCircle,
  blue: Info,
  purple: Lightbulb,
  pink: Lightbulb,
  red: AlertCircle,
};

export function Callout({ block }: CalloutProps) {
  if (!block.callout) return null;

  const { rich_text, icon, color } = block.callout;
  const baseColor = color.replace("_background", "");
  const styles = colorStyles[baseColor] || colorStyles.default;
  const IconComponent = colorIcons[baseColor] || Info;

  // Get emoji or use default icon
  let iconContent: React.ReactNode;
  if (icon?.type === "emoji") {
    iconContent = <span className="text-2xl">{icon.emoji}</span>;
  } else if (icon?.type === "external") {
    iconContent = (
      // biome-ignore lint: External icon from Notion
      <img src={icon.external.url} alt="" className="h-6 w-6 object-contain" />
    );
  } else {
    iconContent = <IconComponent className={cn("h-6 w-6", styles.icon)} />;
  }

  return (
    <div
      className={cn(
        "my-8 flex gap-4 neo-border-thick p-5 relative",
        styles.bg,
        styles.border,
      )}
    >
      {/* Left accent bar */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 w-1.5", styles.accent)}
      />
      <div className="flex-shrink-0 ml-2">{iconContent}</div>
      <div className="flex-1 text-base leading-relaxed font-medium">
        <RichText richText={rich_text} />
      </div>
    </div>
  );
}

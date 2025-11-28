import { TrendingUp } from "lucide-react";
import type { Theme } from "@/types/trpc";
import { LucideIcon, type LucideIconName } from "./lucide-icon";

interface ThemeHeroProps {
  theme: Theme;
  totalChallenges: number;
}

export function ThemeHero({ theme, totalChallenges }: ThemeHeroProps) {
  return (
    <div className="bg-secondary text-foreground p-8 md:p-12 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
      <div className="flex items-start gap-6">
        {theme.logo && (
          <div className="p-6 bg-primary border-4 border-black shrink-0">
            <LucideIcon
              name={theme.logo as LucideIconName}
              className="h-12 w-12 text-primary-foreground"
            />
          </div>
        )}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-primary text-primary-foreground border-3 border-black font-black uppercase text-xs mb-3">
            <TrendingUp className="h-3 w-3" />
            <span>{totalChallenges} Challenges</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            {theme.name}
          </h1>
          <p className="text-xl font-bold opacity-90 max-w-3xl leading-relaxed">
            {theme.description}
          </p>
        </div>
      </div>
    </div>
  );
}

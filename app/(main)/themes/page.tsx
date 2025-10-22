import { TrendingUp } from "lucide-react";
import type { LucideIconName } from "@/components/lucide-icon";
import { ThemeCard } from "@/components/theme-card";
import { getThemes } from "@/server/db/queries";

// ISR: Revalidate every hour for SEO
export const revalidate = 3600;

export default async function ThemeListPage() {
  // Access database directly for static rendering (no headers/session needed)
  const themes = await getThemes();

  return (
    <div className="container mx-auto max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12 space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] uppercase text-sm">
          <TrendingUp className="h-4 w-4" />
          <span>Browse by Theme</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-balance leading-tight">
          Explore Kubernetes
          <br />
          <span className="text-primary">by Topic</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed font-bold">
          Dive deep into specific Kubernetes concepts. Each theme contains
          curated challenges to help you master that topic.
        </p>
      </div>

      {/* Theme Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <ThemeCard
            key={theme.slug}
            theme={{
              name: theme.name,
              slug: theme.slug,
              description: theme.description,
              logo: theme.logo as LucideIconName | null,
            }}
            progress={null}
          />
        ))}
      </div>
    </div>
  );
}

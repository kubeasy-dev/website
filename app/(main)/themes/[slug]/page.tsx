import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChallengesGrid } from "@/components/challenges-grid";
import { ThemeHero } from "@/components/theme-hero";
import { siteConfig } from "@/config/site";
import {
  generateBreadcrumbSchema,
  generateCourseSchema,
  generateMetadata as generateSEOMetadata,
  stringifyJsonLd,
} from "@/lib/seo";
import {
  getChallengeCountByTheme,
  getThemeBySlug,
  getThemes,
} from "@/server/db/queries";

// ISR: Revalidate every hour for SEO
export const revalidate = 3600;

// Generate static params for all themes at build time
export async function generateStaticParams() {
  const themes = await getThemes();

  return themes.map((theme) => ({
    slug: theme.slug,
  }));
}

// Generate dynamic metadata for each theme
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const theme = await getThemeBySlug(slug);

  if (!theme) {
    return {};
  }

  return generateSEOMetadata({
    title: `${theme.name} - Kubernetes Theme`,
    description: theme.description,
    url: `/themes/${theme.slug}`,
    keywords: [
      theme.name,
      `kubernetes ${theme.name.toLowerCase()}`,
      `learn ${theme.name.toLowerCase()}`,
      "kubernetes theme",
      ...siteConfig.keywords.slice(0, 5),
    ],
  });
}

function ChallengesGridSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }, (_, i) => `skeleton-${i}`).map((key) => (
        <div
          key={key}
          className="bg-secondary border-4 border-black neo-shadow p-6 animate-pulse h-64"
        />
      ))}
    </div>
  );
}

function ChallengesGridError() {
  return (
    <div className="text-center py-20">
      <p className="text-2xl font-black text-destructive">
        Failed to load challenges
      </p>
      <p className="text-lg font-bold text-muted-foreground mt-2">
        Please try again later
      </p>
    </div>
  );
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Verify theme exists (direct DB access for ISR)
  const theme = await getThemeBySlug(slug);

  if (!theme) {
    notFound();
  }

  // Generate structured data for this theme
  const courseSchema = generateCourseSchema({
    name: `${theme.name} - Kubernetes Learning Path`,
    description: theme.description,
    url: `/themes/${theme.slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Themes", url: "/themes" },
    { name: theme.name, url: `/themes/${theme.slug}` },
  ]);

  // Fetch challenge count for this theme with efficient SQL count query
  const totalChallenges = await getChallengeCountByTheme(slug);

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(courseSchema),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Safe JSON-LD structured data
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(breadcrumbSchema),
        }}
      />
      {/* Back Button */}
      <Link
        href="/themes"
        className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-secondary border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all font-black"
      >
        <ArrowLeft className="h-4 w-4" />
        All Themes
      </Link>

      {/* Theme Hero - Server rendered with ISR */}
      <ThemeHero theme={theme} totalChallenges={totalChallenges} />

      {/* Challenges Grid */}
      <ErrorBoundary fallback={<ChallengesGridError />}>
        <Suspense fallback={<ChallengesGridSkeleton />}>
          <ChallengesGrid filters={{ theme: slug }} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

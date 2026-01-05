import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChallengesGrid } from "@/components/challenges-grid";
import { TypeHero } from "@/components/type-hero";
import { siteConfig } from "@/config/site";
import {
  generateBreadcrumbSchema,
  generateCourseSchema,
  generateMetadata as generateSEOMetadata,
  stringifyJsonLd,
} from "@/lib/seo";
import {
  getChallengeCountByType,
  getTypeBySlug,
  getTypes,
} from "@/server/db/queries";

// Generate static params for all types at build time
export async function generateStaticParams() {
  const types = await getTypes();
  return types.map((type) => ({
    slug: type.slug,
  }));
}

// Generate dynamic metadata for each type
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const type = await getTypeBySlug(slug);

  if (!type) {
    return {};
  }

  return generateSEOMetadata({
    title: `${type.name} Challenges - Kubernetes Challenge Type`,
    description: type.description,
    url: `/types/${type.slug}`,
    keywords: [
      type.name,
      `kubernetes ${type.name.toLowerCase()} challenges`,
      `${type.name.toLowerCase()} kubernetes`,
      "kubernetes challenge type",
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
          className="bg-secondary neo-border-thick neo-shadow p-6 animate-pulse h-64"
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

export default async function TypePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  "use cache";
  cacheLife("hours");

  const { slug } = await params;
  cacheTag("types-page", `type-${slug}`);

  // Verify type exists (direct DB access with caching)
  const type = await getTypeBySlug(slug);

  if (!type) {
    notFound();
  }

  // Generate structured data for this type
  const courseSchema = generateCourseSchema({
    name: `${type.name} - Kubernetes Challenge Type`,
    description: type.description,
    url: `/types/${type.slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Types", url: "/types" },
    { name: type.name, url: `/types/${type.slug}` },
  ]);

  // Fetch challenge count for this type with efficient SQL count query
  const totalChallenges = await getChallengeCountByType(slug);

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
        href="/types"
        className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-secondary neo-border-thick neo-shadow hover:neo-shadow-lg hover:-translate-y-0.5 transition-all font-black"
      >
        <ArrowLeft className="h-4 w-4" />
        All Types
      </Link>

      {/* Type Hero - Server rendered with ISR */}
      <TypeHero type={type} totalChallenges={totalChallenges} />

      {/* Challenges Grid */}
      <ErrorBoundary fallback={<ChallengesGridError />}>
        <Suspense fallback={<ChallengesGridSkeleton />}>
          <ChallengesGrid filters={{ type: slug }} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

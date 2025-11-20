import { ArrowLeft, Clock } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { ChallengeMission } from "@/components/challenge-mission";
import { DifficultyBadge } from "@/components/dificulty-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";
import { generateMetadata as generateSEOMetadata, generateLearningResourceSchema, generateBreadcrumbSchema, stringifyJsonLd } from "@/lib/seo";
import { getChallengeBySlug, getChallenges } from "@/server/db/queries";

// ISR: Revalidate every hour for SEO
export const revalidate = 3600;

// Generate static params for all challenges at build time
export async function generateStaticParams() {
  const { challenges } = await getChallenges();

  return challenges.map((challenge) => ({
    slug: challenge.slug,
  }));
}

// Generate dynamic metadata for each challenge
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const challenge = await getChallengeBySlug(slug);

  if (!challenge) {
    return {};
  }

  const difficultyLabels: Record<string, string> = {
    easy: "Beginner",
    medium: "Intermediate",
    hard: "Advanced",
  };

  return generateSEOMetadata({
    title: challenge.title,
    description: challenge.description,
    url: `/challenges/${challenge.slug}`,
    keywords: [
      challenge.theme,
      difficultyLabels[challenge.difficulty],
      "kubernetes challenge",
      "kubernetes exercise",
      "hands-on kubernetes",
      ...siteConfig.keywords.slice(0, 5),
    ],
  });
}

export default async function ChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Access database directly for ISR (no headers/session needed)
  const challenge = await getChallengeBySlug(slug);

  if (!challenge) {
    return notFound();
  }

  const difficultyLabels: Record<string, string> = {
    easy: "Beginner",
    medium: "Intermediate",
    hard: "Advanced",
  };

  // Generate structured data for this challenge
  const learningResourceSchema = generateLearningResourceSchema({
    name: challenge.title,
    description: challenge.description,
    url: `/challenges/${challenge.slug}`,
    difficulty: difficultyLabels[challenge.difficulty],
    estimatedTime: challenge.estimatedTime,
    theme: challenge.theme,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Challenges", url: "/challenges" },
    { name: challenge.title, url: `/challenges/${challenge.slug}` },
  ]);

  return (
    <div className="container mx-auto max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(learningResourceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: stringifyJsonLd(breadcrumbSchema),
        }}
      />
      {/* Back Button */}
      <Button
        variant="ghost"
        className="mb-6 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        asChild
      >
        <Link href="/challenges">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Challenges
        </Link>
      </Button>

      {/* Challenge Header */}
      <div className="space-y-6 mb-8">
        <div className="flex flex-wrap items-center gap-3">
          <DifficultyBadge difficulty={challenge.difficulty} size="lg" />
          <Badge
            variant="secondary"
            className="capitalize border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-1.5 text-base font-bold"
          >
            {challenge.theme}
          </Badge>
          {challenge.ofTheWeek && (
            <Badge className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] px-4 py-1.5 text-base font-bold bg-accent text-black">
              Challenge of the Week
            </Badge>
          )}
        </div>

        <h1 className="text-5xl md:text-6xl font-black text-balance leading-tight">
          {challenge.title}
        </h1>
        <p className="text-xl text-foreground/80 leading-relaxed font-medium">
          {challenge.description}
        </p>

        <div className="flex flex-wrap gap-6 text-base font-bold">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <span>{challenge.estimatedTime} min</span>
          </div>
        </div>
      </div>

      <Separator className="my-8 h-1 bg-black" />

      {/* Initial Situation */}
      <Card className="mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-secondary">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6" />
            <CardTitle className="text-2xl font-black">
              Initial Situation
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base font-medium whitespace-pre-line">
            {challenge.initialSituation}
          </p>
        </CardContent>
      </Card>

      {/* Challenge Mission with Real-time Validation Status */}
      <ErrorBoundary fallback={<div>Error loading challenge status.</div>}>
        <Suspense
          fallback={
            <div className="p-6 bg-secondary border-4 border-black animate-pulse h-32" />
          }
        >
          <ChallengeMission slug={slug} objective={challenge.objective} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

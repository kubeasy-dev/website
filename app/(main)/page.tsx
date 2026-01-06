import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { CTASection } from "@/components/cta-section";
import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";
import { StatsSection } from "@/components/stats-section";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

// Lazy load below-the-fold components for better initial load performance
const HowItWorksSection = dynamic(
  () =>
    import("@/components/how-it-works-section").then(
      (mod) => mod.HowItWorksSection,
    ),
  { ssr: true },
);

const OpenSourceSection = dynamic(
  () =>
    import("@/components/open-source-section").then(
      (mod) => mod.OpenSourceSection,
    ),
  { ssr: true },
);

const EarlyAccessSection = dynamic(
  () =>
    import("@/components/early-access-section").then(
      (mod) => mod.EarlyAccessSection,
    ),
  { ssr: true },
);

export const metadata: Metadata = generateSEOMetadata({
  url: "/",
});

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <OpenSourceSection />
      <EarlyAccessSection />
      <CTASection />
    </div>
  );
}

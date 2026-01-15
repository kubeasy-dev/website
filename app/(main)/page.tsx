import type { Metadata } from "next";
import { CTASection } from "@/components/cta-section";
import { EarlyAccessSection } from "@/components/early-access-section";
import { FeaturesSection } from "@/components/features-section";
import { HeroSection } from "@/components/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { OpenSourceSection } from "@/components/open-source-section";
import { StatsSection } from "@/components/stats-section";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

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

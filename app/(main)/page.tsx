import { Separator } from "@/components/ui/separator";
import { HeroSection } from "@/components/landing/hero";
import { FeaturesSection } from "@/components/landing/features";
import { HowItWorksSection } from "@/components/landing/how-it-works";
import { OpenSourceSection } from "@/components/landing/open-source";
import { TestimonialsSection } from "@/components/landing/testimonials";
import { CTASection } from "@/components/landing/cta";

export default function Home() {
  return (
    <section>
      <HeroSection />
      <Separator className='my-12' />
      <FeaturesSection />
      <Separator className='my-12' />
      <HowItWorksSection />
      <Separator className='my-12' />
      <OpenSourceSection />
      <Separator className='my-12' />
      <TestimonialsSection />
      <CTASection />
    </section>
  );
}

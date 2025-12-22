"use client";

import { ArrowRight, Terminal } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { trackCtaClicked } from "@/lib/analytics";
import { InteractiveTerminal } from "./interactive-terminal";

export function HeroSection() {
  const handleCtaClick = (ctaText: string, targetUrl: string) => {
    trackCtaClicked(ctaText, "hero", targetUrl);
  };

  return (
    <section className="relative pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-bold neo-border neo-shadow">
              <Terminal className="h-4 w-4" />
              <span>CLI-Driven • Local Cluster • Free</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-balance">
              Break it. Fix it.{" "}
              <span className="text-primary">Learn Kubernetes.</span>
            </h1>

            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-xl">
              Solve real-world Kubernetes challenges on your own machine. Use
              the CLI to deploy broken scenarios, debug with kubectl, and get
              instant validation when you fix them.
            </p>

            <div className="space-x-4">
              <Button
                size="lg"
                className="text-base font-bold neo-border-thick neo-shadow-lg"
                asChild
              >
                <Link
                  href="/get-started"
                  onClick={() => handleCtaClick("Get Started", "/get-started")}
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                className="text-base font-bold bg-secondary text-foreground hover:bg-secondary/90 neo-border-thick neo-shadow-lg border-foreground"
                asChild
              >
                <Link
                  href="/challenges"
                  onClick={() =>
                    handleCtaClick("Browse Challenges", "/challenges")
                  }
                >
                  Browse Challenges
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 w-full">
            <InteractiveTerminal />
          </div>
        </div>
      </div>
    </section>
  );
}
